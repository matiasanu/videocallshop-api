const pool = require('../helpers/postgres');

const getPaymentOption = async paymentOptionId => {
    try {
        const result = await pool.query(
            `SELECT * FROM payment_options po WHERE po.payment_option_id='${paymentOptionId}' LIMIT 1;`
        );

        return result.rows.length ? result.rows[0] : null;
    } catch (err) {
        console.log('ERROR query getPaymentOption');
        throw new Error(err.message);
    }
};

const getPaymentOptions = async () => {
    try {
        const result = await pool.query(`SELECT * FROM payment_options po;`);

        return result.rows;
    } catch (err) {
        console.log('ERROR query getPaymentOptions');
        throw new Error(err.message);
    }
};

module.exports = {
    getPaymentOptions,
    getPaymentOption,
};
