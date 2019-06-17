const express = require('express');
const router = express.Router();

const authenticationCtrl = require('../controllers/authentication');
const storeCtrl = require('../controllers/store');
const waitingRoomCtrl = require('../controllers/waitingRoom');

//ToDo Implement param verifications
//ToDo Implement permissions middleware

// hello
router.get('/', ({ res }) => res.send('videocallshop-api available'));

// authentication
router.post('/authentication/store', authenticationCtrl.authenticateUserStore);

// store
router.get('/store', storeCtrl.getStores);
router.get('/store/:storeId', storeCtrl.getStore);

// waiting room
router.post('/store/:storeId/waiting-room', waitingRoomCtrl.pushClient);
router.get(
    '/store/:storeId/waiting-room',
    authenticationCtrl.isSameUserOrStoreUserOwner,
    waitingRoomCtrl.getWaitingRoom
);
router.delete(
    '/store/:storeId/waiting-room/:waitingRoomRequestId',
    authenticationCtrl.isSameUserOrStoreUserOwner,
    waitingRoomCtrl.removeClient
);

module.exports = router;
