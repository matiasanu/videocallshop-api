// third libraries
require('dotenv').config();
const pool = require('./db');
var morgan = require('morgan');
var bodyParser = require('body-parser');

// express
const express = require('express');
const app = express();

// bodyParser
app.use(bodyParser.json({ type: 'application/*+json' })); // parse various different custom JSON types as JSON
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' })); // parse some custom thing into a Buffer
app.use(bodyParser.text({ type: 'text/html' })); // parse an HTML body into a string

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

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
