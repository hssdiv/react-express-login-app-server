const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'postgres',
    password: '1',
    database: 'react_app',
    host: 'localhost',
    port: '5432',
});

// \l \c \dt

module.exports = pool;