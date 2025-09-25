'use strict';

const Boom = require('@hapi/boom');
const OpenItemHandler = require('./open-dataset.handler');
const OpenItemValidation = require('./open-dataset.validation');
const Joi = require('joi');

/*** WHAT DO HERE
 * - saving error report (>=500) via  onPreResponse
 */
exports.plugin = {
    name: 'OpenDatasetRoute',
    register: (server, options) => {

        server.route({
            method: 'GET',
            path: '/api/opendata/count',
            handler: OpenItemHandler.view_count,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/opendata/dataset_graph_satker',
            handler: OpenItemHandler.view_graph_satker,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/opendata/dataset_graph_info',
            handler: OpenItemHandler.view_graph_info,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        /* server.route({
            method: 'GET',
            path: '/api/opendata/dataset_info',
            handler: OpenItemHandler.view_info,
            options: {
                //validate: OpenItemValidation.query
            }
        }); */

        server.route({
            method: 'GET',
            path: '/api/opendata/dataset_item',
            handler: OpenItemHandler.view_item,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/opendata/dataset_data_top',
            handler: OpenItemHandler.view_dataset_top,
            options: {
                validate: OpenItemValidation.query
            }
        });


        server.route({
            method: 'GET',
            path: '/api/opendata/dataset_detail_visitor_count/{id}',
            handler: OpenItemHandler.view_id
        });


        server.route({
            method: 'POST',
            path: '/api/opendata/dataset_visitor',
            handler: OpenItemHandler.add_dataset_visitor,
            options: {
                payload: {
                    parse: true,
                    output: 'data',
                    allow: 'application/json'
                },
                validate: {
                    payload: Joi.object({
                        id_dataset: Joi.alternatives().try(Joi.string(), Joi.number()).required()
                    }),
                    failAction: (request, h, err) => {
                        console.log('Joi validation error:', err.details);
                        throw err;
                    }
                }

            }
        });

        server.route({
            method: 'POST',
            path: '/api/opendata/dataset_download',
            handler: OpenItemHandler.add_dataset_download,
            options: {
                payload: {
                    parse: true,
                    output: 'data',
                    allow: 'application/json'
                },
                validate: {
                    payload: Joi.object({
                        id_dataset: Joi.alternatives().try(Joi.string(), Joi.number()).required()
                    }),
                    failAction: (request, h, err) => {
                        console.log('Joi validation error:', err.details);
                        throw err;
                    }
                }

            }
        });

        


        server.route({
            method: 'GET',
            path: '/api/opendata/artikel',
            handler: OpenItemHandler.view_list_artikel,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/opendata/artikel/detail/{title}',
            handler: OpenItemHandler.view_list_artikel_detail
        });
        server.route({
            method: 'GET',
            path: '/api/opendata/artikel/detail_admin/{id_artikel}',
            handler: OpenItemHandler.view_list_artikel_detail_admin
        });
        server.route({
            method: 'PATCH',
            path: '/api/opendata/artikel/update/{id}',
            handler: OpenItemHandler.update_artikel,
            options: {
                validate: {
                    payload: OpenItemValidation.edit.payload_artikel,
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
            path: '/api/opendata/artikel/add',
            handler: OpenItemHandler.add_artikel,
            options: {
                validate: {
                    payload: OpenItemValidation.add.payload_artikel,
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
            method: 'DELETE',
            path: '/opendata/artikel/delete/{id}',
            handler: OpenItemHandler.delete_artikel
        });


    }
};
