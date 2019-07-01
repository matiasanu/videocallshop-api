const authenticationCtrl = require('../controllers/authentication');
const waitingRoomCtrl = require('../controllers/waitingRoom');

// store user aux
const _isAuthenticatedStoreUser = req => {
    return authenticationCtrl._getAuthenticatedStoreUser(req) ? true : false;
};

const _isStoreUserFromStore = (req, storeId) => {
    const storeUser = authenticationCtrl._getAuthenticatedStoreUser(req);
    return parseInt(storeUser.storeId) === parseInt(storeId) ? true : false;
};

// client user aux
const _hasWaitingRoomToken = req => {
    return waitingRoomCtrl._getWaitingRoomToken(req) ? true : false;
};

const _isWaitingRoomTokenFromThisStore = (req, storeId) => {
    const decodedToken = waitingRoomCtrl._getWaitingRoomToken(req);
    return decodedToken.storeId === storeId;
};

const _isClientInQueue = async req => {
    const {
        waitingRoomRequestId,
        storeId,
    } = waitingRoomCtrl._getWaitingRoomToken(req);

    const isOnQueue = await waitingRoomCtrl._isRequestOnQueue(
        storeId,
        waitingRoomRequestId
    );

    return isOnQueue;
};

const checkPermission = async (req, res, next) => {
    const route = req.route.path;
    const method = req.method;

    let hasAccess = true;

    // GET - /store/:storeId/waiting-room
    if (method === 'GET' && route === '/store/:storeId/waiting-room') {
        const storeId = req.params.storeId;
        hasAccess =
            (_isAuthenticatedStoreUser(req) &&
                _isStoreUserFromStore(req, storeId)) ||
            (_hasWaitingRoomToken(req) &&
                _isWaitingRoomTokenFromThisStore(req, storeId) &&
                (await _isClientInQueue(req)));
    }

    // DELETE - /store/:storeId/waiting-room
    if (method === 'GET' && route === '/store/:storeId/waiting-room') {
        const storeId = req.params.storeId;
        hasAccess =
            (_isAuthenticatedStoreUser(req) &&
                _isStoreUserFromStore(req, storeId)) ||
            (_hasWaitingRoomToken(req) &&
                _isWaitingRoomTokenFromThisStore(req, storeId) &&
                (await _isClientInQueue(req)));
    }

    if (!hasAccess) {
        const err = new Error('Unauthorized.');
        err.status = 401;
        return next(err);
    }

    next();
};

module.exports = {
    checkPermission,
};
