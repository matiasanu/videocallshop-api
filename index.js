// third libraries
require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');

const expressSession = require('express-session');
const session = expressSession({
        store: new (require('connect-pg-simple')(expressSession))(),
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
        cookie: {
            magAge: 604800000, //a week
        },
    }),
    sharedsession = require('express-socket.io-session');
const bodyParser = require('body-parser');

// helpers, controllers, models, middlewares
const redisHelper = require('./helpers/redis');
const authorizationSocketMidd = require('./middlewares/authorizationSocket');
const waitingRoomModel = require('./models/waitingRoom');
const waitingRoomCtrl = require('./controllers/waitingRoom');

const routes = require('./routes/index');

const app = express();
const http = require('http').Server(app);

app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.static('public'));
app.use(cookieParser());
app.use(session);
app.use('/', routes);
app.use(function(err, req, res, next) {
    if (err.status === 500) {
        console.log(err);
    }

    res.status(err.status || 500);
    res.send({
        status: err.status,
        message:
            err.status === 500 ? 'Can not process the request.' : err.message,
    });
});

// run server
(async function(session) {
    try {
        // socket.io
        const io = require('socket.io')(http, {
            path: '/waiting-room-socket',
        });

        io.use(sharedsession(session)); // Share session with io sockets
        io.use(authorizationSocketMidd.checkAuthorization);

        const redisCli = await redisHelper.createClient();
        await waitingRoomModel.subscribeQueues(redisCli);

        redisCli.on('message', async (channel, message) => {
            message = JSON.parse(message);

            // assuming channel (redis) and room (socket.io) sharing the same name
            io.of('/')
                .to(channel)
                .emit(message.type, message.value);
        });

        io.on('connection', waitingRoomCtrl.getWaitingRoomBySocket);

        // listen nodejs
        const PORT = process.env.PORT || 3000;
        http.listen(PORT, () =>
            console.log(`videocallshop-api listen on port ${PORT}!`)
        );
    } catch (err) {
        console.log('---ERROR ---', err.message);
    }
})(session);
