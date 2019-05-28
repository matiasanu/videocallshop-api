const waitingRoomModel = require('../models/waitingRoom');

let redisCli = null;

(async () => {
    redisCli = await initRedisCli();
})();

pushClient = async (req, res, next) => {
    const { name, clientId, storeId } = req.body;
    try {
        const clientsAffected = await waitingRoomModel.pushClient(
            clientId,
            storeId
        );

        if (clientsAffected) {
            //TODO move this repeated function
            const waitingRoom = await waitingRoomModel.getWaitingRoom(storeId);
            const message = {
                type: 'WAITING_ROOM_CHANGED',
                value: waitingRoom,
            };
            redisCli.publish(`waitingRoom${storeId}`, JSON.stringify(message));
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

removeClient = async (req, res, next) => {
    const { clientId, storeId } = req.params;
    try {
        const clientsAffected = await waitingRoomModel.removeClient(
            clientId,
            storeId
        );

        if (clientsAffected) {
            //TODO move this repeated function
            const waitingRoom = await waitingRoomModel.getWaitingRoom(storeId);
            const message = {
                type: 'WAITING_ROOM_CHANGED',
                value: waitingRoom,
            };
            redisCli.publish(`waitingRoom${storeId}`, JSON.stringify(message));
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

getWaitingRoom = async (req, res, next) => {
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

module.exports = {
    pushClient,
    removeClient,
    getWaitingRoom,
};
