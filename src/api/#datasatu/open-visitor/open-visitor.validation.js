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

    add_visitor: {
        payload: Joi.object().keys({
            nama_bidang_urusan: Joi.string().required(),
            color_code: Joi.string().required(),
            icon: Joi.string().required()
        })
    },

    edit: {
        payload: Joi.object().keys({
            nama_bidang_urusan: Joi.string().required(),
            color_code: Joi.string().required(),
            icon: Joi.string().required()
        })
    },

    add_motto: {
        payload: Joi.object({
            title: Joi.string().required(),
            contents: Joi.string().allow('').required(),
            file: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file')
                .required() // atau .required() jika wajib
        })
    },

    edit_motto: {
        payload: Joi.object({
            title: Joi.string().required(),
            contents: Joi.string().allow('').required(),
            file: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file')
                .optional() // atau .required() jika wajib
        })
    },

    edit_images: {
        payload: Joi.object({
            kategori: Joi.string().required(),
            title: Joi.string().required(),
            contents: Joi.string().required(),
            file1: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file1')
                .optional(), // atau .required() jika wajib
            file2: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file2')
                .optional(), // atau .required() jika wajib
            file3: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file3')
                .optional() // atau .required() jika wajib
        })
    },

    add_ekosistem_list: {
        payload: Joi.object({
            title: Joi.string().required(),
            contents: Joi.string().required(),
            title_images_a: Joi.string().required(),
            title_images_b: Joi.string().required(),
            title_images_c: Joi.string().required(),
            linked: Joi.string().required(),
            file1: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file1')
                .optional(), // atau .required() jika wajib
            file2: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file2')
                .optional(), // atau .required() jika wajib
            file3: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file3')
                .optional() // atau .required() jika wajib
        })
    },

    edit_ekosistem_list: {
        payload: Joi.object({
            title: Joi.string().required(),
            contents: Joi.string().required(),
            title_images_a: Joi.string().required(),
            title_images_b: Joi.string().required(),
            title_images_c: Joi.string().required(),
            linked: Joi.string().required(),
            file1: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file1')
                .optional(), // atau .required() jika wajib
            file2: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file2')
                .optional(), // atau .required() jika wajib
            file3: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file3')
                .optional() // atau .required() jika wajib
        })
    },
    add_satker_code: {
        payload: Joi.object({
            nama_satker: Joi.string().required(),
            kode_satker: Joi.string().required(),
            no_satker: Joi.string().required(),
            file1: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file1')
                .optional() // atau .required() jika wajib
        })
    },

    edit_satker_code: {
        payload: Joi.object({
            nama_satker: Joi.string().required(),
            kode_satker: Joi.string().required(),
            no_satker: Joi.string().required(),
            file1: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file1')
                .optional() // atau .required() jika wajib
        })
    },
    edit_bio: {
        payload: Joi.object({
            email: Joi.string().required(),
            telpon: Joi.string().required(),
            fax: Joi.string().required(),
            alamat: Joi.string().required(),
            luas: Joi.string().required(),
            populasi: Joi.string().required(),
            kepadatan: Joi.string().required(),
            zona: Joi.string().required(),
            kode_pos: Joi.string().required(),
            instagram: Joi.string().required(),
            linkedin: Joi.string().required(),
            facebook: Joi.string().required(),
            whatapp: Joi.string().required(),
            twitter: Joi.string().required()
        })
    }

};
