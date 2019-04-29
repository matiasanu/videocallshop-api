require('dotenv').config();

const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Laburá Mauro!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
