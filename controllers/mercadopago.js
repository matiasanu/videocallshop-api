const storeModel = require('../models/store');

const mercadopagoHelper = require('../helpers/mercadopago');

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

        // store given authorization code
        await storeModel.updateMercadopagoAuthorizationCode(storeId, code);

        // create access token though mercadopago api
        const credentials = await mercadopagoHelper.createStoreAccessTokenByAuthorizationCode(
            code,
            req.headers.host,
            storeId
        );

        if (credentials.access_token) {
            // store access tokens
            await storeModel.updateMercadopagoAccessToken(
                storeId,
                credentials.access_token,
                credentials.refresh_token,
                credentials
            );

            const status = 200;
            res.status(status);
            res.send({ status, credentials });
        } else {
            console.log('-- MERCADOPAGO ERROR --', credentials);
            const err = new Error(credentials.message);
            err.status = 500;
            return next(err);
        }
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

module.exports = { storeAuthorizationCode };
