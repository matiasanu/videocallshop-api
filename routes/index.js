const express = require('express');
const router = express.Router();

const { check } = require('express-validator/check');

const authenticationCtrl = require('../controllers/authentication');
const validatorCtrl = require('../controllers/validator');
const storeCtrl = require('../controllers/store');
const waitingRoomCtrl = require('../controllers/waitingRoom');
const callCtrl = require('../controllers/call');

// hello
router.get('/', ({ res }) => res.send('videocallshop-api available'));

// authentication
router.post(
    '/authentication/store',
    [check('email').isEmail()],
    validatorCtrl.validateParams,
    authenticationCtrl.authenticateUserStore
);

// store
router.get('/store', storeCtrl.getStores);

router.get(
    '/store/:storeId',
    [check('storeId').isInt()],
    validatorCtrl.validateParams,
    storeCtrl.getStore
);

// waiting room
router.post(
    '/store/:storeId/waiting-room',
    [
        check('storeId').isInt(),
        check('email').isEmail(),
        check('name').matches(/^[a-z ]+$/i),
        check('lastName').matches(/^[a-z ]+$/i),
    ],
    validatorCtrl.validateParams,
    waitingRoomCtrl.pushClient
);

router.get(
    '/store/:storeId/waiting-room',
    [check('storeId').isInt()],
    validatorCtrl.validateParams,
    authenticationCtrl.isClientInQueueOrStoreUserOwner,
    waitingRoomCtrl.getWaitingRoom
);

router.delete(
    '/store/:storeId/waiting-room',
    [check('storeId').isInt()],
    validatorCtrl.validateParams,
    authenticationCtrl.isStoreUserOwner,
    waitingRoomCtrl.removeAll
);

// waiting room request
router.get(
    '/store/:storeId/waiting-room/:waitingRoomRequestId',
    [check('storeId').isInt(), check('waitingRoomRequestId').isInt()],
    validatorCtrl.validateParams,
    authenticationCtrl.isClientInQueueOrStoreUserOwner,
    waitingRoomCtrl.isValidRequest,
    waitingRoomCtrl.getResquest
);

router.delete(
    '/store/:storeId/waiting-room/:waitingRoomRequestId',
    [check('storeId').isInt(), check('waitingRoomRequestId').isInt()],
    validatorCtrl.validateParams,
    authenticationCtrl.isClientOwnerOrStoreUserOwner,
    waitingRoomCtrl.isValidRequest,
    waitingRoomCtrl.isInQueue,
    waitingRoomCtrl.removeClient
);

// calls
router.post(
    '/store/:storeId/calls',
    [check('storeId').isInt(), check('waitingRoomRequestId').isInt()],
    validatorCtrl.validateParams,
    authenticationCtrl.isStoreUserOwner,
    waitingRoomCtrl.isValidRequest,
    waitingRoomCtrl.isInQueue,
    callCtrl.callClient
);

module.exports = router;
