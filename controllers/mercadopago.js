const storeModel = require('../models/store');

const storeAuthorizationCode = async (req, res, next) => {
    try {
        const { storeId, code } = req.query;

        if (!storeId) {
            const err = new Error('Store param not found.');
            err.status = 404;
            return next(err);
        }

        const store = await storeModel.getStore(storeId);

        if (!store) {
            const err = new Error('Store not found.');
            err.status = 404;
            return next(err);
        }

        if (!code) {
            const err = new Error('Authorization code not found.');
            err.status = 422;
            return next(err);
        }

        await storeModel.storeMercadopagoAuthorizatinoCode(storeId, code);

        const status = 200;
        res.status(status);
        res.send({ status });
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

module.exports = { storeAuthorizationCode };
