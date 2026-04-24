'use strict';

const Joi = require('joi');
const { add_opendata_permohonan_tiket } = require('./open-dataset.handler');



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
            jenis: Joi.string().allow('', null),
            komponen: Joi.string().allow('', null),
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
            jenis: Joi.string().allow('', null),
            komponen: Joi.string().allow('', null),
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

        }),
        payload_infografik: Joi.object().keys({
            topik: Joi.string().required(),
            title: Joi.string().required(),
            sub_title: Joi.string().allow('', null),
            content: Joi.string().allow('', null),
            penyusun: Joi.string().allow('', null),
            admin: Joi.string().required(),
            jenis: Joi.string().allow('', null),
            komponen: Joi.string().allow('', null),
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
            file_d: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file')
                .optional(), // atau .required() jika wajib
            download_file: Joi.any()
                .meta({ swaggerType: 'file' }) // kalau pakai Swagger
                .description('Upload file')
                .optional() // atau .required() jika wajib

        })
    },
    delete_artikel: {
        params: Joi.object().keys({
            id: Joi.number().required()
        }),
        payload: Joi.object().keys({
            admin: Joi.number().allow('', null),
            jenis: Joi.string().allow('', null),
            komponen: Joi.string().allow('').optional()
        })


    },
    delete_infografik: {
        params: Joi.object().keys({
            id: Joi.number().required()
        }),
        payload: Joi.object().keys({
            admin: Joi.number().allow('', null),
            jenis: Joi.string().allow('', null),
            komponen: Joi.string().allow('').optional()
        })


    },
    addpermohonan: {
        payload: Joi.object({
            nomor_tiket: Joi.string().required(),
            nama: Joi.string().required(),
            telpon: Joi.string().required(),
            email: Joi.string().required(),
            pekerjaan: Joi.string().allow('').required(),
            instansi: Joi.string().allow('', null),
            bidangusaha: Joi.string().allow('', null),
            bidangilmu: Joi.string().allow('', null),
            jabatan: Joi.string().allow('', null),
            judul: Joi.string().allow('').required(),
            penghasil: Joi.string().allow('', null),
            opd: Joi.number().integer().required(),
            //opdId: Joi.string().allow('').required(),
            tujuan: Joi.string().allow('', null),
            dihubungi: Joi.string().allow('', null),
            deskripsi: Joi.string().allow('', null)
        })
    },
    addpermohonantiket: {
        payload: Joi.object({
            nomor_tiket: Joi.string().required(),
            from: Joi.string().required(),
            to: Joi.string().required(),
            pesan: Joi.string().allow('', null),
            status: Joi.string().allow('', null),
            admin: Joi.string().allow('', null),
            jenis: Joi.string().allow('', null),
            komponen: Joi.string().allow('', null)
        })
    }
};
