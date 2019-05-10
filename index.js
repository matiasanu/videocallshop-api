require('dotenv').config();

const express = require('express');
const app = express();

const { Client } = require('pg');

config = {
    ssl: process.env.PGSSL ? process.env.PGSSL : true,
};

const client = new Client(config);
try {
    client.connect();
} catch (err) {
    throw err;
}

app.get('/', async (req, res) => {
    try {
        const { rows } = await client.query('select * from pruebita;');
        console.log(rows);
        res.send(rows);
    } catch (err) {
        const statusCode = 500;
        const message = err.message ? err.message : 'An error has ocurred';
        res.status(statusCode);
        res.send({ status: statusCode, message: message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
