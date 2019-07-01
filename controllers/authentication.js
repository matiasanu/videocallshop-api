const bcrypt = require('bcrypt');

const storeUserModel = require('../models/storeUser');

const _getAuthenticatedStoreUser = req => {
    return req.session.storeUser || false;
};

const authenticateStoreUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const users = await storeUserModel.getUserByEmail(email);

        if (!users.length) {
            const err = new Error('Incorrect email or password.');
            err.status = 401;
            return next(err);
        }

        // user founded
        let user = users[0];

        // check password
        if (bcrypt.compareSync(password, user.password)) {
            delete user.password;

            req.session.storeUser = user;

            const status = 200;
            res.status(status);
            res.send({ status, data: user });
        } else {
            const err = new Error('Incorrect email or password.');
            err.status = 401;
            return next(err);
        }
    } catch (err) {
        res.status(500);
        res.send(err.message);
    }
};

module.exports = {
    _getAuthenticatedStoreUser,
    authenticateStoreUser,
};
