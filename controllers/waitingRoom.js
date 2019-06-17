const jwt = require('jsonwebtoken');

const waitingRoomModel = require('../models/waitingRoom');
const storeModel = require('../models/store');

const initRedisCli = require('../helpers/redis');

let redisCli = null;

(async () => {
    redisCli = await initRedisCli();
})();

const REQUESTED = 'REQUESTED';
const IN = 'IN';
const REMOVED = 'REMOVED';

const pushClient = async (req, res, next) => {
    try {
        const { name, lastName, email } = req.body;
        const { storeId } = req.params;

        // check store
        const stores = await storeModel.getStore(storeId);

        if (!stores.length) {
            const err = new Error('Invalid storeId.');
            err.status = 500;
            return next(err);
        }

        // check if another email is not into a queue
        const requests = await waitingRoomModel.searchRequests(email, IN);

        if (requests.length) {
            const err = new Error('Email already in use.');
            err.status = 409;
            return next(err);
        }

        // add request
        const waitingRoomRequestId = await waitingRoomModel.addRequest(
            storeId,
            email,
            name,
            lastName
        );

        await waitingRoomModel.setState(waitingRoomRequestId, REQUESTED);

        // push client into the waiting room
        const waitingRoomLength = await waitingRoomModel.pushClient(
            waitingRoomRequestId,
            storeId
        );

        await waitingRoomModel.setState(waitingRoomRequestId, IN);

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

        const jwtOptions = {
            expiresIn: '2h',
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, jwtOptions);

        const status = 200;
        res.status(status);
        res.set('Authorization', 'Bearer ' + token);
        res.send({ status, data: payload });
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

const removeClient = async (req, res, next) => {
    try {
        let { storeId, waitingRoomRequestId } = req.params;
        waitingRoomRequestId = parseInt(waitingRoomRequestId);
        storeId = parseInt(storeId);

        // check request
        const requests = await waitingRoomModel.getRequest(
            waitingRoomRequestId
        );

        if (!requests.length) {
            // request not founded
            const err = new Error('Request is not exist.');
            err.status = 500;
            return next(err);
        }

        const request = requests[0];

        if (request.storeId !== storeId) {
            // The request is not from this store
            const err = new Error('The request is not from this store');
            err.status = 500;
            return next(err);
        }

        const clientsAffected = await waitingRoomModel.removeClient(
            waitingRoomRequestId,
            storeId
        );

        if (clientsAffected) {
            await waitingRoomModel.setState(waitingRoomRequestId, REMOVED);
            await broadcastWaitingRoom(storeId);
        }

        const status = clientsAffected ? 200 : 404;
        const message = clientsAffected
            ? 'User Removed'
            : 'User not found in a waiting room';
        res.status(status);
        res.send({ status, message });
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

const getWaitingRoom = async (req, res, next) => {
    try {
        let { storeId } = req.params;
        storeId = parseInt(storeId);

        // check store
        const stores = await storeModel.getStore(storeId);

        if (!stores.length) {
            const err = new Error('Store not found.');
            err.status = 404;
            return next(err);
        }

        const waitingRoom = await waitingRoomModel.getWaitingRoom(storeId);

        const status = 200;
        res.status(status);
        res.send({ status, waitingRoom });
    } catch (err) {
        err.status = 500;
        return next(err);
    }
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
        return next();
    } catch (err) {
        socket.disconnect();
        return next(err);
    }
};

const socketConnection = async socket => {
    try {
        const storeId = socket.handshake.query.storeId;
        const myWaitingRoomId = `waitingRoom${storeId}`;

        // join to the socket.io room in order to listen when waiting room was changed
        socket.join(myWaitingRoomId, () => {
            let rooms = Object.keys(socket.rooms);
        });

        const waitingRoom = await waitingRoomModel.getWaitingRoom(storeId);

        socket.emit('WAITING_ROOM_SENDED', waitingRoom);

        socket.on('disconnect', function() {});
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
