const storeModel = require('../models/store');

const storeExists = async (req, res, next) => {
    const err = new Error('Store does not exists');
    err.status = 404;

    const storeId = req.params.storeId || req.body.storeId;
    if (!storeId) {
        return next(err);
    }

    const store = await storeModel.getStore(storeId);
    if (!store) {
        return next(err);
    }

    next();
};

module.exports = {
    storeExists,
};
