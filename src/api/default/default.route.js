'use strict';

const Boom = require('@hapi/boom');

exports.plugin = {
    name: 'DefaultRoute',
    register: (server, options) => {

        server.realm.modifiers.route.prefix = undefined;

        // Default Home
        server.route({
            method: 'GET',
            path: '/',
            handler: function () {

                return '<center><h2>REST API by Hapi & Knex<h2></center>';
            }
        });

        // Default 404 Handler
        server.route({
            method: '*',
            path: '/{p*}',
            options: {
                auth: false
            },
            handler: function (request, h) {

                return Boom.notFound(`Ops... url path ${request.path} tidak ada!`);
            }
        });

    }
};
