const getUserCredentials = async (email, password) => {
    try {
        const { rows } = await client.query('select * from pruebita;');
        console.log(rows);
        res.send(rows);
    } catch (err) {
        throw new Error(err.message);
    }
};

module.exports = {
    getUserCredentials,
};
