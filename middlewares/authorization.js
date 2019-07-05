const jwtHelper = require('../helpers/jwt');
const waitingRoomModel = require('../models/waitingRoom');
const callModel = require('../models/call');

const checkAuthorization = async (req, res, next) => {
    let authorization = {
        callRequestToken: {
            valid: false,
            thisStore: false, // is from the storerequested
            thisCallRequest: false, // if req request info of callRequest and is owner
            thisCall: false, // if req request info of call and is owner
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

    if (authorization.callRequestToken.valid) {
        // in queue
        const callRequestInQueue = await waitingRoomModel.findCallRequestInQueue(
            req.jwtDecoded.callRequestId
        );
        authorization.callRequestToken.inQueue = !!callRequestInQueue;

        // is store requested the same of the jwt
        let storeIdRequested = req.params.storeId || req.body.storeId;
        if (storeIdRequested) {
            storeIdRequested = parseInt(storeIdRequested);

            authorization.callRequestToken.thisStore =
                req.jwtDecoded.storeId === storeIdRequested;
        }

        // is call request requested requested the same of the jwt
        let callRequestIdRequested =
            req.params.callRequestId || req.body.callRequestId;
        if (callRequestIdRequested) {
            callRequestIdRequested = parseInt(callRequestIdRequested);

            authorization.callRequestToken.thisCallRequest =
                req.jwtDecoded.callRequestId === callRequestIdRequested;
        }

        // is call requested linked to the call request of the jwt
        let callIdRequested = req.params.callId || req.body.callId;
        if (callIdRequested) {
            callIdRequested = parseInt(callIdRequested);

            const callRequested = await callModel.getCall(callIdRequested);
            console.log('-------', req.jwtDecoded.callRequestId);
            console.log('-------', callRequested.callRequestId);
            if (callRequested) {
                authorization.callRequestToken.thisCall =
                    parseInt(req.jwtDecoded.callRequestId) ===
                    parseInt(callRequested.callRequestId);
            }
        }
    }

    // -------- storeUser --------

    authorization.storeUser.authenticated = !!req.session.storeUser;
    if (authorization.storeUser.authenticated) {
        let storeIdRequested = req.params.storeId || req.body.storeId;
        if (storeIdRequested) {
            authorization.storeUser.thisStore =
                storeIdRequested &&
                parseInt(req.session.storeUser.storeId) ===
                    parseInt(storeIdRequested);
        }
    }

    console.log(authorization);

    req.authorization = authorization;
    next();
};

module.exports = {
    checkAuthorization,
};
