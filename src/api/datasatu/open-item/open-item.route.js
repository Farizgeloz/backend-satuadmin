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
            path: '/api/open-item/site_ekosistem_setting',
            handler: OpenItemHandler.view_ekosistem_setting,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'PATCH',
            path: '/api/open-item/site_ekosistem_setting_update/{id}',
            handler: OpenItemHandler.update_ekosistem_setting,
            options: {
                validate: {
                    payload: OpenItemValidation.edit_setting.payload,
                    //tambahan
                    failAction: async (request, h, err) => {
                        console.error('🔥 Joi Validation Error:', err.message);
                        throw Boom.badRequest(err.message);
                    }
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
            path: '/api/open-item/menu-ekositem',
            handler: OpenItemHandler.view_ekosistem_menu,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/menu-ekositem2',
            handler: OpenItemHandler.view_ekosistem2_menu,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/ekosistem-bioinfo',
            handler: OpenItemHandler.view_ekosistem_bioinfo,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/ekosistem-iklan',
            handler: OpenItemHandler.view_ekosistem_iklan,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/ekosistem-iklan/detail/{id}',
            handler: OpenItemHandler.view_ekosistem_iklan_id
        });
        server.route({
            method: 'PATCH',
            path: '/api/open-item/ekosistem-iklan/update/{id}',
            handler: OpenItemHandler.update_ekosistem_iklan,
            options: {
                validate: {
                    payload: OpenItemValidation.entry_iklan.payload,
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
            path: '/api/open-item/ekosistem-iklan/add',
            handler: OpenItemHandler.add_ekosistem_iklan,
            options: {
                validate: {
                    payload: OpenItemValidation.entry_iklan.payload,
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
            path: '/api/open-item/ekosistem-iklan/delete/{id}',
            handler: OpenItemHandler.delete_ekosistem_iklan
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/ekosistem-visitor',
            handler: OpenItemHandler.view_ekosistem_visitor,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'POST',
            path: '/api/open-item/ekosistem-visitor/delete',
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
            path: '/api/open-item/ekosistem_list',
            handler: OpenItemHandler.view_ekosistem_list,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/ekosistem_list_detail/{id}',
            handler: OpenItemHandler.view_ekosistem_list_id
        });

        server.route({
            method: 'POST',
            path: '/api/open-item/ekosistem_list_add',
            handler: OpenItemHandler.add_ekosistem_list,
            options: {
                validate: {
                    payload: OpenItemValidation.add_ekosistem_list.payload,
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
            method: 'PATCH',
            path: '/api/open-item/ekosistem_list_update/{id}',
            handler: OpenItemHandler.update_ekosistem_list,
            options: {
                validate: {
                    payload: OpenItemValidation.edit_ekosistem_list.payload,
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
            path: '/api/open-item/ekosistem_list_delete/{id}',
            handler: OpenItemHandler.delete_ekosistem_list
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/ekosistem_bio',
            handler: OpenItemHandler.view_ekosistem_bio,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/ekosistem_bio_detail/{id}',
            handler: OpenItemHandler.view_ekosistem_bio_id
        });

        server.route({
            method: 'PATCH',
            path: '/api/open-item/ekosistem_bio_update/{id}',
            handler: OpenItemHandler.update_ekosistem_bio,
            options: {
                validate: {
                    payload: OpenItemValidation.edit_bio.payload,
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
            method: 'GET',
            path: '/api/open-item/dashboardlist',
            handler: OpenItemHandler.view_ekosistem_list,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/ekosistem-pengumuman',
            handler: OpenItemHandler.view_ekosistem_pengumuman,
            options: {
                //validate: OpenItemValidation.query
            }
        });


        server.route({
            method: 'GET',
            path: '/api/open-item/site_opendata_setting',
            handler: OpenItemHandler.view_opendata_setting,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'PATCH',
            path: '/api/open-item/site_opendata_setting_update/{id}',
            handler: OpenItemHandler.update_opendata_setting,
            options: {
                validate: {
                    payload: OpenItemValidation.edit_setting.payload,
                    //tambahan
                    failAction: async (request, h, err) => {
                        console.error('🔥 Joi Validation Error:', err.message);
                        throw Boom.badRequest(err.message);
                    }
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
            path: '/api/open-item/menu-opendata',
            handler: OpenItemHandler.view_opendata_menu,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/menu-opendata2',
            handler: OpenItemHandler.view_opendata2_menu,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/site_satupeta_setting',
            handler: OpenItemHandler.view_satupeta_setting,
            options: {
                //validate: OpenItemValidation.query
            }
        });
        server.route({
            method: 'PATCH',
            path: '/api/open-item/site_satupeta_setting_update/{id}',
            handler: OpenItemHandler.update_satupeta_setting,
            options: {
                validate: {
                    payload: OpenItemValidation.edit_setting.payload,
                    //tambahan
                    failAction: async (request, h, err) => {
                        console.error('🔥 Joi Validation Error:', err.message);
                        throw Boom.badRequest(err.message);
                    }
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
            path: '/api/open-item/menu-satupeta',
            handler: OpenItemHandler.view_satupeta_menu,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/menu-satupeta2',
            handler: OpenItemHandler.view_satupeta2_menu,
            options: {
                validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/opendata-iklan',
            handler: OpenItemHandler.view_opendata_iklan,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/opendata-iklan/detail/{id}',
            handler: OpenItemHandler.view_opendata_iklan_id
        });
        server.route({
            method: 'PATCH',
            path: '/api/open-item/opendata-iklan/update/{id}',
            handler: OpenItemHandler.update_opendata_iklan,
            options: {
                validate: {
                    payload: OpenItemValidation.entry_iklan.payload,
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
            path: '/api/open-item/opendata-iklan/add',
            handler: OpenItemHandler.add_opendata_iklan,
            options: {
                validate: {
                    payload: OpenItemValidation.entry_iklan.payload,
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
            path: '/api/open-item/opendata-iklan/delete/{id}',
            handler: OpenItemHandler.delete_opendata_iklan
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/opendata-bantuan',
            handler: OpenItemHandler.view_opendata_bantuan,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/opendata-bantuan/detail/{id}',
            handler: OpenItemHandler.view_opendata_bantuan_id
        });
        server.route({
            method: 'PATCH',
            path: '/api/open-item/opendata-bantuan/update/{id}',
            handler: OpenItemHandler.update_opendata_bantuan,
            options: {
                validate: {
                    payload: OpenItemValidation.entry_iklan.payload,
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
            path: '/api/open-item/opendata-bantuan/add',
            handler: OpenItemHandler.add_opendata_bantuan,
            options: {
                validate: {
                    payload: OpenItemValidation.entry_iklan.payload,
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
            path: '/api/open-item/opendata-bantuan/delete/{id}',
            handler: OpenItemHandler.delete_opendata_bantuan
        });

        server.route({
            method: 'POST',
            path: '/api/open-item/opendata_feedback',
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
            method: 'GET',
            path: '/api/open-item/satupeta-iklan',
            handler: OpenItemHandler.view_satupeta_iklan,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/satupeta-iklan/detail/{id}',
            handler: OpenItemHandler.view_satupeta_iklan_id
        });
        server.route({
            method: 'PATCH',
            path: '/api/open-item/satupeta-iklan/update/{id}',
            handler: OpenItemHandler.update_satupeta_iklan,
            options: {
                validate: {
                    payload: OpenItemValidation.entry_iklan.payload,
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
            path: '/api/open-item/satupeta-iklan/add',
            handler: OpenItemHandler.add_satupeta_iklan,
            options: {
                validate: {
                    payload: OpenItemValidation.entry_iklan.payload,
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
            path: '/api/open-item/satupeta-iklan/delete/{id}',
            handler: OpenItemHandler.delete_satupeta_iklan
        });

        server.route({
            method: 'POST',
            path: '/api/open-item/satupeta_feedback',
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
            method: 'GET',
            path: '/api/open-item/images_item',
            handler: OpenItemHandler.view_image_item,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/komponen',
            handler: OpenItemHandler.view_komponen,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/komponen_detail/{title}',
            handler: OpenItemHandler.view_komponen_id
        });

        server.route({
            method: 'POST',
            path: '/api/open-item/komponen_add',
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
            path: '/api/open-item/komponen_update/{id}',
            handler: OpenItemHandler.update_komponen,
            options: {
                validate: {
                    payload: OpenItemValidation.edit_komponen.payload,
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
            path: '/api/open-item/komponen_delete/{id}',
            handler: OpenItemHandler.delete_komponen
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/images',
            handler: OpenItemHandler.view_images,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/images_detail/{id}',
            handler: OpenItemHandler.view_images_id
        });

        server.route({
            method: 'PATCH',
            path: '/api/open-item/images_update/{id}',
            handler: OpenItemHandler.update_images,
            options: {
                validate: {
                    payload: OpenItemValidation.edit_images.payload,
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
            method: 'GET',
            path: '/api/open-item/satker_code',
            handler: OpenItemHandler.view_satker_code,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/satker_code_detail/{id}',
            handler: OpenItemHandler.view_satker_code_id
        });

        server.route({
            method: 'POST',
            path: '/api/open-item/satker_code_add',
            handler: OpenItemHandler.add_satker_code,
            options: {
                validate: {
                    payload: OpenItemValidation.add_satker_code.payload,
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
            method: 'PATCH',
            path: '/api/open-item/satker_code_update/{id}',
            handler: OpenItemHandler.update_satker_code,
            options: {
                validate: {
                    payload: OpenItemValidation.edit_satker_code.payload,
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
            path: '/api/open-item/satker_code_delete/{id}',
            handler: OpenItemHandler.delete_satker_code
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/bidang_urusan',
            handler: OpenItemHandler.view_bidangurusan,
            options: {
                //validate: OpenItemValidation.query
            }
        });

        server.route({
            method: 'GET',
            path: '/api/open-item/satker_code_search',
            handler: OpenItemHandler.view_satkercode_search,
            options: {
                validate: OpenItemValidation.query
            }
        });

    }
};
