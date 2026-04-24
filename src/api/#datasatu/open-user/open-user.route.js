'use strict';

const OpenItemHandler = require('./open-user.handler');
const OpenItemValidation = require('./open-user.validation');


/*** WHAT DO HERE
 * - saving error report (>=500) via  onPreResponse
 */
exports.plugin = {
    name: 'UserRoute',
    register: (server, options) => {

        server.route({
            method: 'GET',
            path: '/open-user/user',
            handler: OpenItemHandler.view_user,
            options: {
                //validate: OpenItemValidation.query
            }
        });
        server.route({
            method: 'GET',
            path: '/open-user/user/{id}',
            handler: OpenItemHandler.view_user_id
        });
        server.route({
            method: 'PATCH',
            path: '/open-user/user/update/{id}',
            handler: OpenItemHandler.update_user,
            options: {
                validate: {
                    payload: OpenItemValidation.edit.payload,
                    //tambahan
                    failAction: async (request, h, err) => {
                        console.error('🔥 Joi Validation Error:', err.message);
                        throw Boom.badRequest(err.message);
                    }
                },
                payload: {
                    maxBytes: 1024 * 1024 * 20,  // Maksimal 20 MB
                    output: 'stream',
                    parse: true,
                    multipart: true
                }
            }
        });
        server.route({
            method: 'POST',
            path: '/open-user/user/add',
            handler: OpenItemHandler.add_user,
            options: {
                validate: {
                    payload: OpenItemValidation.add.payload   // 👈 Bukan .payload
                },
                payload: {
                    maxBytes: 1024 * 1024 * 20,  // Maksimal 20 MB
                    output: 'stream',
                    parse: true,
                    multipart: true
                }
            }
        });
        /* server.route({
            method: 'DELETE',
            path: '/open-user/user/delete/{id}',
            handler: OpenItemHandler.delete_user,
            options: {
                validate: {
                    payload: OpenItemValidation.delete.payload   // 👈 Bukan .payload
                },
                payload: {
                    maxBytes: 1024 * 1024 * 20,  // Maksimal 20 MB
                    output: 'stream',
                    parse: true,
                    multipart: true
                }
            }
        }); */
        server.route({
            method: 'DELETE',
            path: '/open-user/user/delete/{id}',
            handler: OpenItemHandler.delete_user,
            options: {
                validate: {
                    params: OpenItemValidation.delete.params, // misal validasi id
                    payload: OpenItemValidation.delete.payload,
                    failAction: (request, h, err) => {
                        console.error('❌ Validation Error:', err.message);
                        throw err;
                    }
                },
                payload: {
                    parse: true,
                    output: 'data',                 // JSON langsung jadi object
                    allow: ['application/json'],    // izinkan hanya JSON
                    multipart: false
                },
                tags: ['api'],
                description: 'Delete user by ID with payload'
            }
        });
        server.route({
            method: 'POST',
            path: '/loginuser',
            options: {
                handler: OpenItemHandler.login_user,
                validate: {
                    payload: OpenItemValidation.login.payload,
                    failAction: async (request, h, err) => {
                        console.error('🔥 Joi Validation Error:', err.message);
                        throw Boom.badRequest(err.message);
                    }
                }
            }
        });



    }
};
