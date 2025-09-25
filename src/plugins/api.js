'use strict';

const Fs = require('fs');
const Path = require('path');
const Crypto = require('crypto');


exports.plugin = {
    name: 'api',
    register: async function (server, options) {

        const dirApi = options?.dirApi;
        if (!dirApi) {
            throw new Error('Missing required option: dirApi');
        }

        const { routesPath, methodsPath } = getRouteAndMethodPathFile(dirApi);

        // Load and register methods
        methodsPath.forEach((path) => {

            const methods = require(path);

            methods.forEach(({ name, method }) => {

                server.method(name, method, {
                    cache: server.app.$config.OPTION_CACHE,
                    generateKey: generateCacheKey
                });

            });

        });

        // Load and register routes
        await server.register(routesPath.map((path) => require(path)));

    }
};


const getRouteAndMethodPathFile = function (dirApi) {

    const result = {
        routesPath: [],
        methodsPath: []
    };

    // Baca direktori dalam direktori /api/*
    if (!Fs.existsSync(dirApi)) {
        console.warn(`⚠️ Folder API tidak ditemukan: ${dirApi}`);
        return result; // kosong aja biar nggak error
    }

    const items = Fs.readdirSync(dirApi);

    for (const name of items) {

        // jika directory dimulai #, berarti dianggap sebagai direktori group api
        if (name.startsWith('#')) {

            const subdir = Path.join(dirApi, name);

            // recursive
            const subResult = getRouteAndMethodPathFile(subdir);

            result.routesPath.push(...subResult.routesPath);
            result.methodsPath.push(...subResult.methodsPath);

            continue;
        }

        const fileRouteName = `${name}.route.js`;
        const pathRouteFile = Path.join(dirApi, name, fileRouteName);

        const fileMethodName = `${name}.method.js`;
        const pathMethodFile = Path.join(dirApi, name, fileMethodName);

        if (Fs.existsSync(pathRouteFile)) {
            result.routesPath.push(pathRouteFile);
        }

        if (Fs.existsSync(pathMethodFile)) {
            result.methodsPath.push(pathMethodFile);
        }
    }

    return result;
};

const generateCacheKey = function (...args) {

    const normalized = args.map(deepSort);
    return Crypto.createHash('md5').update(JSON.stringify(normalized)).digest('hex');
};

// Rekursif deep sort untuk array & object agar konsisten
const deepSort = function (value) {

    if (Array.isArray(value)) {
        return value.map(deepSort);
    }
    else if (value && typeof value === 'object' && value.constructor === Object) {
        return Object.keys(value).sort().reduce((acc, key) => {

            acc[key] = deepSort(value[key]);
            return acc;
        }, {});
    }

    return value;
};
