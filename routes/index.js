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
router.post('/waiting-room/:storeId', waitingRoomCtrl.pushClient);
router.get(
    '/waiting-room/:storeId',
    authenticationCtrl.isSameUserOrStoreUserOwner,
    waitingRoomCtrl.getWaitingRoom
);
router.delete(
    '/waiting-room/:storeId/:waitingRoomRequestId',
    authenticationCtrl.isSameUserOrStoreUserOwner,
    waitingRoomCtrl.removeClient
);

module.exports = router;
