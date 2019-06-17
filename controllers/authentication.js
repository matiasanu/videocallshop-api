const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const storeUserModel = require('../models/storeUser');

// aux functions
const isAuthenticatedUserStore = req => {
    return req.session.user;
};

const hasWaitingRoomToken = req => {
    let header = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase

    if (!header) {
        console.log('hasWaitingRoomToken', 'NO');
        return false;
    }

    const token = getWaitingRoomTokenFromHeader(header);

    try {
        req.waitingRoomJwtDecoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('hasWaitingRoomToken', 'SI');
        return true;
    } catch (err) {
        console.log('hasWaitingRoomToken', 'NO');
        return false;
    }
};

let getWaitingRoomTokenFromHeader = header => {
    if (header.startsWith('Bearer ')) {
        // Remove Bearer from string
        return header.slice(7, header.length);
    }

    return header;
};

const authenticateUserStore = async (req, res, next) => {
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

            req.session.user = user;

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

// auth middlewares
const isClientOrStoreUser = async (req, res, next) => {
    const isAuthorized =
        isAuthenticatedUserStore(req) || hasWaitingRoomToken(req);

    if (isAuthorized) {
        return next();
    } else {
        const err = new Error('Unauthorized.');
        err.status = 401;
        return next(err);
    }
};
const isSameUserOrStoreUserOwner = async (req, res, next) => {
    const storeId = req.params.storeId || req.body.storeId;

    const isAnAuthenticatedUserStore = isAuthenticatedUserStore(req);
    if (isAnAuthenticatedUserStore) {
        console.log('isAnAuthenticatedUserStore: ', 'YES');
        const user = req.session.user;
        if (parseInt(user.storeId) === parseInt(storeId)) {
            console.log('isStoreUserOwner: ', 'YES');
            return next();
        } else {
            console.log('isStoreUserOwner: ', 'NO');
        }
    } else {
        console.log('isAnAuthenticatedUserStore: ', 'NO');
    }

    const hasAWaitingRoomToken = hasWaitingRoomToken(req);
    if (hasAWaitingRoomToken) {
        console.log('hasAWaitingRoomToken', 'YES');
        if (parseInt(req.waitingRoomJwtDecoded.storeId) === parseInt(storeId)) {
            console.log('isSameUser', 'YES');
            return next();
        } else {
            console.log('isSameUser', 'NO');
        }
    } else {
        console.log('hasAWaitingRoomToken', 'NO');
    }

    const err = new Error('Unauthorized.');
    err.status = 401;
    return next(err);
};

module.exports = {
    authenticateUserStore,
    isClientOrStoreUser,
    isSameUserOrStoreUserOwner,
};
