const userModel = require('../models/user');

authenticateUser = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const { rows } = await userModel.getUserCredentials(email, password);

        if (!rows.length) {
            const status = 401;
            res.status(status);
            res.send({ status: 401, message: 'Incorrect user or password.' });

            return;
        }

        res.status(200);
        res.send(rows[0]);
    } catch (err) {
        res.status(401);
        res.send(err.message);
    }
};

module.exports = {
    authenticateUser,
};
