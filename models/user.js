const pool = require('../db');

getUserCredentials = async (email, password) => {
    try {
        return await pool.query(
            `SELECT * FROM users WHERE email='${email}' AND password='${password}' LIMIT 1;`
        );
    } catch (err) {
        console.log('ERROR query');
        throw new Error(err.message);
    }
};

module.exports = {
    getUserCredentials,
};
