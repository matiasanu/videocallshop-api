const storeUserModel = require('../models/storeUser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

authenticateUser = async (req, res, next) => {
    const { email, password } = req.body;

    console.log(email, password);

    try {
        const users = await storeUserModel.getUserByEmail(email);

        if (!users.length) {
            const status = 401;
            res.status(status);
            res.send({
                status: status,
                message: 'Incorrect email or password.',
            });

            return;
        }

        // user founded
        let user = users[0];

        // check password
        if (bcrypt.compareSync(password, user.password)) {
            delete user.password;
            let payload = user;

            const token = jwt.sign(payload, process.env.JWT_SECRET);

            await storeUserModel.updateLastLoginByEmail(email);

            const status = 200;
            res.set('Authorization', 'Bearer ' + token);
            res.status(status);
            res.send({ status, data: user });
        } else {
            const status = 401;
            res.status(status);
            res.send({
                status: 401,
                message: 'Incorrect email or password.',
            });
        }
    } catch (err) {
        res.status(500);
        res.send(err.message);
    }
};

module.exports = {
    authenticateUser,
};
