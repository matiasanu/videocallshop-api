const jwt = require('jsonwebtoken');

const jwtHelper = require('../helpers/jwt'); //ToDo: Remove this helper
const waitingRoomModel = require('../models/waitingRoom');
const storeModel = require('../models/store');

const initRedisCli = require('../helpers/redis');

let redisCli = null;

(async () => {
    redisCli = await initRedisCli();
})();

const pushClient = async (req, res, next) => {
    const { name, lastName, email } = req.body;
    const { storeId } = req.params;

    // check store
    const stores = await storeModel.getStore(storeId);

    if (!stores.length) {
        throw new Error('Store is not exist');
    }

    // store request
    const waitingRoomRequestId = await waitingRoomModel.storeRequest(
        storeId,
        email,
        name,
        lastName
    );

    // push into the waiting room
    const waitingRoomLength = await waitingRoomModel.pushClient(
        waitingRoomRequestId,
        storeId
    );

    // broadcast waiting room to socket
    await broadcastWaitingRoom(storeId);

    // generate token response
    const payload = {
        name,
        lastName,
        email,
        waitingRoomRequestId,
        storeId,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    const status = 200;
    res.status(status);
    res.set('Authorization', 'Bearer ' + token);
    res.send({ status, data: payload });
};

const removeClient = async (req, res, next) => {
    let { storeId, waitingRoomRequestId } = req.params;
    waitingRoomRequestId = parseInt(waitingRoomRequestId);
    storeId = parseInt(storeId);

    // check request
    const requests = await waitingRoomModel.getRequest(waitingRoomRequestId);

    if (!requests.length) {
        // request not founded
        throw new Error('Request is not exist');
    }

    const request = requests[0];

    if (request.storeId !== storeId) {
        // The request is not from this store
        throw new Error('The request is not from this store');
    }

    const clientsAffected = await waitingRoomModel.removeClient(
        waitingRoomRequestId,
        storeId
    );

    if (clientsAffected) {
        await broadcastWaitingRoom(storeId);
    }

    const status = clientsAffected ? 200 : 404;
    const message = clientsAffected
        ? 'User Removed'
        : 'User not found in a waiting room';
    res.status(status);
    res.send({ status, message });
};

const getWaitingRoom = async (req, res, next) => {
    let { storeId } = req.params;
    storeId = parseInt(storeId);

    // check store
    const stores = await storeModel.getStore(storeId);

    if (!stores.length) {
        const status = 404;
        res.status(status);
        res.send({ status, message: 'Store not found.' });
        return;
    }

    const waitingRoom = await waitingRoomModel.getWaitingRoom(storeId);

    const status = 200;
    res.status(status);
    res.send({ status, waitingRoom });
};

const broadcastWaitingRoom = async storeId => {
    const waitingRoom = await waitingRoomModel.getWaitingRoom(storeId);
    const message = {
        type: 'WAITING_ROOM_CHANGED',
        value: waitingRoom,
    };
    redisCli.publish(`waitingRoom${storeId}`, JSON.stringify(message));
};

const socketMiddleware = async (socket, next) => {
    try {
        //ToDo: Integrate this to the authentication (no validate token again)
        let headerToken = socket.handshake.headers.authorization;
        headerToken = jwtHelper.getTokenFromHeader(headerToken);
        const jwtDecoded = jwt.verify(headerToken, process.env.JWT_SECRET);

        const storeIdRequested = parseInt(socket.handshake.query.storeId);

        const isAnAuthorizedSeller =
            (parseInt(jwtDecoded.roleId) === 1 ||
                parseInt(jwtDecoded.roleId) === 2) &&
            parseInt(jwtDecoded.storeId) === parseInt(storeIdRequested);

        const isAClient =
            parseInt(jwtDecoded.storeId) === parseInt(storeIdRequested);

        //Check permissions
        if (!isAnAuthorizedSeller && !isAClient) {
            throw new Error('Unauthorized');
        }

        return next();
    } catch (err) {
        socket.disconnect();
        return next(err);
    }
};

const socketConnection = async socket => {
    try {
        //ToDo: Get this information without validate token again
        let headerToken = socket.handshake.headers.authorization;
        headerToken = jwtHelper.getTokenFromHeader(headerToken);
        const jwtDecoded = jwt.verify(headerToken, process.env.JWT_SECRET);
        const waitingRoomRequestId = jwtDecoded.waitingRoomRequestId;

        const storeId = socket.handshake.query.storeId;
        const myWaitingRoomId = `waitingRoom${storeId}`;

        if (waitingRoomRequestId) {
            console.log(
                `waitingRoomRequestId ${waitingRoomRequestId} listening ${storeId}`
            );
        }

        // join to the socket.io room in order to listen when waiting room was changed
        socket.join(myWaitingRoomId, () => {
            let rooms = Object.keys(socket.rooms);
        });

        const waitingRoom = await waitingRoomModel.getWaitingRoom(storeId);

        socket.emit('WAITING_ROOM_SENDED', waitingRoom);

        socket.on('disconnect', function() {
            console.log(
                `waitingRoomRequestId ${waitingRoomRequestId} disconnected to ${storeId}`
            );
        });
    } catch (err) {
        socket.disconnect();
        console.log(
            '------ ERROR EN EL HANDLER CONNECT DEL SOCKET ------',
            err.message
        );
    }
};

module.exports = {
    pushClient,
    removeClient,
    getWaitingRoom,
    socketMiddleware,
    socketConnection,
};
