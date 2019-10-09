const pool = require('../helpers/postgres');

const getPurchaseOrder = async purchaseOrderId => {
    try {
        const result = await pool.query(
            `SELECT * FROM purchase_orders po WHERE po.purchase_order_id='${purchaseOrderId}' LIMIT 1;`
        );

        return result.rows.length ? result.rows[0] : null;
    } catch (err) {
        console.log('ERROR query getPurchaseOrder');
        throw new Error(err.message);
    }
};

const deletePurchaseOrder = async purchaseOrderId => {
    try {
        const result = await pool.query(
            `DELETE FROM purchase_orders po WHERE po.purchase_order_id='${purchaseOrderId}';`
        );

        return true;
    } catch (err) {
        console.log('ERROR query deletePurchaseOrder');
        throw new Error(err.message);
    }
};

const getPurchaseOrdersByCallRequestId = async callRequestId => {
    try {
        const result = await pool.query(
            `SELECT * FROM purchase_orders po WHERE po.call_request_id='${callRequestId}';`
        );

        return result.rows;
    } catch (err) {
        console.log('ERROR query getPurchaseOrdersByCallRequestId');
        throw new Error(err.message);
    }
};

const getPurchaseOrderItems = async purchaseOrderId => {
    try {
        const result = await pool.query(
            `SELECT * FROM purchase_order_items poi WHERE poi.purchase_order_id='${purchaseOrderId}';`
        );

        return result.rows;
    } catch (err) {
        console.log('ERROR query getPurchaseOrder');
        throw new Error(err.message);
    }
};

const createPurchaseOrder = async (
    callRequestId,
    shippingOptionId,
    shippingPrice,
    paymentOptionId,
    province,
    city,
    address,
    mercadopagoPreference
) => {
    try {
        const now = new Date().toISOString();

        province = province || null;
        city = city || null;
        address = address || null;
        mercadopagoPreference = mercadopagoPreference || null;

        const result = await pool.query(
            `INSERT INTO purchase_orders(call_request_id, shipping_option_id, shipping_price, payment_option_id, province, city, address, mercadopago_preference, created_on) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING purchase_order_id;`,
            [
                callRequestId,
                shippingOptionId,
                shippingPrice,
                paymentOptionId,
                province,
                city,
                address,
                mercadopagoPreference,
                now,
            ]
        );

        return result.rows[0].purchaseOrderId;
    } catch (err) {
        console.log('ERROR query createPurchaseOrder');
        throw new Error(err.message);
    }
};

const addItems = async (purchaseOrderId, items) => {
    let itemIds = [];

    let item;
    for (item of items) {
        item.productDescription = item.productDescription || null;

        const query = `INSERT INTO purchase_order_items(purchase_order_id, product_name, product_description, unit_price, quantity) VALUES ($1, $2, $3, $4, $5) RETURNING purchase_order_item_id;`;

        const result = await pool.query(query, [
            purchaseOrderId,
            item.productName,
            item.productDescription,
            item.unitPrice,
            item.quantity,
        ]);

        itemIds.push(result.rows[0].purchaseOrderItemId);
    }

    return itemIds;
};

module.exports = {
    getPurchaseOrder,
    deletePurchaseOrder,
    addItems,
    createPurchaseOrder,
    getPurchaseOrderItems,
    getPurchaseOrdersByCallRequestId,
};
