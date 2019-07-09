const callModel = require('../models/call');
const callRequestModel = require('../models/callRequest');

const callExists = async (req, res, next) => {
    const callId = req.params.callId || req.body.callId;
    if (!callId) {
        const err = new Error('Call does not exists');
        err.status = 400;
        return next(err);
    }

    try {
        const call = await callModel.getCall(callId);
    } catch (err) {
        err.status = 400;
        return next(err);
    }

    next();
};

const isCallFromStore = async (req, res, next) => {
    try {
        const callId = req.params.callId || req.body.callId;
        const storeId = req.params.storeId || req.body.storeId;
        const call = await callModel.getCall(callId);
        const callRequest = await callRequestModel.getCallRequest(call.callId);

        if (
            !callId ||
            !storeId ||
            parseInt(storeId) !== parseInt(callRequest.storeId)
        ) {
            throw new Error('Call is not from the store.');
        }

        next();
    } catch (err) {
        err.status = 400;
        return next(err);
    }
};

module.exports = {
    callExists,
    isCallFromStore,
};
