'use strict';

const Main = require('../src/server');

module.exports = async (req, res) => {
    const server = await Main();

    // gunakan Hapi handler
    server.listener(req, res);
};
