'use strict';

const Joi = require('joi');


module.exports = {

    view: {
        payload: Joi.object().keys({
            search_location: Joi.string().required(),
            search_kecamatan: Joi.string().required(),
            search_desa: Joi.string().required(),
            search_kunci: Joi.string().required()
        })

    },

    add: {
        payload: Joi.object().keys({
            koleksi_data: Joi.string().required(),
            title: Joi.string().required(),
            location_id: Joi.string().required(),
            satker_id: Joi.string().required(),
            sektor_id: Joi.string().required(),
            tahun_rilis: Joi.string().required(),
            visibilitas: Joi.string().required(),

            file: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file')
                .optional() // atau .required() jika wajib
        }),
        payload2: Joi.object().keys({
            nama_location_point: Joi.string().required(),
            coordinat: Joi.string().required(),
            location_id: Joi.string().required(),
            kecamatan_id: Joi.string().required(),
            desa_id: Joi.string().required()


        }),
        payload3: Joi.object().keys({
            nama_location: Joi.string().required(),
            satker: Joi.string().required(),
            sektor: Joi.string().required()


        }),
        payload_artikel: Joi.object().keys({
            title: Joi.string().required(),
            content_a: Joi.string().allow('', null),
            content_b: Joi.string().allow('', null),
            content_c: Joi.string().allow('', null),
            sumber: Joi.string().allow('', null),
            admin: Joi.string().required(),
            visibilitas: Joi.string().required(),
            file_a: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file')
                .optional(), // atau .required() jika wajib
            file_b: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file')
                .optional(), // atau .required() jika wajib
            file_c: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file')
                .optional(), // atau .required() jika wajib
            download_file: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file')
                .optional() // atau .required() jika wajib

        })
    },

    edit: {
        payload: Joi.object().keys({
            koleksi_data: Joi.string().required(),
            location_id: Joi.string().required(),
            title: Joi.string().required(),
            satker_id: Joi.string().required(),
            sektor_id: Joi.string().required(),
            tahun_rilis: Joi.string().required(),
            periode: Joi.string().required(),
            ukuran: Joi.string().required(),
            visibilitas: Joi.string().required(),

            file: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file')
                .optional() // atau .required() jika wajib
        }),

        payload2: Joi.object().keys({
            nama_location_point: Joi.string().required(),
            coordinat: Joi.string().required(),
            location_id: Joi.string().required(),
            kecamatan_id: Joi.string().required(),
            desa_id: Joi.string().required()


        }),

        payload3: Joi.object().keys({
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

        payload4: Joi.object().keys({
            nama_location: Joi.string().required(),
            satker_id: Joi.string().required(),
            sektor_id: Joi.string().required(),
            admin: Joi.string().required()


        }),

        payload_maplist: Joi.object().keys({
            koleksi_data: Joi.string().required(),
            title: Joi.string().required(),
            tahun_rilis: Joi.string().required(),
            tipe: Joi.string().required(),
            visibilitas: Joi.string().required(),
            periode: Joi.string().required(),
            pengukuran: Joi.string().allow('', null),
            deskripsi: Joi.string().allow('', null),
            location_id: Joi.string().required(),
            satker_id: Joi.string().required(),
            sektor_id: Joi.string().required(),
            admin: Joi.string().required(),
            file: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file')
                .optional() // atau .required() jika wajib
        }),

        payload_artikel: Joi.object().keys({
            title: Joi.string().required(),
            content_a: Joi.string().allow('', null),
            content_b: Joi.string().allow('', null),
            content_c: Joi.string().allow('', null),
            sumber: Joi.string().allow('', null),
            admin: Joi.string().required(),
            visibilitas: Joi.string().required(),
            file_a: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file')
                .optional(), // atau .required() jika wajib
            file_b: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file')
                .optional(), // atau .required() jika wajib
            file_c: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file')
                .optional(), // atau .required() jika wajib
            download_file: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file')
                .optional() // atau .required() jika wajib

        })


    }
};
