'use strict';

const OpenItemHandler = require('./open-peta.handler');
const OpenItemValidation = require('./open-peta.validation');
const { verifyToken, isAdmin } = require('../middleware/auth');
const Joi = require('joi');

/*** WHAT DO HERE
 * - saving error report (>=500) via  onPreResponse
 */
exports.plugin = {
    name: 'SatuPetaRoute',
    register: (server, options) => {

        server.route({
            method: 'GET',
            path: '/api/satupeta/count',
            handler: OpenItemHandler.view_count,
            options: {
                //validate: OpenItemValidation.query
            }
        });
        server.route({
            method: 'GET',
            path: '/api/satupeta/map_list',
            /*options: {
                pre: [verifyToken, isAdmin]
            },*/
            handler: OpenItemHandler.view_list
        });

        server.route({
            method: 'GET',
            path: '/api/satupeta/map_list2',
            handler: OpenItemHandler.view_list2,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/satupeta/map_list3',
            handler: OpenItemHandler.view_list3,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/satupeta/map_item',
            handler: OpenItemHandler.view_item,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/satupeta/map_item2',
            handler: OpenItemHandler.view_item2
        });

        server.route({
            method: 'GET',
            path: '/api/satupeta/map_data',
            handler: OpenItemHandler.view_data,
            options: {
                //validate: OpenItemValidation.view.payload
            }
        });

        server.route({
            method: 'GET',
            path: '/api/satupeta/map_data/admin',
            handler: OpenItemHandler.view_data_admin,
            options: {
                //validate: OpenItemValidation.view.payload
            }
        });

        server.route({
            method: 'GET',
            path: '/api/satupeta/locations/detail/{id}',
            handler: OpenItemHandler.view_locations_id,
            options: {
                //validate: OpenItemValidation.view.payload
            }
        });

        server.route({
            method: 'PATCH',
            path: '/api/satupeta/locations/update/{id}',
            handler: OpenItemHandler.update_locations,
            options: {
                validate: {
                    payload: OpenItemValidation.edit.payload4,
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
            path: '/api/satupeta/locations/add',
            options: {
                handler: OpenItemHandler.add_locations,
                validate: {
                    payload: OpenItemValidation.add.payload2,
                    failAction: async (request, h, err) => {
                        console.error('🔥 Joi Validation Error:', err.message);
                        throw Boom.badRequest(err.message);
                    }
                },
                payload: {
                    maxBytes: 1024 * 1024 * 20,  // 20 MB
                    output: 'stream',
                    parse: true,
                    multipart: true
                }
            }
        });

        server.route({
            method: 'POST',
            path: '/api/satupeta/locations/addmulti',
            options: {
                handler: OpenItemHandler.addmulti_locations,
                payload: {
                    parse: true,          // parse JSON
                    output: 'data',
                    multipart: false,
                    allow: 'application/json'  // wajib agar Hapi mengenali JSON
                },
                validate: {
                    payload: Joi.object({
                        locations: Joi.array().items(
                            Joi.object({
                                nama_location: Joi.string().required(),
                                sektor_id: Joi.string().required(),
                                satker_id: Joi.string().required()
                            })
                        ).required(),
                        admin: Joi.string().required()

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
            path: '/api/satupeta/locations/addcsv',
            options: {
                handler: OpenItemHandler.addcsv_locations,
                payload: {
                    maxBytes: 1024 * 1024 * 20,  // 20 MB
                    output: 'stream',
                    parse: true,
                    multipart: true
                }
            }
        });

        server.route({
            method: 'DELETE',
            path: '/api/satupeta/locations/delete/{id}',
            handler: OpenItemHandler.delete_locations
        });

        server.route({
            method: 'GET',
            path: '/api/satupeta/Koleksi-Peta/detail/{id}',
            handler: OpenItemHandler.view_location_maplist_id,
            options: {
                //validate: OpenItemValidation.view.payload
            }
        });

        server.route({
            method: 'PATCH',
            path: '/api/satupeta/Koleksi-Peta/update/{id}',
            handler: OpenItemHandler.update_location_maplist,
            options: {
                validate: {
                    payload: OpenItemValidation.edit.payload_maplist,
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
            path: '/api/satupeta/Koleksi-Peta/addmulti',
            options: {
                handler: OpenItemHandler.addmulti_location_maplist,
                payload: {
                    parse: true,
                    output: 'stream',
                    multipart: true,
                    maxBytes: 10 * 1024 * 1024,
                    allow: 'multipart/form-data'
                },
                validate: {
                    payload: Joi.object({
                        locations: Joi.string().required(),
                        admin: Joi.string().required()
                    }).unknown(true),   // ⬅️ penting agar file_0, file_1 tidak ditolak
                    failAction: (request, h, err) => {
                        console.log('Joi validation error:', err.details);
                        throw err;
                    }
                }
            }
        });

        server.route({
            method: 'POST',
            path: '/api/satupeta/Koleksi-Peta/addcsv',
            options: {
                handler: OpenItemHandler.addcsv_location_maplist,
                payload: {
                    maxBytes: 1024 * 1024 * 20,  // 20 MB
                    output: 'stream',
                    parse: true,
                    multipart: true
                }
            }
        });

        server.route({
            method: 'DELETE',
            path: '/api/satupeta/Koleksi-Peta/delete/{id}',
            handler: OpenItemHandler.delete_location_maplist
        });

        server.route({
            method: 'GET',
            path: '/api/satupeta/location_point/detail/{id}',
            handler: OpenItemHandler.view_location_point_id,
            options: {
                //validate: OpenItemValidation.view.payload
            }
        });

        server.route({
            method: 'PATCH',
            path: '/api/satupeta/location_point/update/{id}',
            handler: OpenItemHandler.update_location_point,
            options: {
                validate: {
                    payload: OpenItemValidation.edit.payload2,
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
            path: '/api/satupeta/location_point/add',
            options: {
                handler: OpenItemHandler.add_location_point,
                validate: {
                    payload: OpenItemValidation.edit.payload2,
                    failAction: async (request, h, err) => {
                        console.error('🔥 Joi Validation Error:', err.message);
                        throw Boom.badRequest(err.message);
                    }
                },
                payload: {
                    maxBytes: 1024 * 1024 * 20,  // 20 MB
                    output: 'stream',
                    parse: true,
                    multipart: true
                }
            }
        });

        server.route({
            method: 'POST',
            path: '/api/satupeta/location_point/addmulti',
            options: {
                handler: OpenItemHandler.addmulti_location_point,
                payload: {
                    parse: true,          // parse JSON
                    output: 'data',
                    multipart: false,
                    allow: 'application/json'  // wajib agar Hapi mengenali JSON
                },
                validate: {
                    payload: Joi.object({
                        locations: Joi.array().items(
                            Joi.object({
                                nama_location_point: Joi.string().required(),
                                coordinat: Joi.string().required(),
                                location_id: Joi.string().required(),
                                kecamatan_id: Joi.string().required(),
                                desa_id: Joi.string().required()
                            })
                        ).required()
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
            path: '/api/satupeta/location_point/addcsv',
            options: {
                handler: OpenItemHandler.addcsv_location_point,
                payload: {
                    maxBytes: 1024 * 1024 * 20,  // 20 MB
                    output: 'stream',
                    parse: true,
                    multipart: true
                }
            }
        });

        server.route({
            method: 'DELETE',
            path: '/api/satupeta/location_point/delete/{id}',
            handler: OpenItemHandler.delete_location_point
        });

        server.route({
            method: 'GET',
            path: '/api/satupeta/map_datageo_kecamatan',
            handler: OpenItemHandler.view_datageo_kecamatan,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/satupeta/map_datageo_desa',
            handler: OpenItemHandler.view_datageo_desa,
            options: {
                validate: OpenItemValidation.query
            }
        });

        //SERVER ADMIN

        server.route({
            method: 'GET',
            path: '/api/satupeta/locationmaplist_detail/{id}',
            handler: OpenItemHandler.view_locationmaplist_id
        });

        server.route({
            method: 'POST',
            path: '/api/satupeta/locationmaplist_add',
            options: {
                handler: OpenItemHandler.add_locationmaplist,
                validate: {
                    payload: OpenItemValidation.add.payload,
                    failAction: async (request, h, err) => {
                        console.error('🔥 Joi Validation Error:', err.message);
                        throw Boom.badRequest(err.message);
                    }
                },
                payload: {
                    maxBytes: 1024 * 1024 * 20,  // 20 MB
                    output: 'stream',
                    parse: true,
                    multipart: true
                }
            }
        });


        server.route({
            method: 'PATCH',
            path: '/api/satupeta/locationmaplist_update/{id}',
            handler: OpenItemHandler.update_locationmaplist,
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
            method: 'DELETE',
            path: '/api/satupeta/locationmaplist_delete/{id}',
            handler: OpenItemHandler.delete_locationmaplist
        });

        server.route({
            method: 'POST',
            path: '/api/satupeta/locationmaplist_visitor',
            handler: OpenItemHandler.add_location_maplist_visitor,
            options: {
                payload: {
                    parse: true,
                    output: 'data',
                    allow: 'application/json'
                },
                validate: {
                    payload: Joi.object({
                        id_maplist: Joi.alternatives().try(Joi.string(), Joi.number()).required()
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
            path: '/api/satupeta/locationmaplist_download',
            handler: OpenItemHandler.add_location_maplist_download,
            options: {
                payload: {
                    parse: true,
                    output: 'data',
                    allow: 'application/json'
                },
                validate: {
                    payload: Joi.object({
                        id_maplist: Joi.alternatives().try(Joi.string(), Joi.number()).required()
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
            path: '/api/satupeta/map_artikel',
            handler: OpenItemHandler.view_list_artikel,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/satupeta/map_artikel/detail/{title}',
            handler: OpenItemHandler.view_list_artikel_detail
        });
        server.route({
            method: 'GET',
            path: '/api/satupeta/map_artikel/detail_admin/{id_artikel}',
            handler: OpenItemHandler.view_list_artikel_detail_admin
        });
        server.route({
            method: 'PATCH',
            path: '/api/satupeta/map_artikel/update/{id}',
            handler: OpenItemHandler.update_satupeta_artikel,
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
            path: '/api/satupeta/map_artikel/add',
            handler: OpenItemHandler.add_satupeta_artikel,
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
            path: '/satupeta/map_artikel/delete/{id}',
            handler: OpenItemHandler.delete_satupeta_artikel
        });

    }
};
