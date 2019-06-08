const pool = require('../helpers/postgres');

const getStore = async storeId => {
    try {
        const result = await pool.query(
            `SELECT * FROM stores s WHERE s.store_id='${storeId}' LIMIT 1;`
        );

        return result.rows;
    } catch (err) {
        console.log('ERROR query getUserByEmail');
        throw new Error(err.message);
    }
};

module.exports = {
    getStore,
};
