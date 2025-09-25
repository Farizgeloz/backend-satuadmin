'use strict';

const Fs = require('fs');
const Path = require('path');
const Crypto = require('crypto');

exports.plugin = {
    name: 'api',
    register: async (server, options = {}) => {

        const dirApi = options.dirApi;
        if (!dirApi) {
            console.warn('⚠️ Missing required option: dirApi, plugin API tidak didaftarkan.');
            return;
        }

        const { routesPath, methodsPath } = getRouteAndMethodPathFile(dirApi);

        // Daftarkan methods
        methodsPath.forEach((path) => {
            try {
                const methods = require(path);

                methods.forEach(({ name, method }) => {
                    server.method(name, method, {
                        cache: server.app?.$config?.OPTION_CACHE || {},
                        generateKey: generateCacheKey
                    });
                });
            }
            catch (err) {
                console.warn(`Gagal register method ${path}: ${err.message}`);
            }
        });

        // Daftarkan routes
        for (const pathRoute of routesPath) {
            try {
                const routePlugin = require(pathRoute);

                await server.register(routePlugin);
            }
            catch (err) {
                console.warn(`Gagal register route ${pathRoute}: ${err.message}`);
            }
        }

        console.info(`Plugin API selesai register: ${routesPath.length} routes, ${methodsPath.length} methods`);
    }
};

// ==========================
// Helper functions
// ==========================

const getRouteAndMethodPathFile = (dirApi) => {

    const result = { routesPath: [], methodsPath: [] };

    if (!Fs.existsSync(dirApi)) {
        console.warn(`⚠️ Folder API tidak ditemukan: ${dirApi}`);
        return result;
    }

    const items = Fs.readdirSync(dirApi);

    for (const name of items) {
        const subPath = Path.join(dirApi, name);

        // Jika directory dimulai #, recursive
        if (Fs.statSync(subPath).isDirectory() && name.startsWith('#')) {
            const subResult = getRouteAndMethodPathFile(subPath);
            result.routesPath.push(...subResult.routesPath);
            result.methodsPath.push(...subResult.methodsPath);
            continue;
        }

        // Cek route file
        const pathRouteFile = Path.join(dirApi, name, `${name}.route.js`);
        const pathMethodFile = Path.join(dirApi, name, `${name}.method.js`);

        if (Fs.existsSync(pathRouteFile)) {
            result.routesPath.push(pathRouteFile);
        }

        if (Fs.existsSync(pathMethodFile)) {
            result.methodsPath.push(pathMethodFile);
        }
    }

    return result;
};

const generateCacheKey = (...args) => {

    const normalized = args.map(deepSort);
    return Crypto.createHash('md5').update(JSON.stringify(normalized)).digest('hex');
};

// Deep sort untuk konsistensi object/array
const deepSort = (value) => {

    if (Array.isArray(value)) {
        return value.map(deepSort);
    }

    if (value && typeof value === 'object' && value.constructor === Object) {
        return Object.keys(value).sort().reduce((acc, key) => {
            
            acc[key] = deepSort(value[key]);
            return acc;
        }, {});
    }

    return value;
};
