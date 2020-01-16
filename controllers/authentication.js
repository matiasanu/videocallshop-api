const bcrypt = require('bcrypt');

const storeUserModel = require('../models/storeUser');

const authenticateStoreUser = async (req, res, next) => {
    const { email, password, onesignalPlayerId } = req.body;

    // unauthorized error
    const unauthorizedErr = new Error('Incorrect email or password.');
    unauthorizedErr.status = 401;

    try {
        const user = await storeUserModel.getUserByEmail(email);

        if (!user) {
            return next(unauthorizedErr);
        }

        // check password
        if (bcrypt.compareSync(password, user.password)) {
            delete user.password;

            // create session for the user
            req.session.storeUser = user;

            await storeUserModel.updateLastLoginByEmail(
                email,
                onesignalPlayerId
            );

            const status = 200;
            res.status(status);
            res.send({ status, data: user });
        } else {
            return next(unauthorizedErr);
        }
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

module.exports = {
    authenticateStoreUser,
};
