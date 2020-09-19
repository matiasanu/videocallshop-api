const pool = require('../helpers/postgres');

const getUserByEmail = async email => {
    try {
        const result = await pool.query(
            `SELECT * FROM store_users u WHERE u.email='${email}' LIMIT 1;`
        );

        return result.rows.length ? result.rows[0] : null;
    } catch (err) {
        console.log('ERROR query getUserByEmail');
        throw new Error(err.message);
    }
};

const getUsersByStoreId = async storeId => {
    try {
        const result = await pool.query(
            `SELECT * FROM store_users u WHERE u.store_id='${storeId}';`
        );

        return result.rows;
    } catch (err) {
        console.log('ERROR query getUserByEmail');
        throw new Error(err.message);
    }
};

const updateLastLoginByEmail = async (email, onesignalPlayerId) => {
    try {
        const now = new Date().toISOString();

        let query = `UPDATE store_users SET last_login='${now}'`;

        if (onesignalPlayerId) {
            query += `, onesignal_player_id='${onesignalPlayerId}'`;
        } else {
            query += `, onesignal_player_id=NULL`;
        }

        query += ` WHERE email='${email}'`;

        const result = await pool.query(query);

        return result.rowCount;
    } catch (err) {
        console.log('ERROR query updateLastLoginByEmail');
        throw new Error(err.message);
    }
};

module.exports = {
    getUserByEmail,
    getUsersByStoreId,
    updateLastLoginByEmail,
};
