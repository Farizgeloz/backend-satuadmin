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
            path: '/opendata/dataset_data_top',
            handler: OpenItemHandler.view_dataset_top,
            options: {
                validate: OpenItemValidation.query
            }
        });
        server.route({
            method: 'GET',
            path: '/opendata/dataset_detail_visitor_count/{id}',
            handler: OpenItemHandler.view_id
        });


        server.route({
            method: 'POST',
            path: '/opendata/dataset_visitor',
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
            path: '/opendata/dataset_download',
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
            path: '/opendata/dataset_permohonan/cek-tiket/{nomor}',
            handler: OpenItemHandler.view_opendata_permohonan_cek_tiket,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/opendata/dataset_permohonan/tiket',
            handler: OpenItemHandler.view_opendata_permohonan_tiket,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/opendata/dataset_permohonan/tiket/{nomor}',
            handler: OpenItemHandler.view_opendata_permohonan_tiket_cek,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/opendata/dataset_permohonan',
            handler: OpenItemHandler.view_opendata_permohonan,
            options: {
                validate: OpenItemValidation.query
            }
        });
        server.route({
            method: 'GET',
            path: '/opendata/dataset_permohonan/detail/{id}',
            handler: OpenItemHandler.view_opendata_permohonan_detail,
            options: {
                validate: OpenItemValidation.query
            }
        });
        server.route({
            method: 'GET',
            path: '/opendata/dataset_permohonan/detail_jumlah/{id}',
            handler: OpenItemHandler.view_opendata_permohonan_detail_jumlah,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'POST',
            path: '/opendata/dataset_permohonan',
            handler: OpenItemHandler.add_opendata_permohonan,
            options: {
                validate: OpenItemValidation.addpermohonan,
                payload: {
                    parse: true,
                    output: 'data',
                    allow: ['application/json']
                }
            }
        });

        server.route({
            method: 'POST',
            path: '/opendata/dataset_permohonan/tiket',
            handler: OpenItemHandler.add_opendata_permohonan_tiket,
            options: {
                validate: OpenItemValidation.addpermohonantiket,
                payload: {
                    parse: true,
                    output: 'data',
                    allow: ['application/json']
                }
            }
        });




        server.route({
            method: 'GET',
            path: '/opendata/artikel',
            handler: OpenItemHandler.view_list_artikel,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/opendata/artikel/detail/{title}',
            handler: OpenItemHandler.view_list_artikel_detail
        });

        server.route({
            method: 'GET',
            path: '/opendata/artikel_admin',
            handler: OpenItemHandler.view_list_artikel_admin,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/opendata/artikel/detail_admin/{id_artikel}',
            handler: OpenItemHandler.view_list_artikel_detail_admin
        });
        server.route({
            method: 'PATCH',
            path: '/opendata/artikel/update/{id}',
            handler: OpenItemHandler.update_artikel,
            options: {
                validate: {
                    payload: OpenItemValidation.edit.payload_artikel//,
                    //tambahan
                    /*failAction: async (request, h, err) => {
                        console.error('🔥 Joi Validation Error:', err.message);
                        throw Boom.badRequest(err.message);
                    }*/
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
            path: '/opendata/artikel/add',
            handler: OpenItemHandler.add_artikel,
            options: {
                validate: {
                    payload: OpenItemValidation.add.payload_artikel//,
                    //tambahan
                    /*failAction: async (request, h, err) => {
                        console.error('🔥 Joi Validation Error:', err.message);
                        throw Boom.badRequest(err.message);
                    }*/
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
            path: '/open-item/artikel/delete/{id}',
            handler: OpenItemHandler.delete_artikel,
            options: {
                validate: {
                    params: OpenItemValidation.delete_artikel.params, // misal validasi id
                    payload: OpenItemValidation.delete_artikel.payload,
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
                description: 'Delete komponen by ID with payload'
            }
        });

        server.route({
            method: 'GET',
            path: '/opendata/infografik',
            handler: OpenItemHandler.view_list_infografik,
            options: {
                validate: OpenItemValidation.query
            }
        });
        server.route({
            method: 'GET',
            path: '/opendata/infografik/admin',
            handler: OpenItemHandler.view_list_infografik_admin,
            options: {
                validate: OpenItemValidation.query
            }
        });
        server.route({
            method: 'GET',
            path: '/opendata/infografik/penyusun',
            handler: OpenItemHandler.view_list_infografik_penyusun,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/opendata/infografik/detail/{title}',
            handler: OpenItemHandler.view_list_infografik_detail
        });
        server.route({
            method: 'GET',
            path: '/opendata/infografik/detail_admin/{id_infografik}',
            handler: OpenItemHandler.view_list_infografik_detail_admin
        });
        server.route({
            method: 'PATCH',
            path: '/opendata/infografik/update/{id}',
            handler: OpenItemHandler.update_infografik,
            options: {
                validate: {
                    payload: OpenItemValidation.edit.payload_infografik//,
                    //tambahan
                    /*failAction: async (request, h, err) => {
                        console.error('🔥 Joi Validation Error:', err.message);
                        throw Boom.badRequest(err.message);
                    }*/
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
            path: '/opendata/infografik/add',
            handler: OpenItemHandler.add_infografik,
            options: {
                validate: {
                    payload: OpenItemValidation.edit.payload_infografik//,
                    //tambahan
                    /*failAction: async (request, h, err) => {
                        console.error('🔥 Joi Validation Error:', err.message);
                        throw Boom.badRequest(err.message);
                    }*/
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
            path: '/opendata/infografik/delete/{id}',
            handler: OpenItemHandler.delete_infografik,
            options: {
                validate: {
                    params: OpenItemValidation.delete_infografik.params, // misal validasi id
                    payload: OpenItemValidation.delete_infografik.payload,
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
                description: 'Delete komponen by ID with payload'
            }
        });

        server.route({
            method: 'GET',
            path: '/opendata/infografik_detail_visitor_count/{id}',
            handler: OpenItemHandler.view_infografik_visitor
        });


        server.route({
            method: 'POST',
            path: '/opendata/infografik_visitor',
            handler: OpenItemHandler.add_infografik_visitor,
            options: {
                payload: {
                    parse: true,
                    output: 'data',
                    allow: 'application/json'
                },
                validate: {
                    payload: Joi.object({
                        id_infografik: Joi.alternatives().try(Joi.string(), Joi.number()).required()
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
            path: '/opendata/infografik_download',
            handler: OpenItemHandler.add_infografik_download,
            options: {
                payload: {
                    parse: true,
                    output: 'data',
                    allow: 'application/json'
                },
                validate: {
                    payload: Joi.object({
                        id_infografik: Joi.alternatives().try(Joi.string(), Joi.number()).required()
                    }),
                    failAction: (request, h, err) => {
                        console.log('Joi validation error:', err.details);
                        throw err;
                    }
                }

            }
        });


    }
};
