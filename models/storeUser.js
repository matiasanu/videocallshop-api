const pool = require('../helpers/postgres');

const getUserByEmail = async email => {
    try {
        const result = await pool.query(
            `SELECT * FROM store_users u WHERE u.email='${email}' LIMIT 1;`
        );

        return result.rows;
    } catch (err) {
        console.log('ERROR query getUserByEmail');
        throw new Error(err.message);
    }
};

const updateLastLoginByEmail = async email => {
    try {
        const now = new Date().toISOString();

        const result = await pool.query(
            `UPDATE store_users SET last_login='${now}' WHERE email='${email}';`
        );

        return result.rowCount;
    } catch (err) {
        console.log('ERROR query updateLastLoginByEmail');
        throw new Error(err.message);
    }
};

module.exports = {
    getUserByEmail,
    updateLastLoginByEmail,
};
