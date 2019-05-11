// third libraries
require('dotenv').config();
const pool = require('./db');
var morgan = require('morgan');
var bodyParser = require('body-parser');

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

// routes
app.get('/', ({ res }) => res.send('API available'));
app.post('/authentication', authenticationCtrl.authenticateUser);

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
