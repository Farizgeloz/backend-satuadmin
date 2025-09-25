'use strict';

module.exports = {

    development: {
        client: 'mysql',
        connection: {
            host: '127.0.0.1',
            database: 'api_mata_satu_admin2',
            user: 'root',
            password: '',
            charset: 'utf8',
            // This is used to type cast server date/time values to JavaScript Date object and vice versa
            timezone: 'UTC',
            dateStrings: true,
            supportBigNumbers: true,
            typeCast
        },
        pool: {
            min: 2,
            max: 20,
            idleTimeoutMillis: 60000,
            acquireTimeoutMillis: 60000,
            afterCreate: function (connection, callback) {
                connection.query('SET time_zone = "+00:00";', (err) => {
                    callback(err, connection);
                });
            }
        },
        acquireConnectionTimeout: 30000,
        asyncStackTraces: true,
        migrations: {
            directory: './knex/migrations',
            tableName: 'knex_migrations'
        },
        seeds: {
            directory: './knex/seeds'
        }
    },

    production: {
        client: 'mysql',
        connection: {
            database: 'api_mata_satu_admin2',
            user: 'root',
            password: '',
            charset: 'utf8',
            // This is used to type cast server date/time values to JavaScript Date object and vice versa
            timezone: 'UTC',
            dateStrings: true,
            supportBigNumbers: true,
            typeCast
        },
        pool: {
            min: 2,
            max: 400,
            afterCreate: function (connection, callback) {

                connection.query('SET time_zone = "+00:00";', (err) => {

                    callback(err, connection);
                });
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
    }
};

/*eslint func-style:0*/
function typeCast(field, next) {

    if (field.type === 'TIMESTAMP') {
        const val = field.string();
        try {
            return new Date(val + ' GMT').toISOString();
        }
        catch (e) {
            return val;
        }
    }

    if (field.type === 'TINY' && field.length === 1) {
        const value = field.string();
        return value ? (value === '1') : null; // 1 = true, 0 = false, null = null
    }

    return next();
}
