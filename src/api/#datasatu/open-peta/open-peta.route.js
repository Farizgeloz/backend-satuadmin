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
            path: '/satupeta/count',
            handler: OpenItemHandler.view_count,
            options: {
                //validate: OpenItemValidation.query
            }
        });
        server.route({
            method: 'GET',
            path: '/satupeta/map_list',
            /*options: {
                pre: [verifyToken, isAdmin]
            },*/
            handler: OpenItemHandler.view_list
        });

        server.route({
            method: 'GET',
            path: '/satupeta/map_list2',
            handler: OpenItemHandler.view_list2,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/satupeta/map_list3',
            handler: OpenItemHandler.view_list3,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/satupeta/map_item',
            handler: OpenItemHandler.view_item,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/satupeta/map_item2',
            handler: OpenItemHandler.view_item2
        });

        server.route({
            method: 'GET',
            path: '/satupeta/map_data',
            handler: OpenItemHandler.view_data,
            options: {
                //validate: OpenItemValidation.view.payload
            }
        });

        server.route({
            method: 'GET',
            path: '/satupeta/map_data/admin',
            handler: OpenItemHandler.view_data_admin,
            options: {
                //validate: OpenItemValidation.view.payload
            }
        });

        server.route({
            method: 'GET',
            path: '/satupeta/map_data/admin/result',
            handler: OpenItemHandler.view_data_admin_result,
            options: {
                //validate: OpenItemValidation.view.payload
            }
        });

        server.route({
            method: 'GET',
            path: '/satupeta/map_data/admin/location',
            handler: OpenItemHandler.view_data_admin_resultlocation,
            options: {
                //validate: OpenItemValidation.view.payload
            }
        });

        server.route({
            method: 'GET',
            path: '/satupeta/map_data/admin/koleksi',
            handler: OpenItemHandler.view_data_admin_resultlocationmaplist,
            options: {
                //validate: OpenItemValidation.view.payload
            }
        });

        server.route({
            method: 'GET',
            path: '/satupeta/map_data/admin/geospasial',
            handler: OpenItemHandler.view_data_admin_geospasial,
            options: {
                //validate: OpenItemValidation.view.payload
            }
        });

        server.route({
            method: 'GET',
            path: '/satupeta/map_data/admin/kecdes',
            handler: OpenItemHandler.view_data_admin_kecamatan_desa,
            options: {
                //validate: OpenItemValidation.view.payload
            }
        });

        server.route({
            method: 'GET',
            path: '/satupeta/map_data/locationpoint/{id}',
            handler: OpenItemHandler.view_data_locationpoint,
            options: {
                //validate: OpenItemValidation.view.payload
            }
        });

        server.route({
            method: 'GET',
            path: '/satupeta/locations/detail/{id}',
            handler: OpenItemHandler.view_locations_id,
            options: {
                //validate: OpenItemValidation.view.payload
            }
        });

        

        server.route({
            method: 'PATCH',
            path: '/satupeta/locations/update/{id}',
            handler: OpenItemHandler.update_locations,
            options: {
                validate: {
                    payload: OpenItemValidation.edit.payload4
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
            path: '/satupeta/locations/add',
            options: {
                handler: OpenItemHandler.add_locations,
                validate: {
                    payload: OpenItemValidation.add.payload2
                    /*failAction: async (request, h, err) => {
                        console.error('🔥 Joi Validation Error:', err.message);
                        throw Boom.badRequest(err.message);
                    }*/
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
            path: '/satupeta/locations/addmulti',
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

                        admin: Joi.number().allow('', null),

                        jenis: Joi.string().allow('', null),      // ✅ HANYA BOLEH DI SINI
                        komponen: Joi.string().allow('', null)
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
            path: '/satupeta/locations/addcsv',
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
            path: '/satupeta/locations/delete/{id}',
            handler: OpenItemHandler.delete_locations,
            options: {
                validate: {
                    params: OpenItemValidation.delete_peta.params, // misal validasi id
                    payload: OpenItemValidation.delete_peta.payload,
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
            path: '/satupeta/Koleksi-Peta/detail/{id}',
            handler: OpenItemHandler.view_location_maplist_id,
            options: {
                //validate: OpenItemValidation.view.payload
            }
        });

        server.route({
            method: 'PATCH',
            path: '/satupeta/Koleksi-Peta/update/{id}',
            handler: OpenItemHandler.update_location_maplist,
            options: {
                validate: {
                    payload: OpenItemValidation.edit.payload_maplist
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
            path: '/satupeta/Koleksi-Peta/addmulti',
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
                        admin: Joi.number().required(),
                        jenis: Joi.string().allow('', null),
                        komponen: Joi.string().allow('', null)
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
            path: '/satupeta/Koleksi-Peta/addcsv',
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
            path: '/satupeta/Koleksi-Peta/delete/{id}',
            handler: OpenItemHandler.delete_location_maplist,
            options: {
                validate: {
                    params: OpenItemValidation.delete_peta.params, // misal validasi id
                    payload: OpenItemValidation.delete_peta.payload,
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
            path: '/satupeta/location_point/detail/{id}',
            handler: OpenItemHandler.view_location_point_id,
            options: {
                //validate: OpenItemValidation.view.payload
            }
        });

        server.route({
            method: 'PATCH',
            path: '/satupeta/location_point/update/{id}',
            handler: OpenItemHandler.update_location_point,
            options: {
                validate: {
                    payload: OpenItemValidation.edit.payload2
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
            path: '/satupeta/location_point/add',
            options: {
                handler: OpenItemHandler.add_location_point,
                validate: {
                    payload: OpenItemValidation.edit.payload2
                    /*failAction: async (request, h, err) => {
                        console.error('🔥 Joi Validation Error:', err.message);
                        throw Boom.badRequest(err.message);
                    }*/
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
            path: '/satupeta/location_point/addmulti',
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
                        ).required(),

                        admin: Joi.number().required(),
                        jenis: Joi.string().allow('', null),
                        komponen: Joi.string().allow('', null)
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
            path: '/satupeta/location_point/addcsv',
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
            path: '/satupeta/location_point/delete/{id}',
            handler: OpenItemHandler.delete_location_point,
            options: {
                validate: {
                    params: OpenItemValidation.delete_peta.params, // misal validasi id
                    payload: OpenItemValidation.delete_peta.payload,
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
            path: '/satupeta/map_datageospasial',
            handler: OpenItemHandler.view_datageospasial2,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/satupeta/geospasial/detail/{id}',
            handler: OpenItemHandler.view_geospasial_id,
            options: {
                //validate: OpenItemValidation.view.payload
            }
        });

        server.route({
            method: 'PATCH',
            path: '/satupeta/geospasial/update/{id}',
            handler: OpenItemHandler.update_geospasial,
            options: {
                validate: {
                    payload: OpenItemValidation.edit.payloadgeospasial
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
            path: '/satupeta/geospasial/add',
            options: {
                handler: OpenItemHandler.add_geospasial,
                validate: {
                    payload: OpenItemValidation.edit.payload2
                    /*failAction: async (request, h, err) => {
                        console.error('🔥 Joi Validation Error:', err.message);
                        throw Boom.badRequest(err.message);
                    }*/
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
            path: '/satupeta/geospasial/addmulti',
            options: {
                handler: OpenItemHandler.addmulti_geospasial,
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
                                nama_geospasial: Joi.string().required(),
                                luas_area: Joi.string().required(),
                                satuan: Joi.string().required(),
                                map_color: Joi.string().required(),
                                geojson: Joi.string().required(),
                                id_maplist: Joi.string().required(),
                                kecamatan_id: Joi.string().required(),
                                desa_id: Joi.string().required()         // <-- pastikan string
                            })
                        ).required(),

                        admin: Joi.number().required(),
                        jenis: Joi.string().allow('', null),
                        komponen: Joi.string().allow('', null)
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
            path: '/satupeta/geospasial/addcsv',
            options: {
                handler: OpenItemHandler.addcsv_geospasial,
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
            path: '/satupeta/geospasial/delete/{id}',
            handler: OpenItemHandler.delete_geospasial,
            options: {
                validate: {
                    params: OpenItemValidation.delete_peta.params, // misal validasi id
                    payload: OpenItemValidation.delete_peta.payload,
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
            path: '/satupeta/map_datageo_kecamatan',
            handler: OpenItemHandler.view_datageo_kecamatan,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/satupeta/map_datageo_desa',
            handler: OpenItemHandler.view_datageo_desa,
            options: {
                validate: OpenItemValidation.query
            }
        });

        //SERVER ADMIN

        server.route({
            method: 'GET',
            path: '/satupeta/locationmaplist_detail/{id}',
            handler: OpenItemHandler.view_locationmaplist_id
        });

        server.route({
            method: 'POST',
            path: '/satupeta/locationmaplist_add',
            options: {
                handler: OpenItemHandler.add_locationmaplist,
                validate: {
                    payload: OpenItemValidation.add.payload
                    /*failAction: async (request, h, err) => {
                        console.error('🔥 Joi Validation Error:', err.message);
                        throw Boom.badRequest(err.message);
                    }*/
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
            path: '/satupeta/locationmaplist_update/{id}',
            handler: OpenItemHandler.update_locationmaplist,
            options: {
                validate: {
                    payload: OpenItemValidation.edit.payload
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
            path: '/satupeta/locationmaplist_delete/{id}',
            handler: OpenItemHandler.delete_locationmaplist
        });

        server.route({
            method: 'POST',
            path: '/satupeta/locationmaplist_visitor',
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
            path: '/satupeta/locationmaplist_download',
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
            path: '/satupeta/map_artikel',
            handler: OpenItemHandler.view_list_artikel,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/satupeta/map_artikel/detail/{title}',
            handler: OpenItemHandler.view_list_artikel_detail
        });

        server.route({
            method: 'GET',
            path: '/satupeta/map_artikel_admin',
            handler: OpenItemHandler.view_list_artikel_admin,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/satupeta/map_artikel/detail_admin/{id_artikel}',
            handler: OpenItemHandler.view_list_artikel_detail_admin
        });
        server.route({
            method: 'PATCH',
            path: '/satupeta/map_artikel/update/{id}',
            handler: OpenItemHandler.update_artikel,
            options: {
                validate: {
                    payload: OpenItemValidation.edit.payload_artikel
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
            path: '/satupeta/map_artikel/add',
            handler: OpenItemHandler.add_artikel,
            options: {
                validate: {
                    payload: OpenItemValidation.add.payload_artikel
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
            path: '/satupeta/map_artikel/delete/{id}',
            handler: OpenItemHandler.delete_artikel
        });

    }
};
