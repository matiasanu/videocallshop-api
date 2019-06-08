const jwt = require('jsonwebtoken');

const jwtHelper = require('../helpers/jwt');
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

    try {
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
    } catch (err) {
        const status = 500;
        console.log(err);
        res.status(status);
        res.send({ status, message: err.message ? err.message : err });
    }
};

const removeClient = async (req, res, next) => {
    let { waitingRoomRequestId } = req.body;
    waitingRoomRequestId = parseInt(waitingRoomRequestId);

    // check request
    try {
        const requests = await waitingRoomModel.getRequest(
            waitingRoomRequestId
        );

        if (!requests.length) {
            throw new Error('Request is not exist');
        }

        const { storeId } = requests[0];

        //Check permissions
        const isTheClient =
            parseInt(req.jwtDecoded.waitingRoomRequestId) ===
            waitingRoomRequestId;
        const isAnAuthorizedSeller =
            (req.jwtDecoded.roleId == 1 || req.jwtDecoded.roleId == 2) &&
            parseInt(req.jwtDecoded.storeId) === storeId;

        console.log('isTheClient', isTheClient);
        console.log('isAnAuthorizedSeller', isAnAuthorizedSeller);

        if (!isTheClient && !isAnAuthorizedSeller) {
            const status = 401;
            res.status(status).send({
                status: status,
                message: 'Unauthorized',
            });

            return;
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
    } catch (err) {
        const status = 500;
        console.log(err);
        res.status(status);
        res.send({ status, message: err.message ? err.message : err });
    }
};

const getWaitingRoom = async (req, res, next) => {
    let { storeId } = req.params;
    storeId = parseInt(storeId);

    try {
        /* ToDo Move this to a middleware
         Check permissions
         1. If the storeId of the client token is the same of the store that want to view
         2. If is a seller of the store
        */

        if (parseInt(req.jwtDecoded.storeId) !== storeId) {
            console.log('.' + req.jwtDecoded.storeId !== storeId + '.');
            const status = 401;
            res.status(status).send({
                status: status,
                message: 'Unauthorized',
            });

            return;
        }

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
    } catch (err) {
        const status = 500;
        console.log(err);
        res.status(status);
        res.send({ status, message: err.message ? err.message : err });
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
};
