const pool = require('../helpers/postgres');

const getShippingOption = async shippingOptionId => {
    try {
        const result = await pool.query(
            `SELECT * FROM shipping_options po WHERE po.shipping_option_id='${shippingOptionId}' LIMIT 1;`
        );

        return result.rows.length ? result.rows[0] : null;
    } catch (err) {
        console.log('ERROR query getShippingOption');
        throw new Error(err.message);
    }
};

const getShippingOptions = async () => {
    try {
        const result = await pool.query(`SELECT * FROM shipping_options po;`);

        return result.rows;
    } catch (err) {
        console.log('ERROR query getShippingOptions');
        throw new Error(err.message);
    }
};

module.exports = {
    getShippingOptions,
    getShippingOption,
};
