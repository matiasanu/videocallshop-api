const videocallHelper = require('../helpers/videocall');
const callModel = require('../models/call');
const callRequestModel = require('../models/callRequest');
const waitingRoomModel = require('../models/waitingRoom');

const CALLED = 'CALLED';

const getCall = async (req, res, next) => {
    try {
        const { callId } = req.params;
        const call = await callModel.getCall(callId);

        const status = 200;
        res.status(status);
        res.send({ status, data: call });
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

const callClient = async (req, res, next) => {
    try {
        // authorization
        const hasAccess = req.authorization.storeUser.thisStore;

        if (!hasAccess) {
            const err = new Error('Unauthorized.');
            err.status = 404;
            return next(err);
        }

        const { storeId } = req.params;
        const { callRequestId } = req.body;

        const inQueue = await waitingRoomModel.findCallRequestInQueue(
            callRequestId
        );

        if (!inQueue) {
            const err = new Error('Call request does not in queue.');
            err.status = 422;
            return next(err);
        }

        const { sessionId } = await videocallHelper.createSession();

        const storeUserId = req.session.storeUser.storeUserId;
        const callId = await callModel.registerCall(
            callRequestId,
            sessionId,
            storeUserId
        );

        console.log('--- storeId', storeId);

        const {
            waitingRoomId,
        } = await waitingRoomModel.getWaitingRoomByStoreId(storeId);

        console.log('--- waitingRoomId', waitingRoomId);
        console.log('--- callRequestId', callRequestId);

        await waitingRoomModel.removeCallRequestInQueue(
            waitingRoomId,
            callRequestId
        );

        await callRequestModel.setState(callRequestId, CALLED);

        const call = await callModel.getCall(callId);

        const status = 200;
        res.status(status);
        res.send({ status, data: call });
    } catch (err) {
        //Logger
        console.log('ERROR - callClient fn', err);
        let myErr = new Error('Can not process the request.');
        myErr.status = 500;
        return next(myErr);
    }
};

const isValidCall = async (req, res, next) => {
    let { storeId } = req.params;
    let callId = req.params.callId || req.body.callId;
    callId = parseInt(callId);
    storeId = parseInt(storeId);

    // check call
    const calls = await callModel.getCall(callId);

    if (!calls.length) {
        // call not founded
        const err = new Error('Call is not exist.');
        err.status = 500;
        return next(err);
    }

    const call = calls[0];
    const { waitingRoomRequestId } = call;

    const requests = await waitingRoomModel.getRequest(waitingRoomRequestId);
    request = requests[0];

    if (request.storeId !== storeId) {
        // The request is not from this store
        const err = new Error('The call is not from this store');
        err.status = 401;
        return next(err);
    }

    next();
};

module.exports = {
    callClient,
    getCall,
    isValidCall,
};
