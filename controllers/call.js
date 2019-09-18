// models
const videocallHelper = require('../helpers/videocall');
const callModel = require('../models/call');
const callRequestModel = require('../models/callRequest');
const waitingRoomModel = require('../models/waitingRoom');

// helpers
const pushNotificationHelper = require('../helpers/pushNotification');

// consts
const CALLED = 'CALLED';
const PROCESSING_CALL = 'PROCESSING_CALL';
const IN_QUEUE = 'IN_QUEUE';

const getCall = async (req, res, next) => {
    // authorization
    try {
        const hasAccess =
            req.authorization.storeUser.thisStore ||
            (req.authorization.callRequestToken.thisStore &&
                req.authorization.callRequestToken.thisCall);

        if (!hasAccess) {
            throw new Error('Unauthorized.');
        }
    } catch (err) {
        const myErr = new Error('Unauthorized.');
        myErr.status = 401;
        return next(myErr);
    }

    try {
        const { callId } = req.params;
        const call = await callModel.getCall(callId);

        if (!req.authorization.storeUser.thisStore) {
            delete call.tokboxTokenStoreUser;
        }

        if (!req.authorization.callRequestToken.thisCall) {
            delete call.tokboxTokenCallRequest;
        }

        const status = 200;
        res.status(status);
        res.send({ status, data: call });
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

const getCalls = async (req, res, next) => {
    // authorization
    try {
        const hasAccess =
            req.authorization.storeUser.thisStore ||
            req.authorization.callRequestToken.thisCallRequest;
        if (!hasAccess) {
            throw new Error('Unauthorized.');
        }
    } catch (err) {
        const myErr = new Error('Unauthorized.');
        myErr.status = 401;
        return next(myErr);
    }

    try {
        const { storeId } = req.params;
        let filters = {};

        if (req.query.callRequestId) {
            filters.callRequestId = req.query.callRequestId;
        }

        if (req.query.storeUserId) {
            filters.storeUserId = req.query.storeUserId;
        }

        if (req.query.state) {
            filters.state = req.query.state;
        }

        const calls = await callModel.findCallsByStoreId(storeId, filters);
        calls.forEach(call => {
            if (!req.authorization.storeUser.thisStore) {
                delete call.tokboxTokenStoreUser;
            }

            if (!req.authorization.callRequestToken.thisCallRequest) {
                delete call.tokboxTokenCallRequest;
            }
        });

        const status = 200;
        res.status(status);
        res.send({ status, data: calls });
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

const callClient = async (req, res, next) => {
    // authorization
    try {
        const hasAccess = req.authorization.storeUser.thisStore;

        if (!hasAccess) {
            throw new Error('Unauthorized.');
        }
    } catch (err) {
        let myErr = new Error('Unauthorized.');
        myErr.status = 401;
        return next(myErr);
    }

    // is the store user in call
    const currentCall = await callModel.getCallsByStoreUserAndState(
        req.session.storeUser.storeUserId,
        CALLED
    );

    if (currentCall.length) {
        const err = new Error('You are already in call.');
        err.status = 409;
        return next(err);
    }

    // get params
    const { storeId } = req.params;
    const { callRequestId } = req.body;

    const { waitingRoomId } = await waitingRoomModel.getWaitingRoomByStoreId(
        storeId
    );

    // remove the call request from the queue
    const membersAffected = await waitingRoomModel.removeCallRequestInQueue(
        waitingRoomId,
        callRequestId
    );

    if (!membersAffected) {
        const err = new Error('Call request does not in queue.');
        err.status = 409;
        return next(err);
    }

    // process the call
    try {
        await callRequestModel.setState(callRequestId, PROCESSING_CALL);

        // create tokbox session
        const { sessionId } = await videocallHelper.createSession();

        const tokenStoreUser = videocallHelper.generateToken(sessionId, {
            role: 'moderator',
        });

        const tokenCallRequest = videocallHelper.generateToken(sessionId, {
            role: 'publisher',
        });

        // register call
        const storeUserId = req.session.storeUser.storeUserId;
        const callId = await callModel.registerCall(
            callRequestId,
            storeUserId,
            sessionId,
            tokenStoreUser,
            tokenCallRequest
        );

        await callRequestModel.setState(callRequestId, CALLED);

        const call = await callModel.getCall(callId);
        delete call.tokboxTokenStoreUser;

        // send push notification
        const callRequest = await callRequestModel.getCallRequest(
            callRequestId
        );
        if (callRequest.onesignalPlayerId) {
            pushNotificationHelper.sendPushNotification(
                'Has sido llamado por la tienda',
                [callRequest.onesignalPlayerId],
                { type: CALLED, callRequest, call }
            );
        }

        // send response
        const status = 200;
        res.status(status);
        res.send({ status, data: call });
    } catch (err) {
        await waitingRoomModel.pushCallRequestInQueue(
            waitingRoomId,
            callRequestId
        );

        await callRequestModel.setState(callRequestId, IN_QUEUE);

        err.status = 500;
        return next(err);
    }
};

module.exports = {
    callClient,
    getCall,
    getCalls,
};
