const pool = require('../helpers/postgres');

const getStore = async storeId => {
    try {
        return await pool.query(
            `SELECT * FROM stores WHERE store_id='${storeId}' LIMIT 1;`
        );
    } catch (err) {
        console.log('ERROR query');
        throw err;
    }
};

module.exports = {
    getStore,
};
