const pool = require('../helpers/postgres');

getUserByEmail = async email => {
    try {
        return await pool.query(
            `SELECT * FROM users WHERE email='${email}' LIMIT 1;`
        );
    } catch (err) {
        console.log('ERROR query');
        throw new Error(err.message);
    }
};

module.exports = {
    getUserByEmail,
};
