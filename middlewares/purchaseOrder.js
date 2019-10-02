const purchaseOrderModel = require('../models/purchaseOrder');

const purchaseOrderExists = async (req, res, next) => {
    const err = new Error('Purchase order does not exists');
    err.status = 400;

    const purchaseOrderId =
        req.params.purchaseOrderId || req.body.purchaseOrderId;
    if (!purchaseOrderId) {
        return next(err);
    }

    const purchaseOrder = await purchaseOrderModel.getPurchaseOrder(
        purchaseOrderId
    );
    if (!purchaseOrder) {
        return next(err);
    }

    next();
};

const isPurchaseOrderFromCallRequest = async (req, res, next) => {
    const err = new Error('Purchase order is not from this store.');
    err.status = 400;

    const purchaseOrderId =
        req.params.purchaseOrderId || req.body.purchaseOrderId;
    const callRequestId = req.params.callRequestId || req.body.callRequestId;
    const purchaseOrder = await purchaseOrderModel.getPurchaseOrder(
        purchaseOrderId
    );

    if (
        !purchaseOrderId ||
        !callRequestId ||
        parseInt(callRequestId) !== parseInt(purchaseOrder.callRequestId)
    ) {
        return next(err);
    }

    next();
};

module.exports = {
    purchaseOrderExists,
    isPurchaseOrderFromCallRequest,
};
