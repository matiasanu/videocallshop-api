const jwtHelper = require('../helpers/jwt');
const waitingRoomModel = require('../models/waitingRoom');

const checkAuthorization = async (req, res, next) => {
    let authorization = {
        callRequestToken: {
            valid: false,
            thisStore: false,
            inQueue: false,
        },
        storeUser: {
            authenticated: false,
            thisStore: false,
        },
    };

    // gets requested storeId
    let storeIdRequested = req.params.storeId || req.body.storeId;
    if (storeIdRequested) {
        storeIdRequested = parseInt(storeIdRequested);
    }

    // -------- callRequest --------

    // have a valid callRequest token
    let jwt = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (jwt) {
        // Remove Bearer from string
        if (jwt.startsWith('Bearer ')) {
            jwt = jwt.slice(7, jwt.length);
        }

        // verify jwt
        try {
            const jwtDecoded = await jwtHelper.verifyJwt(jwt);
            // jwt verified
            authorization.callRequestToken.valid = true;
            req.jwtDecoded = jwtDecoded;
        } catch (err) {
            console.log(err);
        }
    }

    // is the valid jwt from requested store
    if (authorization.callRequestToken.valid) {
        authorization.callRequestToken.thisStore =
            storeIdRequested && req.jwtDecoded.storeId === storeIdRequested;

        console.log(
            'req.jwtDecoded.callRequestId',
            req.jwtDecoded.callRequestId
        );
        const callRequestInQueue = await waitingRoomModel.findCallRequestInQueue(
            req.jwtDecoded.callRequestId
        );
        authorization.callRequestToken.inQueue = !!callRequestInQueue;
    }

    // -------- storeUser --------

    authorization.storeUser.authenticated = !!req.session.storeUser;
    if (authorization.storeUser.authenticated) {
        authorization.storeUser.thisStore =
            storeIdRequested &&
            req.session.storeUser.storeId === storeIdRequested;
    }

    console.log(authorization);

    req.authorization = authorization;
    next();
};

module.exports = {
    checkAuthorization,
};
