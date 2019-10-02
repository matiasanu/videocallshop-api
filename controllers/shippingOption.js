const shippingOptionModel = require('../models/shippingOption');

const getShippingOption = async (req, res, next) => {
    try {
        const { shippingOptionId } = req.params;

        const shippingOption = await shippingOptionModel.getShippingOption(
            shippingOptionId
        );

        if (!shippingOption) {
            const err = new Error('Shipping option not found.');
            err.status = 404;
            return next(err);
        }

        const status = 200;
        res.status(status);
        res.send({ status, data: shippingOption });
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

const getShippingOptions = async (req, res, next) => {
    try {
        const shippingOptions = await shippingOptionModel.getShippingOptions();

        const status = 200;
        res.status(status);
        res.send({ status, data: shippingOptions });
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

module.exports = { getShippingOption, getShippingOptions };
