const callRequestModel = require('../models/callRequest');
const purchaseOrderModel = require('../models/purchaseOrder');

const CALLED = 'CALLED';

const createPurchaseOrder = async (req, res, next) => {
    // authorization
    try {
        const hasAccess = req.authorization.storeUser.thisStore;

        if (!hasAccess) {
            throw new Error('Unauthorized.');
        }
    } catch (err) {
        let myErr = new Error('Unauthorized.');
        myErr.status = 401;
        return next(myErr);
    }

    // check if call request is called
    const { callRequestId } = req.params;
    const callRequest = await callRequestModel.getCallRequest(callRequestId);

    if (!callRequest) {
        throw new Error('Call request not found.');
    }

    if (callRequest.state !== CALLED) {
        const err = new Error('The call request is not in CALLED state.');
        err.status = 400;
        return next(err);
    }

    // create purchase order
    try {
        const {
            shippingOptionId,
            shippingPrice,
            paymentOptionId,
            province,
            city,
            address,
            items,
        } = req.body;

        // create mercadopago preference

        const purchaseOrderId = await purchaseOrderModel.createPurchaseOrder(
            callRequestId,
            shippingOptionId,
            shippingPrice,
            paymentOptionId,
            province,
            city,
            address
        );

        const itemIds = await purchaseOrderModel.addItems(
            purchaseOrderId,
            items
        );

        // retrieve data
        const purchaseOrder = await purchaseOrderModel.getPurchaseOrder(
            purchaseOrderId
        );

        purchaseOrder.items = await purchaseOrderModel.getPurchaseOrderItems(
            purchaseOrderId
        );

        const status = 200;
        res.send({ status, data: purchaseOrder });
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

const deletePurchaseOrder = async (req, res, next) => {
    // authorization
    try {
        const hasAccess = req.authorization.storeUser.thisStore;

        if (!hasAccess) {
            throw new Error('Unauthorized.');
        }
    } catch (err) {
        let myErr = new Error('Unauthorized.');
        myErr.status = 401;
        return next(myErr);
    }

    // check if call request is called
    const { callRequestId, purchaseOrderId } = req.params;
    const callRequest = await callRequestModel.getCallRequest(callRequestId);

    if (!callRequest) {
        throw new Error('Call request not found.');
    }

    if (callRequest.state !== CALLED) {
        const err = new Error('The call request is not in CALLED state.');
        err.status = 400;
        return next(err);
    }

    // delete purchase order
    await purchaseOrderModel.deletePurchaseOrder(purchaseOrderId);

    const status = 200;
    res.send({ status });
};

const getPurchaseOrders = async (req, res, next) => {
    // authorization
    try {
        const hasAccess = req.authorization.storeUser.thisStore;

        if (!hasAccess) {
            throw new Error('Unauthorized.');
        }
    } catch (err) {
        let myErr = new Error('Unauthorized.');
        myErr.status = 401;
        return next(myErr);
    }

    // retrieve data
    const { callRequestId } = req.params;
    const purchaseOrders = await purchaseOrderModel.getPurchaseOrdersByCallRequestId(
        callRequestId
    );

    await Promise.all(
        purchaseOrders.map(async purchaseOrder => {
            purchaseOrder.items = await purchaseOrderModel.getPurchaseOrderItems(
                purchaseOrder.purchaseOrderId
            );

            return purchaseOrder;
        })
    );

    const status = 200;
    res.send({ status, data: purchaseOrders });
};

module.exports = {
    createPurchaseOrder,
    getPurchaseOrders,
    deletePurchaseOrder,
};
