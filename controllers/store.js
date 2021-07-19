const storeModel = require('../models/store');

const mercadopagoHelper = require('../helpers/mercadopago');

const getStore = async (req, res, next) => {
    try {
        const { storeId } = req.params;

        const store = await storeModel.getStore(storeId);

        if (!store) {
            const err = new Error('Store not found.');
            err.status = 404;
            return next(err);
        }

        const status = 200;
        res.status(status);
        res.send({ status, data: store });
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

const getAuthorizationUrl = async (req, res, next) => {
    try {
        const { storeId } = req.params;

        const store = await storeModel.getStore(storeId);

        console.log(':::::::: HOST', req.headers.host);

        let url = mercadopagoHelper.getAuthorizationUrl(
            store,
            req.protocol,
            req.headers.host
        );

        console.log('--- URL ---', url);

        res.redirect(url);
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

module.exports = { getStore, getStores, getAuthorizationUrl };
