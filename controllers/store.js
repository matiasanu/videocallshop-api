const storeModel = require('../models/store');

const getStore = async (req, res, next) => {
    try {
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
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

const getStores = async (req, res, next) => {
    try {
        const stores = await storeModel.getStores();

        const status = 200;
        res.status(status);
        res.send({ status, data: stores });
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

module.exports = { getStore, getStores };
