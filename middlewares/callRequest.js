const callRequestModel = require('../models/callRequest');

const callRequestExists = async (req, res, next) => {
    const err = new Error('Call request does not exists');
    err.status = 404;

    const callRequestId = req.params.callRequestId || req.body.callRequestId;
    if (!callRequestId) {
        return next(err);
    }

    const callRequest = await callRequestModel.getCallRequest(callRequestId);
    if (!callRequest) {
        return next(err);
    }

    next();
};

const isCallRequestFromStore = async (req, res, next) => {
    const err = new Error('Unauthorized.');
    err.status = 401;

    const callRequestId = req.params.callRequestId || req.body.callRequestId;
    const storeId = req.params.storeId || req.body.storeId;
    const callRequest = await callRequestModel.getCallRequest(callRequestId);
    console.log(callRequestId, storeId, callRequest);

    if (
        !callRequestId ||
        !storeId ||
        parseInt(storeId) !== parseInt(callRequest.storeId)
    ) {
        return next(err);
    }

    next();
};

module.exports = {
    callRequestExists,
    isCallRequestFromStore,
};
