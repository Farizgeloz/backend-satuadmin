'use strict';

const OpenItemHandler = require('./open-item.handler');
const OpenItemValidation = require('./open-item.validation');

/*** WHAT DO HERE
 * - saving error report (>=500) via  onPreResponse
 */
exports.plugin = {
    name: 'OpenItemRoute',
    register: (server, options) => {

        server.route({
            method: 'GET',
            path: '/openitem/view_count',
            handler: OpenItemHandler.view_count,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/site_ekosistem_setting',
            handler: OpenItemHandler.view_ekosistem_setting,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'PATCH',
            path: '/openitem/site_ekosistem_setting_update/{id}',
            handler: OpenItemHandler.update_ekosistem_setting,
            options: {
                validate: {
                    payload: OpenItemValidation.edit_setting.payload//,
                    //tambahan
                    /*failAction: async (request, h, err) => {
                        console.error('🔥 Joi Validation Error:', err.message);
                        throw Boom.badRequest(err.message);
                    }*/
                },
                payload: {
                    output: 'stream',
                    parse: true,
                    multipart: true,
                    maxBytes: 1048576 * 5 // optional: limit size to 5MB
                }
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/menu-ekositem',
            handler: OpenItemHandler.view_ekosistem_menu,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/menu-ekositem2',
            handler: OpenItemHandler.view_ekosistem2_menu,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/ekosistem-bioinfo',
            handler: OpenItemHandler.view_ekosistem_bioinfo,
            options: {
                //validate: OpenItemValidation.query
            }
        });


        server.route({
            method: 'GET',
            path: '/openitem/ekosistem-iklan',
            handler: OpenItemHandler.view_ekosistem_iklan,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/ekosistem-iklan/detail/{id}',
            handler: OpenItemHandler.view_ekosistem_iklan_id
        });
        server.route({
            method: 'PATCH',
            path: '/openitem/ekosistem-iklan/update/{id}',
            handler: OpenItemHandler.update_ekosistem_iklan,
            options: {
                validate: {
                    payload: OpenItemValidation.entry_iklan.payload//,
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
            path: '/openitem/ekosistem-iklan/add',
            handler: OpenItemHandler.add_ekosistem_iklan,
            options: {
                validate: {
                    payload: OpenItemValidation.entry_iklan.payload//,
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
            path: '/openitem/ekosistem-iklan/delete/{id}',
            handler: OpenItemHandler.delete_ekosistem_iklan,
            options: {
                validate: {
                    params: OpenItemValidation.delete_iklan.params, // misal validasi id
                    payload: OpenItemValidation.delete_iklan.payload,
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
            path: '/openitem/ekosistem-visitor',
            handler: OpenItemHandler.view_ekosistem_visitor,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'POST',
            path: '/openitem/ekosistem-visitor/delete',
            handler: OpenItemHandler.delete_ekosistem_visitor,
            options: {
                auth: false, // sesuaikan jika ada auth
                validate: {
                    payload: (value, options) => {
                        if (!Array.isArray(value.ids)) {
                            throw new Error('Payload harus berisi array ids');
                        }

                        return value;
                    },
                    failAction: (request, h, err) => {
                        throw err;
                    }
                }
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/ekosistem_list',
            handler: OpenItemHandler.view_ekosistem_list,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/ekosistem_list_detail/{id}',
            handler: OpenItemHandler.view_ekosistem_list_id
        });

        server.route({
            method: 'POST',
            path: '/openitem/ekosistem_list_add',
            handler: OpenItemHandler.add_ekosistem_list,
            options: {
                validate: {
                    payload: OpenItemValidation.add_ekosistem_list.payload//,
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
            method: 'PATCH',
            path: '/openitem/ekosistem_list_update/{id}',
            handler: OpenItemHandler.update_ekosistem_list,
            options: {
                validate: {
                    payload: OpenItemValidation.edit_ekosistem_list.payload//,
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
            path: '/openitem/ekosistem_list_delete/{id}',
            handler: OpenItemHandler.delete_ekosistem_list
        });

        server.route({
            method: 'GET',
            path: '/openitem/ekosistem_bio',
            handler: OpenItemHandler.view_ekosistem_bio,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/ekosistem_bio_detail/{id}',
            handler: OpenItemHandler.view_ekosistem_bio_id
        });

        server.route({
            method: 'PATCH',
            path: '/openitem/ekosistem_bio/update/{id}',
            handler: OpenItemHandler.update_ekosistem_bio,
            options: {
                validate: {
                    payload: OpenItemValidation.edit_bio.payload//,
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
            method: 'GET',
            path: '/openitem/dashboardlist',
            handler: OpenItemHandler.view_ekosistem_list,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/ekosistem-pengumuman',
            handler: OpenItemHandler.view_ekosistem_pengumuman,
            options: {
                //validate: OpenItemValidation.query
            }
        });


        server.route({
            method: 'GET',
            path: '/openitem/site_opendata_setting',
            handler: OpenItemHandler.view_opendata_setting,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'PATCH',
            path: '/openitem/site_opendata_setting_update/{id}',
            handler: OpenItemHandler.update_opendata_setting,
            options: {
                validate: {
                    payload: OpenItemValidation.edit_setting.payload//,
                    //tambahan
                    /*failAction: async (request, h, err) => {
                        console.error('🔥 Joi Validation Error:', err.message);
                        throw Boom.badRequest(err.message);
                    }*/
                },
                payload: {
                    output: 'stream',
                    parse: true,
                    multipart: true,
                    maxBytes: 1048576 * 5 // optional: limit size to 5MB
                }
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/menu-opendata',
            handler: OpenItemHandler.view_opendata_menu,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/menu-opendata2',
            handler: OpenItemHandler.view_opendata2_menu,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/site_satupeta_setting',
            handler: OpenItemHandler.view_satupeta_setting,
            options: {
                //validate: OpenItemValidation.query
            }
        });
        server.route({
            method: 'PATCH',
            path: '/openitem/site_satupeta_setting_update/{id}',
            handler: OpenItemHandler.update_satupeta_setting,
            options: {
                validate: {
                    payload: OpenItemValidation.edit_setting.payload//,
                    //tambahan
                    /*failAction: async (request, h, err) => {
                        console.error('🔥 Joi Validation Error:', err.message);
                        throw Boom.badRequest(err.message);
                    }*/
                },
                payload: {
                    output: 'stream',
                    parse: true,
                    multipart: true,
                    maxBytes: 1048576 * 5 // optional: limit size to 5MB
                }
            }
        });
        server.route({
            method: 'GET',
            path: '/openitem/menu-satupeta',
            handler: OpenItemHandler.view_satupeta_menu,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/menu-satupeta2',
            handler: OpenItemHandler.view_satupeta2_menu,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/opendata-iklan',
            handler: OpenItemHandler.view_opendata_iklan,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/opendata-iklan/detail/{id}',
            handler: OpenItemHandler.view_opendata_iklan_id
        });
        server.route({
            method: 'PATCH',
            path: '/openitem/opendata-iklan/update/{id}',
            handler: OpenItemHandler.update_opendata_iklan,
            options: {
                validate: {
                    payload: OpenItemValidation.entry_iklan.payload//,
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
            path: '/openitem/opendata-iklan/add',
            handler: OpenItemHandler.add_opendata_iklan,
            options: {
                validate: {
                    payload: OpenItemValidation.entry_iklan.payload//,
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
            path: '/openitem/opendata-iklan/delete/{id}',
            handler: OpenItemHandler.delete_opendata_iklan,
            options: {
                validate: {
                    params: OpenItemValidation.delete_iklan.params, // misal validasi id
                    payload: OpenItemValidation.delete_iklan.payload,
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
            path: '/openitem/opendata-bantuan',
            handler: OpenItemHandler.view_opendata_bantuan,
            options: {
                //validate: OpenItemValidation.query
            }
        });
        server.route({
            method: 'GET',
            path: '/openitem/opendata-bantuan/admin',
            handler: OpenItemHandler.view_opendata_bantuan_admin,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/opendata-bantuan/detail/{id}',
            handler: OpenItemHandler.view_opendata_bantuan_id
        });
        server.route({
            method: 'PATCH',
            path: '/openitem/opendata-bantuan/update/{id}',
            handler: OpenItemHandler.update_opendata_bantuan,
            options: {
                validate: {
                    payload: OpenItemValidation.entry_bantuan.payload//,
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
            path: '/openitem/opendata-bantuan/add',
            handler: OpenItemHandler.add_opendata_bantuan,
            options: {
                validate: {
                    payload: OpenItemValidation.entry_bantuan.payload
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
            path: '/openitem/opendata-bantuan/delete/{id}',
            handler: OpenItemHandler.delete_opendata_bantuan,
            options: {
                validate: {
                    params: OpenItemValidation.delete_bantuan.params, // misal validasi id
                    payload: OpenItemValidation.delete_bantuan.payload,
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
            path: '/openitem/opendata_feedback',
            handler: OpenItemHandler.view_opendata_feedback,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'POST',
            path: '/openitem/opendata_feedback',
            handler: OpenItemHandler.add_opendata_feedback,
            options: {
                validate: OpenItemValidation.addfeedback,
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
            path: '/openitem/opendata_feedback/delete',
            handler: OpenItemHandler.delete_opendata_feedback,
            options: {
                auth: false, // sesuaikan jika ada auth
                validate: {
                    payload: (value, options) => {
                        if (!Array.isArray(value.ids)) {
                            throw new Error('Payload harus berisi array ids');
                        }

                        return value;
                    },
                    failAction: (request, h, err) => {
                        throw err;
                    }
                }
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/satupeta-iklan',
            handler: OpenItemHandler.view_satupeta_iklan,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/satupeta-iklan/detail/{id}',
            handler: OpenItemHandler.view_satupeta_iklan_id
        });
        server.route({
            method: 'PATCH',
            path: '/openitem/satupeta-iklan/update/{id}',
            handler: OpenItemHandler.update_satupeta_iklan,
            options: {
                validate: {
                    payload: OpenItemValidation.entry_iklan.payload
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
            path: '/openitem/satupeta-iklan/add',
            handler: OpenItemHandler.add_satupeta_iklan,
            options: {
                validate: {
                    payload: OpenItemValidation.entry_iklan.payload
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
            path: '/openitem/satupeta-iklan/delete/{id}',
            handler: OpenItemHandler.delete_satupeta_iklan,
            options: {
                validate: {
                    params: OpenItemValidation.delete_iklan.params, // misal validasi id
                    payload: OpenItemValidation.delete_iklan.payload,
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
            path: '/openitem/satupeta-bantuan',
            handler: OpenItemHandler.view_satupeta_bantuan,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/satupeta-bantuan/detail/{id}',
            handler: OpenItemHandler.view_satupeta_bantuan_id
        });
        server.route({
            method: 'PATCH',
            path: '/openitem/satupeta-bantuan/update/{id}',
            handler: OpenItemHandler.update_satupeta_bantuan,
            options: {
                validate: {
                    payload: OpenItemValidation.entry_bantuan.payload//,
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
            path: '/openitem/satupeta-bantuan/add',
            handler: OpenItemHandler.add_satupeta_bantuan,
            options: {
                validate: {
                    payload: OpenItemValidation.entry_bantuan.payload
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
            path: '/openitem/satupeta-bantuan/delete/{id}',
            handler: OpenItemHandler.delete_satupeta_bantuan,
            options: {
                validate: {
                    params: OpenItemValidation.delete_bantuan.params, // misal validasi id
                    payload: OpenItemValidation.delete_bantuan.payload,
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
            path: '/openitem/satupeta_feedback',
            handler: OpenItemHandler.view_satupeta_feedback,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'POST',
            path: '/openitem/satupeta_feedback',
            handler: OpenItemHandler.add_satupeta_feedback,
            options: {
                validate: OpenItemValidation.addfeedback,
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
            path: '/openitem/satupeta_feedback/delete',
            handler: OpenItemHandler.delete_satupeta_feedback,
            options: {
                auth: false, // sesuaikan jika ada auth
                validate: {
                    payload: (value, options) => {
                        if (!Array.isArray(value.ids)) {
                            throw new Error('Payload harus berisi array ids');
                        }

                        return value;
                    },
                    failAction: (request, h, err) => {
                        throw err;
                    }
                }
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/images_item',
            handler: OpenItemHandler.view_image_item,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/komponen',
            handler: OpenItemHandler.view_komponen,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/komponen_detail/{title}',
            handler: OpenItemHandler.view_komponen_id
        });

        server.route({
            method: 'POST',
            path: '/openitem/komponen_add',
            handler: OpenItemHandler.add_komponen,
            options: {
                validate: OpenItemValidation.add_komponen,
                payload: {
                    maxBytes: 1024 * 1024 * 20,  // Maksimal 20 MB
                    output: 'stream',
                    parse: true,
                    multipart: true
                }
            }
        });

        server.route({
            method: 'PATCH',
            path: '/openitem/komponen_update/{id}',
            handler: OpenItemHandler.update_komponen,
            options: {
                validate: {
                    payload: OpenItemValidation.edit_komponen.payload//,
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
            path: '/openitem/komponen_delete/{id}',
            handler: OpenItemHandler.delete_komponen,
            options: {
                validate: {
                    params: OpenItemValidation.delete_komponen.params, // misal validasi id
                    payload: OpenItemValidation.delete_komponen.payload,
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
            path: '/openitem/images',
            handler: OpenItemHandler.view_images,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/images_detail/{id}',
            handler: OpenItemHandler.view_images_id
        });

        server.route({
            method: 'PATCH',
            path: '/openitem/images_update/{id}',
            handler: OpenItemHandler.update_images,
            options: {
                validate: {
                    payload: OpenItemValidation.edit_images.payload
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
            method: 'GET',
            path: '/openitem/satker_code',
            handler: OpenItemHandler.view_satker_code,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/satker_code_detail/{id}',
            handler: OpenItemHandler.view_satker_code_id
        });

        server.route({
            method: 'POST',
            path: '/openitem/satker_code_add',
            handler: OpenItemHandler.add_satker_code,
            options: {
                validate: {
                    payload: OpenItemValidation.add_satker_code.payload
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
            method: 'PATCH',
            path: '/openitem/satker_code_update/{id}',
            handler: OpenItemHandler.update_satker_code,
            options: {
                validate: {
                    payload: OpenItemValidation.edit_satker_code.payload
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
            path: '/openitem/satker_code_delete/{id}',
            handler: OpenItemHandler.delete_satker_code
        });

        server.route({
            method: 'GET',
            path: '/openitem/bidang_urusan',
            handler: OpenItemHandler.view_bidangurusan,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/satker_code_search',
            handler: OpenItemHandler.view_satkercode_search,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/satker',
            handler: OpenItemHandler.view_satker,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/openitem/log',
            handler: OpenItemHandler.view_log,
            options: {
                //validate: OpenItemValidation.query
            }
        });

    }
};
