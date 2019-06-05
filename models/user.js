const pool = require('../helpers/postgres');

const getUserByEmail = async email => {
    try {
        return await pool.query(
            `SELECT * FROM users WHERE email='${email}' LIMIT 1;`
        );
    } catch (err) {
        console.log('ERROR query getUserByEmail');
        throw new Error(err.message);
    }
};

const updateLastLoginByEmail = async email => {
    try {
        const now = new Date().toISOString();

        return await pool.query(
            `UPDATE users SET last_login='${now}' WHERE email='${email}';`
        );
    } catch (err) {
        console.log('ERROR query updateLastLoginByEmail');
        throw new Error(err.message);
    }
};

module.exports = {
    getUserByEmail,
    updateLastLoginByEmail,
};
