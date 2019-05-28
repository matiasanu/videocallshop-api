const waitingRoomModel = require('../models/waitingRoom');

const initRedisCli = require('../helpers/redis');

let redisCli = null;

(async () => {
    redisCli = await initRedisCli();
})();

const pushClient = async (req, res, next) => {
    const { name, clientId, storeId } = req.body;
    try {
        const clientsAffected = await waitingRoomModel.pushClient(
            clientId,
            storeId
        );

        if (clientsAffected) {
            broadcastWaitingRoom(storeId);
        }

        const status = 200;
        const message = clientsAffected
            ? 'User Added'
            : 'User already in waiting room';
        res.status(status);
        res.send({ status, message });
    } catch (err) {
        const status = 500;
        console.log(err);
        res.status(status);
        res.send({ status, message: err.message ? err.message : err });
    }
};

const removeClient = async (req, res, next) => {
    const { clientId, storeId } = req.params;
    try {
        const clientsAffected = await waitingRoomModel.removeClient(
            clientId,
            storeId
        );

        if (clientsAffected) {
            broadcastWaitingRoom(storeId);
        }

        const status = clientsAffected ? 200 : 404;
        const message = clientsAffected
            ? 'User Removed'
            : 'User not found in a waiting room';
        res.status(status);
        res.send({ status, message });
    } catch (err) {
        const status = 500;
        console.log(err);
        res.status(status);
        res.send({ status, message: err.message ? err.message : err });
    }
};

const getWaitingRoom = async (req, res, next) => {
    const { storeId } = req.params;
    try {
        const waitingRoom = await waitingRoomModel.getWaitingRoom(storeId);

        const status = 200;
        res.status(status);
        res.send({ status, waitingRoom });
    } catch (err) {
        const status = 500;
        console.log(err);
        res.status(status);
        res.send({ status, message: err.message ? err.message : err });
    }
};

const checkSocketConnectionParams = (socket, next) => {
    // TODO: store stores in postgres DB
    const stores = [
        { storeId: 1, name: 'Sport 78' },
        { storeId: 2, name: 'Blast' },
        { storeId: 3, name: 'Mc Donals' },
    ];

    try {
        var storeId = socket.request._query.storeId;
        var clientId = socket.request._query.clientId;

        console.log(
            `Middleware: Trying to connect clientId ${clientId} to storeId ${storeId}`
        );

        let storeFound = false;

        stores.forEach(store => {
            if (store.storeId == storeId) {
                storeFound = true;
            }
        });

        if (!storeFound) {
            console.log('The storeId number is not valid');
            return next(
                new Error('Middleware: The storeId number is not valid')
            );
        }

        if (clientId.length < 3) {
            console.log('The clientId number is not valid');
            return next(
                new Error('Middleware: The clientId number is not valid')
            );
        }

        next();
    } catch (err) {
        return next(new Error(err));
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

module.exports = {
    pushClient,
    removeClient,
    getWaitingRoom,
    checkSocketConnectionParams,
};
