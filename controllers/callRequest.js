//helpers
const jwtHelper = require('../helpers/jwt');
const emailHelper = require('../helpers/email');

// models
const waitingRoomModel = require('../models/waitingRoom');
const callRequestModel = require('../models/callRequest');

const NEW = 'NEW';
const IN_QUEUE = 'IN_QUEUE';
const CALLED = 'CALLED';
const CANCELLED = 'CANCELLED';
const FINISHED = 'FINISHED';

const createCallRequest = async (req, res, next) => {
    try {
        const { email, name, lastName } = req.body;
        const storeId = parseInt(req.params.storeId);

        // checks if another email is not into a queue
        const inQueue = await waitingRoomModel.findCallRequestInQueueByEmail(
            email
        );

        if (inQueue) {
            const err = new Error('Email already in use.');
            err.status = 409;
            return next(err);
        }

        // processes call request

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
        err.status = 500;
        return next(err);
    }
};

const cancelCallRequest = async (req, res, next) => {
    try {
        // authorization
        const hasAccess =
            req.authorization.storeUser.thisStore ||
            (req.authorization.callRequestToken.thisStore &&
                req.authorization.callRequestToken.thisCallRequest);

        if (!hasAccess) {
            const err = new Error('Unauthorized.');
            err.status = 404;
            return next(err);
        }

        // processes cancel call request
        const { storeId, callRequestId } = req.params;

        // checks if is not already cancelled
        const callRequest = await callRequestModel.getCallRequest(
            callRequestId
        );

        if (!callRequest) {
            throw new Error('Call request not found.');
        }

        if (callRequest.state === CANCELLED) {
            const err = new Error('The call request is already cancelled.');
            err.status = 400;
            return next(err);
        }

        const {
            waitingRoomId,
        } = await waitingRoomModel.getWaitingRoomByStoreId(storeId);

        const callRequestsAffected = await waitingRoomModel.removeCallRequestInQueue(
            waitingRoomId,
            callRequestId
        );

        await callRequestModel.setState(callRequestId, CANCELLED);

        const status = 200;
        res.send({ status });
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

const finishCallRequest = async (req, res, next) => {
    try {
        // authorization
        const hasAccess =
            req.authorization.storeUser.thisStore ||
            (req.authorization.callRequestToken.thisStore &&
                req.authorization.callRequestToken.thisCallRequest);

        if (!hasAccess) {
            const err = new Error('Unauthorized.');
            err.status = 404;
            return next(err);
        }

        // processes patch call request
        const { callRequestId } = req.params;

        // checks if is called
        const callRequest = await callRequestModel.getCallRequest(
            callRequestId
        );

        if (!callRequest) {
            throw new Error('Call request not found.');
        }

        if (callRequest.state !== CALLED) {
            const err = new Error('The call request is not in CALLED state.');
            err.status = 400;
            return next(err);
        }

        await callRequestModel.setState(callRequestId, FINISHED);

        emailHelper.sendFinishedCallRequest();

        const status = 200;
        res.send({ status });
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

const getCallRequest = async (req, res, next) => {
    try {
        // authorization
        const hasAccess =
            req.authorization.storeUser.thisStore ||
            req.authorization.callRequestToken.thisStore;

        if (!hasAccess) {
            const err = new Error('Unauthorized.');
            err.status = 401;
            return next(err);
        }

        // returns call request
        const { callRequestId } = req.params;
        const callRequest = await callRequestModel.getCallRequest(
            callRequestId
        );

        if (!callRequest) {
            throw new Error('Call request does not exist.');
        }

        const status = 200;
        res.send({ status, data: callRequest });
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

module.exports = {
    createCallRequest,
    cancelCallRequest,
    getCallRequest,
    finishCallRequest,
};
