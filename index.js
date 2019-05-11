// third libraries
require('dotenv').config();
const pool = require('./db');
var morgan = require('morgan');
var bodyParser = require('body-parser');
const checkJwtToken = require('./helpers/jwt');

// controllers
const authenticationCtrl = require('./controllers/authentication');

// express
const express = require('express');
const app = express();

// bodyParser
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded

// config
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));

// public routes
app.get('/', ({ res }) => res.send('API available'));
app.post('/authentication', authenticationCtrl.authenticateUser);

// private routes
app.use(checkJwtToken);

app.get('/private', ({ res }) =>
    res.send({ status: 200, message: 'You are in' })
);

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
