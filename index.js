// third libraries
require('dotenv').config();
const pool = require('./helpers/postgres');
const morgan = require('morgan');
const bodyParser = require('body-parser');

// heplers, controllers & models
const initRedisCli = require('./helpers/redis');
const { checkToken } = require('./helpers/jwt');
const storeUserAuthenticationCtrl = require('./controllers/storeUserAuthentication');
const waitingRoomCtrl = require('./controllers/waitingRoom');
const waitingRoomModel = require('./models/waitingRoom');
const storeModel = require('./models/store');

initRedisCli()
    .then(async redisCli => {
        // express & socket.io
        const express = require('express');
        const app = express();
        let http = require('http').Server(app);

        // bodyParser
        app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded

        // log requests on console
        app.use(morgan('dev'));

        // ------- PUBLIC ROUTES -------
        app.get('/', ({ res }) => res.send('videocallshop-api available'));

        // serves waiting-room-render.html assets
        app.use(express.static('public'));

        //Todo use npm express-validator package
        app.post(
            '/store-user-authentication',
            storeUserAuthenticationCtrl.authenticateUser
        );

        app.post('/waiting-room/:storeId', waitingRoomCtrl.pushClient);

        app.get('/waiting-room-render', function(req, res) {
            res.sendFile(__dirname + '/waiting-room-render.html');
        });

        app.get('/waiting-room-render-store', function(req, res) {
            res.sendFile(__dirname + '/waiting-room-render-store.html');
        });

        // ------- PRIVATE ROUTES -------
        app.use(checkToken);

        // socket.io
        const io = require('socket.io')(http, {
            path: '/waiting-room-socket',
        });

        // socket.io middleware to check the connection params
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

        app.get('/waiting-room/:storeId', waitingRoomCtrl.getWaitingRoom);
        app.delete(
            '/waiting-room/:storeId/:waitingRoomRequestId',
            waitingRoomCtrl.removeClient
        );

        app.get('/private', ({ res }) =>
            res.send({ status: 200, message: 'You are in' })
        );

        // listen nodejs
        const PORT = process.env.PORT || 3000;
        http.listen(PORT, () =>
            console.log(`videocallshop-api listen on port ${PORT}!`)
        );
    })
    .catch(err => {
        console.log(err.message);
    });
