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
            path: '/api/open-user/user',
            handler: OpenItemHandler.view_user,
            options: {
                //validate: OpenItemValidation.query
            }
        });
        server.route({
            method: 'GET',
            path: '/api/open-user/user/{id}',
            handler: OpenItemHandler.view_user_id
        });
        server.route({
            method: 'PATCH',
            path: '/api/open-user/user/update/{id}',
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
            path: '/api/open-user/user/add',
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
        server.route({
            method: 'DELETE',
            path: '/api/open-user/user/delete/{id}',
            handler: OpenItemHandler.delete_user
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
