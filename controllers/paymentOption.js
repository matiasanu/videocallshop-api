const paymentOptionModel = require('../models/paymentOption');

const getPaymentOption = async (req, res, next) => {
    try {
        const { paymentOptionId } = req.params;

        const paymentOption = await paymentOptionModel.getPaymentOption(
            paymentOptionId
        );

        if (!paymentOption) {
            const err = new Error('Payment option not found.');
            err.status = 404;
            return next(err);
        }

        const status = 200;
        res.status(status);
        res.send({ status, data: paymentOption });
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

const getPaymentOptions = async (req, res, next) => {
    try {
        const paymentOptions = await paymentOptionModel.getPaymentOptions();

        const status = 200;
        res.status(status);
        res.send({ status, data: paymentOptions });
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

module.exports = { getPaymentOption, getPaymentOptions };
