/* 'use strict';

const Server = require('./src/server');

Server()
    .then((serverInstance) => {
        // #https://futurestud.io/tutorials/hapi-how-to-correctly-stop-your-server-and-close-existing-connections
        // listen on SIGINT signal and gracefully stop the server
        process.on('SIGINT', () => {

            console.log('');
            console.log('\x1b[31m Stopping hapi server \x1b[0m');
            console.log('');

            if (typeof serverInstance.stop === 'function') {
                // default timeout 5s
                serverInstance.stop()
                    .then((err) => {

                        console.log('Hapi server stopped');
                        process.exit((err) ? 1 : 0);
                    });
            }
        });

    })
    .catch((err) => {

        console.log(err);
        process.exit(1);
    }); */

'use strict';

const Server = require('./src/server');

let _server; // cache biar tidak bikin server baru tiap request

module.exports = async (req, res) => {
    try {
        if (!_server) {
            _server = await Server();
            await _server.initialize(); // jangan .start(), karena serverless tidak boleh listen port
        }

        // Panggil Hapi untuk handle request
        const response = await _server.inject({
            method: req.method,
            url: req.url,
            headers: req.headers,
            payload: req.body
        });

        res.status(response.statusCode);
        for (const [key, value] of Object.entries(response.headers)) {
            res.setHeader(key, value);
        }

        res.end(response.rawPayload);

    }
    catch (err) {
        console.error('🔥 Serverless error:', err);
        res.status(500).send('Internal Server Error');
    }
};

