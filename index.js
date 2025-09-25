'use strict';

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
    });
