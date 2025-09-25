'use strict';

const Config = require('./config.example');
const Common = require('./utils/common');
const Hapi = require('@hapi/hapi');
const Boom = require('@hapi/boom');
const { Settings } = require('luxon');
const Knex = require('./database');
const Ioredis = require('ioredis');
const Path = require('path');
const Joi = require('joi');

const client = {
    username: 'default',
    password: 'yYaQ0N9ozupXUzlnm75zIo4rHZjj5R3i',
    host: 'redis-15794.crce185.ap-seast-1-1.ec2.redns.redis-cloud.com',
    port: 15794
};

const redisClient = new Ioredis(client);
const redisSubscriber = new Ioredis(client);

const Env = {
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
    isServerless: !!process.env.VERCEL // deteksi jalan di Vercel
};

Settings.defaultLocale = 'ID';

const server = new Hapi.server({
    port: process.env.PORT || Config.PORT || 3000, // 🔥 gunakan PORT dari Vercel
    host: '0.0.0.0',                               // 🔥 biar fleksibel di Vercel
    debug: Env.isProd ? false : { log: '*', request: '*' },
    routes: {
        security: true,
        cors: {
            credentials: true,
            origin: ['*'],
            additionalHeaders: ['x-token', 'x-recaptcha-token', 'x-client-info'],
            additionalExposedHeaders: [
                'x-token',
                'x-data-total',
                'x-pagination-limit-perpage',
                'x-pagination-total-page',
                'content-disposition',
                'x-as'
            ]
        },
        validate: {
            failAction: (request, h, err) => {
                if (Env.isDev) {
                    console.error('__failAction pada joi validation__');
                    console.error(err.data);
                }

                throw Boom.badRequest(err.message);
            }
        }
    }
});

server.validator(Joi);

const Main = async () => {
    server.app.$env = Env;
    server.app.$config = Config;
    server.app.$utils = Common;
    server.app.$redis = {
        client: redisClient,
        subcriber: redisSubscriber
    };

    await server.register(require('./plugins/app'));

    await server.register({
        plugin: require('./plugins/api'),
        options: {
            dirApi: Path.join(Config.DIRECTORY.SRC, 'api')
        },
        routes: {
            prefix: Config.PREFIX_ROUTE?.trim() ? Config.PREFIX_ROUTE : undefined
        }
    });

    // 🔥 inert harus dengan format plugin
    await server.register({
        plugin: require('@hapi/inert'),
        options: { etagsCacheMaxSize: 100000 }
    });

    if (!Env.isServerless) {
        // Hanya start kalau bukan di Vercel
        await server.start();
        console.info(`\x1b[33m Environment:\x1b[92m ${process.env.NODE_ENV} \x1b[0m`);
        console.info(`\x1b[33m Server running at:\x1b[92m ${server.info.uri} \x1b[0m`);
        console.info(`\x1b[33m Total route path API:\x1b[92m ${server.table().length} \x1b[0m`);
    }
    else {
        // Di Vercel cukup initialize
        await server.initialize();
    }

    return server;
};

process.on('unhandledRejection', (err) => {
    if (Env.isDev) {
        console.error('___unhandledRejection___');
        console.error(err);
        process.exit(1);
    }
    else {
        const message = err.message;
        const stackTrace = err?.stack?.replace(
            new RegExp(process.cwd().replace(/\\/g, '\\\\'), 'gim'),
            ''
        );

        Knex.insert({
            name: 'unhandledRejection',
            data: JSON.stringify({ message, stackTrace })
        })
            .into('error_report')
            .catch(() => {
                // empty
            });
    }
});

module.exports = Main;
