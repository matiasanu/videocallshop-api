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

const stores = [
    { storeId: 1, name: 'Sport 78' },
    { storeId: 2, name: 'Blast' },
    { storeId: 3, name: 'Mc Donals' },
];

initRedisCli()
    .then(redisCli => {
        // express & socket.io
        const express = require('express');
        const app = express();
        let http = require('http').Server(app);

        const io = require('socket.io')(http, {
            path: '/waiting-room-socket',
        });

        // socket.io middleware to check the connection params
        io.use(function(socket, next) {
            try {
                var storeId = socket.request._query.storeId;
                var clientId = socket.request._query.clientId;

                console.log(
                    `Middleware: Trying to connect clientId ${clientId} to storeId ${storeId}`
                );

                let storeFound = false;

                stores.forEach(store => {
                    if (store.storeId == storeId) {
                        storeFound = true;
                    }
                });

                if (!storeFound) {
                    console.log('The storeId number is not valid');
                    return next(
                        new Error('Middleware: The storeId number is not valid')
                    );
                }

                if (clientId.length < 3) {
                    console.log('The clientId number is not valid');
                    return next(
                        new Error(
                            'Middleware: The clientId number is not valid'
                        )
                    );
                }

                next();
            } catch (err) {
                return next(new Error(err));
            }
        });

        // bodyParser
        app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded

        // log requests on console
        app.use(morgan('dev'));

        // public routes
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

        //socket.io

        // subscribe nodejs to redis channels
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

        io.on('connection', async socket => {
            const clientId = socket.handshake.query.clientId;
            const storeId = socket.handshake.query.storeId;
            const myWaitingRoomId = `waitingRoom${storeId}`;

            console.log(`User ${clientId} connected to ${storeId}`);

            // join to the socket.io room in order to listen when waiting room was changed
            socket.join(myWaitingRoomId, () => {
                let rooms = Object.keys(socket.rooms);
            });

            const waitingRoom = await waitingRoomModel.getWaitingRoom(storeId);

            socket.emit('WAITING_ROOM_SENDED', waitingRoom);

            socket.on('disconnect', function() {
                console.log(`User ${clientId} discconnected to ${storeId}`);
            });
        });

        // private routes
        app.use(checkToken);

        app.get('/waiting-room/:storeId', waitingRoomCtrl.getWaitingRoom);
        app.delete('/waiting-room', waitingRoomCtrl.removeClient);

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
