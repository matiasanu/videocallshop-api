//helpers
const jwtHelper = require('../helpers/jwt');

// models
const waitingRoomModel = require('../models/waitingRoom');
const callRequestModel = require('../models/callRequest');

const NEW = 'NEW';
const IN_QUEUE = 'IN_QUEUE';
const OUT_QUEUE = 'OUT_QUEUE';
const CALLED = 'CALLED';

const createCallRequest = async (req, res, next) => {
    try {
        const { email, name, lastName } = req.body;
        const storeId = parseInt(req.params.storeId);

        // checks if another email is not into a queue
        const callRequest = await waitingRoomModel.findCallRequestInQueue(
            email
        );

        if (callRequest) {
            const err = new Error('Email already in use.');
            err.status = 409;
            return next(err);
        }

        // processes call request
        try {
            // gets waiting room
            const waitingRoom = await waitingRoomModel.getWaitingRoomByStoreId(
                storeId
            );

            if (!waitingRoom) {
                throw new Error('Waiting room does not exist');
            }

            const { waitingRoomId } = waitingRoom;

            // creates call request and push them in queue
            const callRequestId = await callRequestModel.createCallRequest(
                storeId,
                email,
                name,
                lastName,
                NEW
            );

            await callRequestModel.setState(callRequestId, NEW);

            await waitingRoomModel.pushCallRequestInQueue(
                waitingRoomId,
                callRequestId
            );

            await callRequestModel.setState(callRequestId, IN_QUEUE);

            // get created call request
            const callRequestCreated = await callRequestModel.getCallRequest(
                callRequestId
            );

            // generate jwt and response
            const jwt = jwtHelper.generateJwt(callRequestCreated);

            const status = 200;
            res.status(status);
            res.set('Authorization', 'Bearer ' + jwt);
            res.send({ status, data: callRequestCreated });
        } catch (err) {
            //Logger
            console.log('ERROR - createCallRequest fn', err);
            let myErr = new Error('Can not process the request.');
            myErr.status = 500;
            return next(myErr);
        }

        /*
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
        */
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

module.exports = {
    createCallRequest,
};
