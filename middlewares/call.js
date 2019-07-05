const callModel = require('../models/call');
const callRequestModel = require('../models/callRequest');

const callExists = async (req, res, next) => {
    const err = new Error('Call does not exists');
    err.status = 404;

    const callId = req.params.callId || req.body.callId;
    if (!callId) {
        return next(err);
    }

    const call = await callModel.getCall(callId);
    if (!call) {
        return next(err);
    }

    next();
};

const isCallFromStore = async (req, res, next) => {
    const err = new Error('Unauthorized.');
    err.status = 401;

    const callId = req.params.callId || req.body.callId;
    const storeId = req.params.storeId || req.body.storeId;
    const call = await callModel.getCall(callId);
    if (!call) {
        const err = new Error('Call does not exist.');
        err.status = 404;
        return next(err);
    }
    const callRequest = await callRequestModel.getCallRequest(call.callId);

    if (
        !callId ||
        !storeId ||
        parseInt(storeId) !== parseInt(callRequest.storeId)
    ) {
        return next(err);
    }

    next();
};

module.exports = {
    callExists,
    isCallFromStore,
};
