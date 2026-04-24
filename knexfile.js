'use strict';

module.exports = {
    client: 'mysql',
    connection: {
        host: 'localhost',
        port: 3306,
        database: 'api_mata_satuadmin',
        user: 'root',
        /* password: 'apimatadb', */
        password: '',
        charset: 'utf8mb4',
        timezone: 'UTC',
        dateStrings: true,
        supportBigNumbers: true,
        typeCast
    },
    pool: {
        min: 2,
        max: 20,
        afterCreate(conn, cb) {
            conn.query('SET time_zone = "+00:00";', (err) => cb(err, conn));
        }
    },
    acquireConnectionTimeout: 90000,
    migrations: {
        directory: './knex/migrations',
        tableName: 'knex_migrations'
    },
    seeds: {
        directory: './knex/seeds'
    }
};

/*eslint func-style:0*/
function typeCast(field, next) {
    if (field.type === 'TIMESTAMP') {
        const val = field.string();
        try {
            return new Date(val + ' GMT').toISOString();
        }
        catch {
            return val;
        }
    }

    if (field.type === 'TINY' && field.length === 1) {
        const value = field.string();
        return value ? value === '1' : null;
    }

    return next();
}
