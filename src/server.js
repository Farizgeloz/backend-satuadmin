'use strict';

const Config = require('./config');
const Common = require('./utils/common');
const Hapi = require('@hapi/hapi');
const Boom = require('@hapi/boom');
const { Settings } = require('luxon');
const Knex = require('./database');
const Ioredis = require('ioredis');
const Path = require('path');
const Joi = require('joi');
const { exec } = require('child_process');
const crypto = require('crypto');

require('dotenv').config(); // pastikan .env sudah ada

// Redis client
/* const client = {
    username: 'default',
    password: 'yYaQ0N9ozupXUzlnm75zIo4rHZjj5R3i',
    host: 'redis-15794.crce185.ap-seast-1-1.ec2.redns.redis-cloud.com',
    port: 15794
};

const redisClient = new Ioredis(client);
const redisSubscriber = new Ioredis(client); */

// Environment
const Env = {
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production'
};

Settings.defaultLocale = 'ID';

const allowedOrigins = [
    'https://opendata.probolinggokab.go.id',
    'https://satupeta.probolinggokab.go.id',
    'https://satuadmin.probolinggokab.go.id',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003'
];

const server = Hapi.server({
    port: 3010,
    host: '0.0.0.0',
    routes: {
        cors: {
            origin: allowedOrigins,       // hanya origin ini yang diizinkan
            credentials: true,            // wajib true untuk cookies/session
            additionalHeaders: ['x-token','x-recaptcha-token','x-client-info'],
            additionalExposedHeaders: [
                'x-token','x-data-total','x-pagination-limit-perpage',
                'x-pagination-total-page','content-disposition','x-as'
            ]
        },
        /* cors: {
            origin: ['*']
        }, */
        security: true,
        payload: { maxBytes: 20 * 1024 * 1024 },
        validate: {
            failAction: (request, h, err) => {
                throw Boom.badRequest(err.message);
            }
        }
    }
});
// ⚠️ Bind ke 0.0.0.0 supaya bisa diakses publik
/* const server = Hapi.server({
    port: 3000,
    host: '0.0.0.0',
    debug: Env.isProd ? false : { log: '*', request: '*' },
    routes: {
        security: true,
        validate: {
            //allowedHosts: ['apisatuadmin.probolinggokab.go.id'],
            failAction: (request, h, err) => {
                if (Env.isDev) {
                    console.error(err?.details || err?.message);
                }

                throw Boom.badRequest(err.message);
            }
        },
        cors: {
            origin: allowedOrigins,
            credentials: true,
            additionalHeaders: ['x-token','x-recaptcha-token','x-client-info'],
            additionalExposedHeaders: [
                'x-token','x-data-total','x-pagination-limit-perpage',
                'x-pagination-total-page','content-disposition','x-as'
            ]
        },
        payload: {
            maxBytes: 20 * 1024 * 1024
        },
        validate: {
            failAction: (request, h, err) => {
                if (Env.isDev) {
                    console.error(err?.details || err?.message);
                }

                throw Boom.badRequest(err.message);
            }
        }
    }
}); */

server.validator(Joi);

server.settings.app = { trustProxy: true };

// Secret GitHub
const GITHUB_WEBHOOK_SECRET = Config.GITHUB_WEBHOOK_SECRET || 'rahasia123';

const Main = async () => {

    server.app.$env = Env;
    server.app.$config = Config;
    server.app.$utils = Common;
    /* server.app.$redis = { client: redisClient, subcriber: redisSubscriber }; */

    await server.register({
        plugin: require('@hapi/yar'),
        options: {
            cookieOptions: {
                password: process.env.SESSION_SECRET || '12345678901234567890123456789012',
                isSecure: Env.isProd, // otomatis true kalau production
                isHttpOnly: true,
                isSameSite: 'Lax',
                ttl: 5 * 60 * 1000 // 5 menit
            }
        }
    });
    await server.register(require('./plugins/app'));
    await server.register({
        plugin: require('./plugins/api'),
        options: { dirApi: Path.join(Config.DIRECTORY.SRC, 'api') },
        routes: { prefix: !!Config.PREFIX_ROUTE && Config.PREFIX_ROUTE.trim() !== '' ? Config.PREFIX_ROUTE : undefined }
    });
    await server.register(require('@hapi/inert'));

    /** =========================
     *  GitHub Webhook Auto Deploy
     * ========================== */
    /* server.route({
        method: 'POST',
        path: '/deploy',
        handler: async (request, h) => {
            const payload = request.payload;

            // Verifikasi signature GitHub
            const sig = request.headers['x-hub-signature-256'];
            if (!sig) {
                console.warn('No signature provided');
                return h.response({ status: 'Forbidden, no signature' }).code(403);
            }

            const hmac = crypto.createHmac('sha256', GITHUB_WEBHOOK_SECRET);
            const digest = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');

            if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(digest))) {
                console.warn('Invalid signature');
                return h.response({ status: 'Forbidden, invalid signature' }).code(403);
            }

            // Repo yang dipush
            const repoName = payload.repository?.name;
            console.log('Push diterima untuk repo:', repoName);

            // Tentukan skrip deploy
            let script = '';
            switch (repoName) {
                case 'react-opendata':
                    script = '/var/www/deploy-scripts/deploy-react-opendata.sh';
                    break;
                case 'react-satupeta':
                    script = '/var/www/deploy-scripts/deploy-react-satupeta.sh';
                    break;
                case 'react-satuadmin':
                    script = '/var/www/deploy-scripts/deploy-react-satuadmin.sh';
                    break;
                case 'mata-satuadmin-api':
                    script = '/var/www/deploy-scripts/deploy-backend.sh';
                    break;
                default:
                    console.warn('Unknown repo:', repoName);
                    return h.response({ status: 'Unknown repo, no action' }).code(400);
            }

            exec(script, (err, stdout, stderr) => {
                if (err) {
                    console.error(`Deploy error: ${err}`);
                    console.error(stderr);
                    return;
                }

                console.log(stdout);
            });

            return h.response({ status: 'Deploy started' }).code(200);
        }
    });
 */
    /** =========================
     *  End GitHub Webhook
     * ========================== */

    await server.start();

    console.info(`Environment: ${process.env.NODE_ENV}`);
    console.info(`Server running at: ${server.info.uri}`);
    console.info(`Total route path API: ${server.table().length}`);

    return server;
};

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection', err);
    process.exit(1);
});

module.exports = Main;
