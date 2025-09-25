'use strict';

const Main = require('./src/server');

(async () => {
    try {
        const server = await Main();

        // Kalau bukan di Vercel, server akan otomatis start di server.js
        // Kalau di Vercel, kita return handler untuk serverless function
        if (process.env.VERCEL) {
            module.exports = (req, res) => {
                server.listener(req, res); // listener bawaan hapi
            };
        }

        // Graceful shutdown (hanya local/dev)
        process.on('SIGINT', async () => {
            console.log('');
            console.log('\x1b[31m Stopping hapi server \x1b[0m');
            console.log('');

            if (server.stop) {
                await server.stop();
                console.log('Hapi server stopped');
                process.exit(0);
            }
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
