require('dotenv').config();

const express = require('express');
const app = express();

const { Client } = require('pg');

config = {
    ssl: process.env.PGSSL ? process.env.PGSSL : true,
    connectionString: process.env.DATABASE_URL,
};

const PORT = process.env.PORT || 3000;

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

const client = new Client(config);
client
    .connect()
    .then(() => {
        app.listen(PORT, () =>
            console.log(`Example app listening on port ${PORT}!`)
        );
    })
    .catch(err => {
        console.log(err);
    });
