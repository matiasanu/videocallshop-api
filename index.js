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
app.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query('select * from pruebita;');
        console.log(rows);
        res.send(rows);
    } catch (err) {
        const statusCode = 500;
        const message = err.message ? err.message : 'An error has ocurred';
        res.status(statusCode);
        res.send({ status: statusCode, message: message });
    }
});

app.post('/authentication', authenticationCtrl.authenticateUser);

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
