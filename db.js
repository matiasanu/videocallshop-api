const { Pool } = require('pg');

config = {
    ssl: process.env.PGSSL ? process.env.PGSSL : true,
    connectionString: process.env.DATABASE_URL,
};
const pool = new Pool(config);

module.exports = pool;
