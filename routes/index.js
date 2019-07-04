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
const storeMidd = require('../middlewares/store');
const authorizationMidd = require('../middlewares/authorization');
const paramsValidatorMidd = require('../middlewares/paramsValidator');

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

// waiting room
router.get(
    '/stores/:storeId/waiting-room',
    [check('storeId').isInt()],
    paramsValidatorMidd.validateParams,
    storeMidd.storeExists,
    authorizationMidd.checkAuthorization,
    waitingRoomCtrl.getWaitingRoom
);

//ToDo: Remove

router.delete(
    '/store/:storeId/waiting-room',
    [check('storeId').isInt()],
    paramsValidatorMidd.validateParams,
    authenticationCtrl.isStoreUserOwner,
    waitingRoomCtrl.removeAll
);

// waiting room request
router.get(
    '/store/:storeId/waiting-room/:waitingRoomRequestId',
    [check('storeId').isInt(), check('waitingRoomRequestId').isInt()],
    paramsValidatorMidd.validateParams,
    authenticationCtrl.isClientInQueueOrStoreUserOwner,
    waitingRoomCtrl.isValidRequest,
    waitingRoomCtrl.getResquest
);

router.delete(
    '/store/:storeId/waiting-room/:waitingRoomRequestId',
    [check('storeId').isInt(), check('waitingRoomRequestId').isInt()],
    paramsValidatorMidd.validateParams,
    authenticationCtrl.isClientOwnerOrStoreUserOwner,
    waitingRoomCtrl.isValidRequest,
    waitingRoomCtrl.isInQueue,
    waitingRoomCtrl.removeClient
);

// calls
router.post(
    '/store/:storeId/calls',
    [check('storeId').isInt(), check('waitingRoomRequestId').isInt()],
    paramsValidatorMidd.validateParams,
    authenticationCtrl.isStoreUserOwner,
    waitingRoomCtrl.isValidRequest,
    waitingRoomCtrl.isInQueue,
    callCtrl.callClient
);

router.get(
    '/store/:storeId/calls/:callId',
    [check('storeId').isInt(), check('callId').isInt()],
    paramsValidatorMidd.validateParams,
    callCtrl.isValidCall,
    callCtrl.getCall
);

module.exports = router;
