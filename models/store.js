const pool = require('../helpers/postgres');

const getStore = async storeId => {
    try {
        const result = await pool.query(
            `SELECT * FROM stores s WHERE s.store_id='${storeId}' LIMIT 1;`
        );

        return result.rows.length ? result.rows[0] : null;
    } catch (err) {
        console.log('ERROR query getStore');
        throw new Error(err.message);
    }
};

const getStores = async () => {
    try {
        const result = await pool.query(`SELECT * FROM stores s;`);

        return result.rows;
    } catch (err) {
        console.log('ERROR query getStores');
        throw new Error(err.message);
    }
};

const updateMercadopagoAuthorizationCode = async (
    storeId,
    mercadopagoAuthorizartionCode
) => {
    try {
        const result = await pool.query(
            `UPDATE stores SET mercadopago_authorization_code='${mercadopagoAuthorizartionCode}' WHERE store_id='${storeId}';`
        );

        return result.rowCount;
    } catch (err) {
        console.log('ERROR query updateMercadopagoAuthorizatinoCode');
        throw new Error(err.message);
    }
};

const updateMercadopagoAccessToken = async (
    storeId,
    mercadopagoAccessToken,
    mercadopagoRefreshToken,
    pristine
) => {
    try {
        const now = new Date().toISOString();
        pristine = JSON.stringify(pristine);

        const result = await pool.query(
            `UPDATE stores SET mercadopago_access_token='${mercadopagoAccessToken}', mercadopago_refresh_token='${mercadopagoRefreshToken}', mercadopago_access_token_created_on='${now}', mercadopago_pristine_access_token='${pristine}' WHERE store_id='${storeId}';`
        );

        return result.rowCount;
    } catch (err) {
        console.log('ERROR query updateMercadopagoAccessToken');
        throw new Error(err.message);
    }
};

module.exports = {
    getStores,
    getStore,
    updateMercadopagoAuthorizationCode,
    updateMercadopagoAccessToken,
};
