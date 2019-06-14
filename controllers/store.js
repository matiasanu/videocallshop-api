const storeModel = require('../models/store');

const getStore = async (req, res, next) => {
    const { storeId } = req.params;

    const stores = await storeModel.getStore(storeId);

    if (!stores.length) {
        const err = new Error('Store not found.');
        err.status = 404;
        return next(err);
    }

    const status = 200;
    res.status(status);
    res.send({ status, data: stores[0] });
};

const getStores = async (req, res, next) => {
    const stores = await storeModel.getStores();

    const status = 200;
    res.status(status);
    res.send({ status, data: stores });
};

module.exports = { getStore, getStores };
