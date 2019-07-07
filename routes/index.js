const express = require('express');
const router = express.Router();

const { check } = require('express-validator/check');

// controllers
const authenticationCtrl = require('../controllers/authentication');
const storeCtrl = require('../controllers/store');
const waitingRoomCtrl = require('../controllers/waitingRoom');
const callCtrl = require('../controllers/call');
const callRequestCtrl = require('../controllers/callRequest');

// middlewares
const paramsValidatorMidd = require('../middlewares/paramsValidator');
const authorizationMidd = require('../middlewares/authorization');
const storeMidd = require('../middlewares/store');
const callRequestMidd = require('../middlewares/callRequest');
const callMidd = require('../middlewares/call');

// hello
router.get('/', ({ res }) => res.send('videocallshop-api available'));

// authentication
router.post(
    '/authentication/store',
    [check('email').isEmail()],
    paramsValidatorMidd.validateParams,
    authenticationCtrl.authenticateStoreUser
);

// stores
router.get('/stores', storeCtrl.getStores);

router.get(
    '/stores/:storeId',
    [check('storeId').isInt()],
    paramsValidatorMidd.validateParams,
    storeCtrl.getStore
);

// call requests
router.post(
    '/stores/:storeId/call-requests',
    [
        check('storeId').isInt(),
        check('email').isEmail(),
        check('name').matches(/^[a-z ]+$/i),
        check('lastName').matches(/^[a-z ]+$/i),
    ],
    paramsValidatorMidd.validateParams,
    storeMidd.storeExists,
    callRequestCtrl.createCallRequest
);

router.get(
    '/stores/:storeId/call-requests/:callRequestId',
    [check('storeId').isInt(), check('callRequestId').isInt()],
    paramsValidatorMidd.validateParams,
    storeMidd.storeExists,
    callRequestMidd.callRequestExists,
    callRequestMidd.isCallRequestFromStore,
    authorizationMidd.checkAuthorization,
    callRequestCtrl.getCallRequest
);

router.delete(
    '/stores/:storeId/call-requests/:callRequestId',
    [check('storeId').isInt(), check('callRequestId').isInt()],
    paramsValidatorMidd.validateParams,
    storeMidd.storeExists,
    callRequestMidd.callRequestExists,
    callRequestMidd.isCallRequestFromStore,
    authorizationMidd.checkAuthorization,
    callRequestCtrl.cancelCallRequest
);

// waiting room
router.get(
    '/stores/:storeId/waiting-room',
    [check('storeId').isInt()],
    paramsValidatorMidd.validateParams,
    storeMidd.storeExists,
    authorizationMidd.checkAuthorization,
    waitingRoomCtrl.getWaitingRoom
);

// calls
router.post(
    '/stores/:storeId/calls',
    [check('storeId').isInt(), check('callRequestId').isInt()],
    paramsValidatorMidd.validateParams,
    storeMidd.storeExists,
    callRequestMidd.callRequestExists,
    callRequestMidd.isCallRequestFromStore,
    authorizationMidd.checkAuthorization,
    callCtrl.callClient
);

router.get(
    '/stores/:storeId/calls/:callId',
    [check('storeId').isInt(), check('callId').isInt()],
    paramsValidatorMidd.validateParams,
    storeMidd.storeExists,
    callMidd.isCallFromStore,
    authorizationMidd.checkAuthorization,
    callCtrl.getCall
);

module.exports = router;