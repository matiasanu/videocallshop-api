// third libraries
require('dotenv').config();
const express = require('express');
const pool = require('./helpers/postgres');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const bodyParser = require('body-parser');

// helpers, controllers & models
const initRedisCli = require('./helpers/redis');
const authenticationCtrl = require('./controllers/authentication');
const waitingRoomCtrl = require('./controllers/waitingRoom');
const storeModel = require('./models/store');

const app = express();
const http = require('http').Server(app);

initRedisCli()
    .then(async redisCli => {
        app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
        app.use(logger('dev'));
        app.use(express.static('public'));
        app.use(cookieParser());
        app.use(
            //ToDo Implement postgresql for sessions
            expressSession({
                //ToDo Check session options
                secret: 'max',
                saveUninitialized: false,
                resave: false,
            })
        );

        //ToDo Implement param verifications
        //ToDo Implement permissions middleware
        app.get('/', ({ res }) => res.send('videocallshop-api available'));
        app.post(
            '/authentication/store',
            authenticationCtrl.authenticateUserStore
        );

        app.post('/waiting-room/:storeId', waitingRoomCtrl.pushClient);
        app.get(
            '/waiting-room/:storeId',
            authenticationCtrl.isUserAuthorized,
            waitingRoomCtrl.getWaitingRoom
        );
        app.delete(
            '/waiting-room/:storeId/:waitingRoomRequestId',
            authenticationCtrl.isUserAuthorized,
            waitingRoomCtrl.removeClient
        );

        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.send({ status: err.status, message: err.message });
        });

        // socket.io
        const io = require('socket.io')(http, {
            path: '/waiting-room-socket',
        });

        io.use(waitingRoomCtrl.socketMiddleware);

        // subscribe nodejs to redis channels
        const stores = await storeModel.getStores();
        stores.forEach(store => {
            redisCli.subscribe(`waitingRoom${store.storeId}`);
        });

        redisCli.on('message', async (channel, message) => {
            message = JSON.parse(message);

            // assuming channel (redis) and room (socket.io) sharing the same name
            io.of('/')
                .to(channel)
                .emit(message.type, message.value);
        });

        io.on('connection', waitingRoomCtrl.socketConnection);

        // listen nodejs
        const PORT = process.env.PORT || 3000;
        http.listen(PORT, () =>
            console.log(`videocallshop-api listen on port ${PORT}!`)
        );
    })
    .catch(err => {
        console.log(err.message);
    });
