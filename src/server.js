'use strict';

const Hapi = require('@hapi/hapi');
const Path = require('path');
const Joi = require('joi');
const Boom = require('@hapi/boom');

// Config minimal, sesuaikan dengan project
const Config = {
    PORT: process.env.PORT || 3000,
    DIRECTORY: { SRC: 'src' },
    PREFIX_ROUTE: '/api',
    OPTION_CACHE: { expiresIn: 60000 } // contoh cache
};

const Env = {
    isDev: process.env.NODE_ENV === 'development',
    isServerless: !!process.env.VERCEL
};

// Main server
const Main = async () => {

    const server = Hapi.server({
        port: Config.PORT,
        host: '0.0.0.0',
        routes: {
            cors: { origin: ['*'], additionalHeaders: ['x-token'] },
            validate: {
                failAction: (req, h, err) => { throw Boom.badRequest(err.message); }
            }
        }
    });

    server.validator(Joi);

    // Plugin App (jika ada)
    try {
        await server.register(require('./plugins/app'));
    } catch (err) {
        console.warn('Plugin app gagal register', err.message);
    }

    // Plugin API
    try {
        await server.register({
            plugin: require('./plugins/api'),
            options: {
                dirApi: Path.join(__dirname, Config.DIRECTORY.SRC, 'api')
            },
            routes: { prefix: Config.PREFIX_ROUTE }
        });
    } catch (err) {
        console.warn('Plugin API gagal register', err.message);
    }

    // Inert untuk static file
    await server.register(require('@hapi/inert'));

    // Static route favicon
    server.route({
        method: 'GET',
        path: '/favicon.ico',
        handler: {
            file: Path.join(__dirname, 'public', 'favicon.ico')
        }
    });

    if (!Env.isServerless) {
        await server.start();
        console.info(`Server running at ${server.info.uri}`);
    } else {
        await server.initialize();
    }

    return server;
};

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});

module.exports = Main;
