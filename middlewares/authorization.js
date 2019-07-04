const jwtHelper = require('../helpers/jwt');
const waitingRoomModel = require('../models/waitingRoom');

const checkAuthorization = async (req, res, next) => {
    let authorization = {
        callRequestToken: {
            valid: false,
            thisStore: false, // is from the storerequested
            thisCallRequest: false, // is the same call request requested
            inQueue: false,
        },
        storeUser: {
            authenticated: false,
            thisStore: false,
        },
    };

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

    // is storeIdRequested the same of the jwt
    let storeIdRequested = req.params.storeId || req.body.storeId;
    if (storeIdRequested) {
        storeIdRequested = parseInt(storeIdRequested);
    }
    if (storeIdRequested && authorization.callRequestToken.valid) {
        authorization.callRequestToken.thisStore =
            req.jwtDecoded.storeId === storeIdRequested;

        const callRequestInQueue = await waitingRoomModel.findCallRequestInQueue(
            req.jwtDecoded.callRequestId
        );
        authorization.callRequestToken.inQueue = !!callRequestInQueue;
    }

    // is callIdRequested the same of the jwt
    let callRequestIdRequested =
        req.params.callRequestId || req.body.callRequestId;
    if (callRequestIdRequested) {
        callRequestIdRequested = parseInt(callRequestIdRequested);
    }
    if (callRequestIdRequested && authorization.callRequestToken.valid) {
        authorization.callRequestToken.thisCallRequest =
            req.jwtDecoded.callRequestId === callRequestIdRequested;
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
