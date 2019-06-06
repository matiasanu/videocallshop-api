const userModel = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

authenticateUser = async (req, res, next) => {
    const { email, password, role_id } = req.body;

    try {
        const { rows } = await userModel.getUserByEmail(email, role_id);

        if (!rows.length) {
            const status = 401;
            res.status(status);
            res.send({
                status: status,
                message: 'Incorrect email or password.',
            });

            return;
        }

        // user founded
        let user = rows[0];

        // check password
        if (bcrypt.compareSync(password, user.password)) {
            delete user.password;
            let payload = { user };

            const token = jwt.sign(payload, process.env.JWT_SECRET);

            await userModel.updateLastLoginByEmail(email);

            res.set('Authorization', 'Bearer ' + token);
            res.status(200);
            res.send(user);
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
