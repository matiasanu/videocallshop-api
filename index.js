// third libraries
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const cookieParser = require('cookie-parser');

const expressSession = require('express-session');
const session = expressSession({
        store: new (require('connect-pg-simple')(expressSession))(),
        secret: process.env.SESSION_SECRET,
        cookie: {expires: new Date(253402300000000)},
        saveUninitialized: false,
        resave: false,
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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(logger('dev'));
app.use(express.static('public'));
app.use(express.static('resources'));
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
            origins: '*:*',
            handlePreflightRequest: (req, res) => {
                const headers = {
                    'Access-Control-Allow-Headers':
                        'Content-Type, Authorization',
                    'Access-Control-Allow-Origin': req.headers.origin, //or the specific origin you want to give access to,
                    'Access-Control-Allow-Credentials': true,
                };
                res.writeHead(200, headers);
                res.end();
            },
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
