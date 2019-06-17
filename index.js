// third libraries
require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');

// helpers, controllers & models
const initRedisCli = require('./helpers/redis');
const waitingRoomCtrl = require('./controllers/waitingRoom');
const storeModel = require('./models/store');

const routes = require('./routes/index');

const app = express();
const http = require('http').Server(app);

app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(logger('dev'));
app.use(express.static('public'));
app.use(cookieParser());
app.use(
    session({
        store: new (require('connect-pg-simple')(session))(),
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
        cookie: {
            magAge: 604800000, //a week
        },
    })
);
app.use('/', routes);
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({ status: err.status, message: err.message });
});

// run server
(async function() {
    try {
        // socket.io
        const io = require('socket.io')(http, {
            path: '/waiting-room-socket',
        });

        io.use(waitingRoomCtrl.socketMiddleware);

        const redisCli = await initRedisCli();
        const stores = await storeModel.getStores();

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

        io.on('connection', waitingRoomCtrl.socketConnection);

        // listen nodejs
        const PORT = process.env.PORT || 3000;
        http.listen(PORT, () =>
            console.log(`videocallshop-api listen on port ${PORT}!`)
        );
    } catch (err) {
        console.log('---ERROR ---', err.message);
    }
})();
