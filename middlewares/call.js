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
            throw new Error('Unauthorized.');
        }

        next();
    } catch (err) {
        const myErr = new Error('Bad Request.');
        myErr.status = 400;
        return next(myErr);
    }
};

module.exports = {
    callExists,
    isCallFromStore,
};
