const pool = require('../helpers/postgres');

const updatePersonByUserId = async ({ userId, name, lastname, dni }) => {
    try {
        return await pool.query(
            `UPDATE people p SET p.name=${name}, p.lastname=${lastname}, p.dni=${dni};`
        );
    } catch (err) {
        console.log('ERROR query updatePersonByUserId');
        throw new Error(err.message);
    }
};

module.exports = {
    updatePersonByUserId,
};
