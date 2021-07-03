const pg = require('pg');
var pgCamelCase = require('pg-camelcase');
var revertCamelCase = pgCamelCase.inject(pg);

config = {
    // ssl: process.env.PGSSL ? process.env.PGSSL : true,
    ssl: {
        rejectUnauthorized: false
    },
    connectionString: `${process.env.DATABASE_URL}`,
};
const pool = new pg.Pool(config);

module.exports = pool;
