var OpenTok = require('opentok');

const waitingRoomCtrl = require('../controllers/waitingRoom');
const callModel = require('../models/call');
const waitingRoomModel = require('../models/waitingRoom');

const getCall = async (req, res, next) => {
    try {
        const { callId } = req.params;
        const calls = await callModel.getCall(callId);

        const status = 200;
        res.status(status);
        res.send({ status, data: calls[0] });
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

const callClient = async (req, res, next) => {
    const { storeId } = req.params;
    const { waitingRoomRequestId } = req.body;

    // Generate tokbox session id
    var opentok = new OpenTok(
        process.env.TOKBOX_API_KEY,
        process.env.TOKBOX_API_SECRET
    );

    opentok.createSession({ mediaMode: 'routed' }, async (error, session) => {
        if (error) {
            console.log('Error creating session:', error);
        } else {
            try {
                const tokboxSessionId = session.sessionId;
                console.log('Session ID: ' + tokboxSessionId);

                // ToDo: Uncouple controllers (business logic layer)
                await waitingRoomCtrl.setRequestCalled(
                    storeId,
                    waitingRoomRequestId
                );

                const storeUserId = req.session.user.storeUserId;
                const callId = await callModel.registerCall(
                    waitingRoomRequestId,
                    tokboxSessionId,
                    storeUserId
                );

                //ToDo: Implement push notifications

                const status = 200;
                res.status(status);
                res.send({ status, data: { tokboxSessionId, callId } });
                next();
            } catch (err) {
                err.status = 500;
                return next(err);
            }
        }
    });
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
