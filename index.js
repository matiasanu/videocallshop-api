require('dotenv').config();

const express = require('express');
const app = express();

const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});
try {
    client.connect();
} catch (e) {
    console.log(e);
}

app.get('/', (req, res) => {
    let results = client.query('select * from pruebita;', (err, res) => {
        if (err) throw err;
        for (let row of res.rows) {
            console.log(JSON.stringify(row));
        }
        client.end();
    });

    console.log(results);

    res.send(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
