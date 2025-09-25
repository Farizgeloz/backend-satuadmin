'use strict';

const Joi = require('joi');



module.exports = {

    view: {
        query: Joi.object().keys({
            limit: Joi.number().positive().max(1000).default(25),
            page: Joi.number().positive().default(1),
            cari: Joi.string().trim().allow('')
        })
    },

    add: {
        payload: Joi.object({
            kode: Joi.string().required(),
            kodefile: Joi.string().required(),
            unit_wilayah: Joi.string().required(),
            sektor_id: Joi.string().required(),
            nama_dataset: Joi.string().required(),
            satker: Joi.string().required(),
            sifat_data: Joi.string().required(),
            frekuensi: Joi.string().required(),
            kegiatan_statistik: Joi.string().required(),
            klasifikasi: Joi.string().required(),
            konsep: Joi.string().required(),
            definisi: Joi.string().required(),
            satuan_id: Joi.string().required(),
            ukuran: Joi.string().required(),
            keterangan: Joi.string().allow('').required(),
            tag: Joi.string().required(),
            createdAt: Joi.string().allow('').optional(), // bisa pakai Joi.date().iso()
            file: Joi.any()
                .meta({ swaggerType: 'file' }) // opsional jika pakai Swagger
                .description('Upload file')
                .required()
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
        payload: Joi.object({
            nama_dataset: Joi.string().required(),

            sifat_data: Joi.string().allow('').required(),
            frekuensi: Joi.string().allow('').required(),
            kegiatan_statistik: Joi.string().allow('').required(),
            klasifikasi: Joi.string().allow('').required(),
            konsep: Joi.string().allow('').required(),
            definisi: Joi.string().allow('').required(),
            satuan_id: Joi.string().allow('').required(),
            ukuran: Joi.string().allow('').required(),
            keterangan: Joi.string().allow('').required(),
            tag: Joi.string().allow('').required(),//,
            /*file: Joi.any()
                .meta({ swaggerType: 'file' })
                .description('Upload file')
                .optional()
                .allow(null)*/

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
