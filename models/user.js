const pool = require('../helpers/postgres');

const getUserByEmail = async (email, role_id) => {
    try {
        return await pool.query(
            `SELECT * FROM users u, users_roles ur WHERE u.user_id = ur.user_id AND u.email='${email}' AND ur.role_id='${role_id}' LIMIT 1;`
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
