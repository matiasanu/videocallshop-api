const userModel = require('../models/user');
const jwt = require('jsonwebtoken');

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

        // user credentials founded
        let user = rows[0];
        delete user.password;
        let payload = { user };

        const token = jwt.sign(payload, process.env.JWT_SECRET);
        res.set('Authorization', 'Bearer ' + token);
        res.status(200);
        res.send(user);
    } catch (err) {
        res.status(500);
        res.send(err.message);
    }
};

module.exports = {
    authenticateUser,
};
