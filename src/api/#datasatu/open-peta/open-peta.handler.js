/* eslint-disable @hapi/for-loop */
/* eslint-disable @hapi/scope-start */
'use strict';

const Knex = require('../../../database');
const { generatePresignedUrl,uploadFile,uploadFileTumb,deleteFile } = require('../../../utils/s3Client'); // path ke helper baru
const path = require('path');
const moment = require('moment');
const fs = require('fs');
const { parse } = require('csv-parse');
const XLSX = require('xlsx');


const parseCSV = (filepath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filepath)
            .pipe(parse({
                columns: true,
                skip_empty_lines: true,
                relax_column_count: true,
                trim: true
            }))
            .on('data', (row) => results.push(row))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
};

const streamToBuffer = async (stream) => {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
};



const internals_location_maplist = {
    sqlBaseView: Knex.select('*').from('tb_satupeta_location_maplist')
};

const internals_tb_satupeta_locations = {
    sqlBaseView: Knex.select('*').from('tb_satupeta_locations')
};

const internals_tb_satupeta_location_maplist = {
    sqlBaseView: Knex.select('*').from('tb_satupeta_location_maplist')
};

const internals_tb_satupeta_location_points = {
    sqlBaseView: Knex.select('*').from('tb_satupeta_location_points')
};

const internals_artikel = {
    sqlBaseView: Knex.select('*').from('tb_satupeta_artikel')
};

const sanitizeFileName = (name) => {
    return name
        .replace(/[^a-zA-Z0-9._-]/g, '_') // hanya huruf, angka, titik, underscore, dash
        .substring(0, 100); // batasi panjang supaya aman
};


module.exports = {

    view_count: async function (request, h) {
        try {
            // Total dataset publik
            const resultcountmapset = await Knex('tb_satupeta_location_maplist')
                //.where('visibilitas', 'Publik')
                .count('* as total');

            // Total dataset publik
            const resultcountmapsetpublik = await Knex('tb_satupeta_location_maplist')
                .where('visibilitas', 'Publik')
                .count('* as total');

            // Total dataset publik per tb_opd
            const resultcountmapset_satker = await Knex('tb_satupeta_location_maplist')
                //.where('visibilitas', 'Publik')
                .countDistinct('satker_id as total');
            const [
                count_tipe,
                count_sektor
            ] = await Promise.all([
                // Total kecamatan unik (tidak kosong, visibilitas publik)
                Knex('tb_satupeta_location_maplist')
                    .whereNot('tipe', '')
                    //.andWhere('visibilitas', 'Publik')
                    .countDistinct('tipe as total'),

                // Total desa unik per kecamatan (dihitung sebagai kombinasi unik)
                Knex('tb_satupeta_location_maplist')
                    .whereNot('sektor_id', '')
                    //.andWhere('visibilitas', 'Publik')
                    .countDistinct('sektor_id as total')
            ]);
            // Gabungkan hasil dalam satu response
            return h.response({
                count_mapset: resultcountmapset[0].total,
                count_mapsetpublik: resultcountmapsetpublik[0].total,
                count_mapset_satker: resultcountmapset_satker[0].total,
                count_mapset_tipe: count_tipe[0].total,
                count_mapset_sektor: count_sektor[0].total
            }).code(200);
        }
        catch (err) {
            console.error('Error in view_count:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    view_list: async function (request, h) {
        try {
            const sql = internals_location_maplist.sqlBaseView.clone();

            sql.join('tb_opd', 'tb_satupeta_location_maplist.satker_id', '=', 'tb_opd.id_opd');
            sql.join('tb_sektor', 'tb_satupeta_location_maplist.sektor_id', '=', 'tb_sektor.id_sektor');
            sql.join('tb_satupeta_locations', 'tb_satupeta_location_maplist.location_id', '=', 'tb_satupeta_locations.id_location');

            sql.select(
                'tb_satupeta_location_maplist.*',
                'tb_opd.nama_opd',
                'tb_sektor.nama_sektor',
                'tb_satupeta_locations.nama_location'
            );

            sql.orderBy('tb_satupeta_location_maplist.updated_at', 'desc');

            const datas = await sql;

            const resultWithUrls = await Promise.all(
                datas.map(async (item) => {
                    const plainItem = item.toJSON ? item.toJSON() : { ...item };
                    if (plainItem.images) {
                        try {
                            plainItem.presignedUrl = await generatePresignedUrl(plainItem.images, 60 * 5);
                        }
                        catch (err) {
                            console.warn(`⚠️ Gagal buat presigned URL untuk ${plainItem.images}:`, err.message);
                            plainItem.presignedUrl = null;
                        }
                    }

                    return plainItem;
                })
            );

            return h.response({ data: resultWithUrls }).code(200);

        }
        catch (err) {
            console.error('Error in view_list:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },


    view_list2: async function (request, h) {
        const queryUrl = { ...request.query };
        const page = parseInt(queryUrl.page) || 1;
        const limit = parseInt(queryUrl.limit) || 9;
        const offset = (page - 1) * limit;

        let search_sektor = queryUrl.search_sektor;
        if (typeof search_sektor === 'string') {
            search_sektor = [parseInt(search_sektor)];
        }
        else if (Array.isArray(search_sektor)) {
            search_sektor = search_sektor.map((v) => parseInt(v));
        }
        else {
            search_sektor = [];
        }

        let search_koleksipeta = queryUrl.search_koleksipeta;
        if (typeof search_koleksipeta === 'string') {
            search_koleksipeta = [search_koleksipeta];
        }
        else if (Array.isArray(search_koleksipeta)) {
            search_koleksipeta = search_koleksipeta.filter((v) => typeof v === 'string' && v.trim() !== '');
        }
        else {
            search_koleksipeta = [];
        }

        try {
            const sql = internals_location_maplist.sqlBaseView.clone();
            sql.join('tb_opd', 'tb_satupeta_location_maplist.satker_id', '=', 'tb_opd.id_opd');
            sql.join('tb_sektor', 'tb_satupeta_location_maplist.sektor_id', '=', 'tb_sektor.id_sektor');
            sql.select('tb_satupeta_location_maplist.*', 'tb_opd.nama_opd', 'tb_sektor.nama_sektor');
            sql.where('tb_satupeta_location_maplist.visibilitas', 'Publik');

            if (queryUrl.search_kunci) {
                sql.where('tb_satupeta_location_maplist.title', 'like', `%${queryUrl.search_kunci}%`);
            }

            if (search_sektor.length > 0) {
                sql.whereIn('tb_satupeta_location_maplist.sektor_id', search_sektor);
            }

            if (search_koleksipeta.length > 0) {
                sql.whereIn('tb_satupeta_location_maplist.koleksi_data', search_koleksipeta);
            }

            sql.orderBy('tb_satupeta_location_maplist.updated_at', 'desc');

            const totalQuery = sql.clone().clearSelect().count('* as total');
            const [{ total }] = await totalQuery;

            sql.limit(limit).offset(offset);

            const datas = await sql;

            const resultWithUrls = await Promise.all(
                datas.map(async (item) => {

                    const plainItem = item.toJSON ? item.toJSON() : { ...item };

                    if (item.koleksi_data === 'Peta Interaktif') {

                        if (plainItem.images) {
                            try {
                                plainItem.presignedUrl = await generatePresignedUrl(`tumb/` + plainItem.images, 60 * 5);

                            }
                            catch (err) {
                                console.warn(`⚠️ Gagal buat presigned URL untuk ${plainItem.images}:`, err.message);
                                plainItem.presignedUrl = null;
                            }
                        }
                    }
                    else {

                        if (plainItem.images) {
                            try {
                                plainItem.presignedUrl = await generatePresignedUrl( plainItem.images, 60 * 5);

                            }
                            catch (err) {
                                console.warn(`⚠️ Gagal buat presigned URL untuk ${plainItem.images}:`, err.message);
                                plainItem.presignedUrl = null;
                            }
                        }

                    }

                    return plainItem;
                })
            );

            return h.response({
                data: resultWithUrls,
                pagination: {
                    page,
                    limit,
                    total: parseInt(total),
                    totalPages: Math.ceil(total / limit)
                }
            }).code(200);

        }
        catch (err) {
            console.error('Error in view_list2:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },


    view_list3: async function (request, h) {
        const limit = 9;

        try {
            const sql = internals_location_maplist.sqlBaseView.clone();
            sql.orderBy('tb_satupeta_location_maplist.updated_at', 'desc');

            const totalQuery = sql.clone().clearSelect().count('* as total');
            const [{ total }] = await totalQuery;

            sql.limit(limit);

            const datas = await sql;

            const resultWithUrls = await Promise.all(
                datas.map(async (item) => {
                    const plainItem = { ...item };
                    if (item.images) {
                        try {
                            plainItem.presignedUrl = await generatePresignedUrl(item.images, 60 * 5);
                        }
                        catch (err) {
                            console.warn('Gagal buat presigned URL:', err.message);
                            plainItem.presignedUrl = null;
                        }
                    }

                    return plainItem;
                })
            );

            return h.response({ data: resultWithUrls }).code(200);

        }
        catch (err) {
            console.error('Error in view_list3:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },



    view_item: async function (request, h) {
        const queryUrl = { ...request.query };
        let search_kecamatan = queryUrl.search_kecamatan;
        if (typeof search_kecamatan === 'string') {
            search_kecamatan = [parseInt(search_kecamatan)];
        }
        else if (Array.isArray(search_kecamatan)) {
            search_kecamatan = search_kecamatan.map((v) => parseInt(v));
        }
        else {
            search_kecamatan = [];
        }

        try {
            // 1. Ambil bidang urusan
            const resultsektor = await Knex('tb_sektor')
                .select('id_sektor', 'nama_sektor')
                .orderBy('id_sektor', 'asc');

            // 1. Ambil bidang urusan
            const resultsatker = await Knex('tb_opd')
                .select('id_opd', 'nama_opd')
                .orderBy('nama_opd', 'asc');

            const resultlocation = await Knex('tb_satupeta_locations')
                .select('id_location', 'nama_location')
                .orderBy('id_location', 'asc');

            const resultkoleksi = await Knex('tb_satupeta_location_maplist')
                .select('id_maplist', 'title')
                .where('tipe', 'Marker')
                .orderBy('title', 'asc');
            // 2. Ambil semua kecamatan
            const resultkecamatan = await Knex('tb_kecamatan')
                .select('id_kecamatan', 'nama_kecamatan');

            // 3. Ambil desa (dengan filter kecamatan jika ada)
            const desaQuery = Knex('tb_desa')
                .select('id_desa', 'nama_desa');

            if (search_kecamatan.length > 0) {
                desaQuery.whereIn('kecamatan_id', search_kecamatan);
            }

            const resultdesa = await desaQuery;

            return h.response({
                resultsektor,
                resultsatker,
                resultlocation,
                resultkoleksi,
                resultkecamatan,
                resultdesa
            }).code(200);
        }
        catch (error) {
            console.error('❌ Error in getMapsetUnsur:', error);
            return h.response({ msg: error.message }).code(500);
        }
    },

    view_item2: async function (request, h) {
        const queryUrl = { ...request.query };
        const search_satker = queryUrl.search_satker;
        try {
            // 1. Ambil bidang urusan
            const resultsektor = await Knex('tb_sektor')
                .select('id_sektor', 'nama_sektor')
                .orderBy('id_sektor', 'asc');

            // 1. Ambil bidang urusan
            let query = Knex('tb_opd')
                .select('id_opd', 'nama_opd')
                .orderBy('nama_opd', 'asc');

            if (search_satker?.trim()) {
                query = query.where('tb_opd.id_opd', search_satker.trim());
            }

            const resultsatker = await query;

            const resultlocation = await Knex('tb_satupeta_locations')
                .select('id_location', 'nama_location')
                .orderBy('nama_location', 'asc');


            return h.response({
                resultsektor,
                resultsatker,
                resultlocation
            }).code(200);
        }
        catch (error) {
            console.error('❌ Error in getMapsetUnsur:', error);
            return h.response({ msg: error.message }).code(500);
        }
    },


    view_data: async function (request, h) {
        const queryUrl = { ...request.query };


        const limit = 500;
        const search_limit = Math.min(Math.max(parseInt(limit) || 200, 1), 10000);

        // Ambil dan proses filter lokasi
        let search_koleksi = queryUrl.search_koleksi;

        if (typeof search_koleksi === 'string') {
            search_koleksi = [parseInt(search_koleksi)];
        }
        else if (Array.isArray(search_koleksi)) {
            search_koleksi = search_koleksi.map((v) => parseInt(v));
        }
        else {
            search_koleksi = [];
        }


        /* // Ambil dan proses filter
        const search_topik = Array.isArray(queryUrl.search_location)
            ? queryUrl.search_location.map(Number)
            : (queryUrl.search_location ? [Number(queryUrl.search_location)] : []);


         */

        const search_kecamatan = Array.isArray(queryUrl.search_kecamatan)
            ? queryUrl.search_kecamatan.map(Number)
            : (queryUrl.search_kecamatan ? [Number(queryUrl.search_kecamatan)] : []);

        const search_desa = Array.isArray(queryUrl.search_desa)
            ? queryUrl.search_desa.map(Number)
            : (queryUrl.search_desa ? [Number(queryUrl.search_desa)] : []);

        try {
            if (search_koleksi.length === 0) {
                return h.response({ result: [], sektor: [] }).code(200);
            }

            // 🔍 Ambil metadata bidang urusan
            const sektor = await Knex('tb_satupeta_location_maplist')
                .join('tb_opd', 'tb_satupeta_location_maplist.satker_id', '=', 'tb_opd.id_opd')
                .join('tb_sektor', 'tb_satupeta_location_maplist.sektor_id', '=', 'tb_sektor.id_sektor')
                .select(
                    'tb_satupeta_location_maplist.id_maplist',
                    'tb_satupeta_location_maplist.location_id',
                    'tb_satupeta_location_maplist.title',
                    'tb_satupeta_location_maplist.satker_id',
                    'tb_satupeta_location_maplist.sektor_id',
                    'tb_opd.nama_opd',
                    'tb_sektor.nama_sektor'
                )
                .whereIn('tb_satupeta_location_maplist.id_maplist', search_koleksi);

            if (!sektor || sektor.length === 0) {
                return h.response({ result: [], sektor: [] }).code(200);
            }

            const locationIds = sektor.map((loc) => loc.location_id);
            //console.log('locationIds:', locationIds);

            // 🔎 Query utama
            const query = Knex('tb_satupeta_location_points')
                .join('tb_satupeta_locations', 'tb_satupeta_location_points.location_id', '=', 'tb_satupeta_locations.id_location')
                .join('tb_sektor', 'tb_satupeta_locations.sektor_id', '=', 'tb_sektor.id_sektor')
                .join('tb_kecamatan', 'tb_satupeta_location_points.kecamatan_id', '=', 'tb_kecamatan.id_kecamatan')
                .join('tb_desa', 'tb_satupeta_location_points.desa_id', '=', 'tb_desa.id_desa')
                .join('tb_satupeta_location_maplist', 'tb_satupeta_location_points.location_id', '=', 'tb_satupeta_location_maplist.location_id')
                .select(
                    'tb_satupeta_location_points.*',
                    'tb_sektor.nama_sektor',
                    'tb_kecamatan.nama_kecamatan',
                    'tb_desa.nama_desa',
                    'tb_satupeta_locations.nama_location',
                    'tb_satupeta_locations.sektor_id',
                    'tb_satupeta_location_maplist.title'
                )
                .whereIn('tb_satupeta_location_points.location_id', locationIds);

            //.limit(search_limit);



            const query_bidang = Knex('tb_satupeta_locations')
                .join('tb_opd', 'tb_satupeta_locations.satker_id', '=', 'tb_opd.id_opd')
                .join('tb_sektor', 'tb_satupeta_locations.sektor_id', '=', 'tb_sektor.id_sektor')
                .select(
                    'tb_satupeta_locations.id_location',
                    'tb_satupeta_locations.nama_location',
                    'tb_satupeta_locations.satker_id',
                    'tb_satupeta_locations.sektor_id',
                    'tb_opd.nama_opd',
                    'tb_sektor.nama_sektor'
                )
                .whereIn('tb_satupeta_locations.id_location', locationIds)
                .groupBy('tb_satupeta_locations.sektor_id');

            /* const query_topik = Knex('tb_satupeta_locations')
                .join('tb_opd', 'tb_satupeta_locations.satker_id', '=', 'tb_opd.id_opd')
                .join('tb_sektor', 'tb_satupeta_locations.sektor_id', '=', 'tb_sektor.id_sektor')
                .select(
                    'tb_satupeta_locations.id_location',
                    'tb_satupeta_locations.nama_location',
                    'tb_satupeta_locations.satker_id',
                    'tb_satupeta_locations.sektor_id',
                    'tb_opd.nama_opd',
                    'tb_sektor.nama_sektor'
                )
                .whereIn('tb_satupeta_locations.id_location', locationIds)
                .groupBy('tb_satupeta_locations.id_location'); */

            const query_koleksi = Knex('tb_satupeta_location_maplist')
                .join('tb_satupeta_locations', 'tb_satupeta_location_maplist.location_id', '=', 'tb_satupeta_locations.id_location')
                .join('tb_sektor', 'tb_satupeta_locations.sektor_id', '=', 'tb_sektor.id_sektor')
                .select(
                    'tb_satupeta_location_maplist.id_maplist',
                    'tb_satupeta_location_maplist.title',
                    'tb_satupeta_location_maplist.satker_id',
                    'tb_satupeta_location_maplist.sektor_id',
                    'tb_satupeta_locations.id_location',
                    'tb_sektor.nama_sektor'
                )
                .whereIn('tb_satupeta_location_maplist.location_id', locationIds)
                .groupBy('tb_satupeta_location_maplist.id_maplist');

            const query_satker = Knex('tb_satupeta_locations')
                .join('tb_opd', 'tb_satupeta_locations.satker_id', '=', 'tb_opd.id_opd')
                .join('tb_sektor', 'tb_satupeta_locations.sektor_id', '=', 'tb_sektor.id_sektor')
                .select(
                    'tb_satupeta_locations.id_location',
                    'tb_satupeta_locations.nama_location',
                    'tb_satupeta_locations.satker_id',
                    'tb_satupeta_locations.sektor_id',
                    'tb_opd.nama_opd',
                    'tb_sektor.nama_sektor'
                )
                .whereIn('tb_satupeta_locations.id_location', locationIds)
                .groupBy('tb_satupeta_locations.satker_id');

            const query_kecamatan = Knex('tb_satupeta_location_points')
                .join('tb_kecamatan', 'tb_satupeta_location_points.kecamatan_id', '=', 'tb_kecamatan.id_kecamatan')
                .join('tb_desa', 'tb_satupeta_location_points.desa_id', '=', 'tb_desa.id_desa')
                .join('tb_satupeta_locations', 'tb_satupeta_location_points.location_id', '=', 'tb_satupeta_locations.id_location')
                .select(
                    'tb_satupeta_location_points.kecamatan_id',
                    'tb_kecamatan.nama_kecamatan'
                )
                .count('tb_satupeta_location_points.id_location_point as jumlah_point') // jumlah data per kecamatan
                .whereIn('tb_satupeta_location_points.location_id', locationIds)
                .groupBy('tb_satupeta_location_points.kecamatan_id')
                .limit(search_limit);

            const query_desa = Knex('tb_satupeta_location_points')
                .join('tb_kecamatan', 'tb_satupeta_location_points.kecamatan_id', '=', 'tb_kecamatan.id_kecamatan')
                .join('tb_desa', 'tb_satupeta_location_points.desa_id', '=', 'tb_desa.id_desa')
                .join('tb_satupeta_locations', 'tb_satupeta_location_points.location_id', '=', 'tb_satupeta_locations.id_location')
                .select(
                    'tb_satupeta_location_points.kecamatan_id',
                    'tb_kecamatan.nama_kecamatan',
                    'tb_satupeta_location_points.desa_id',
                    'tb_desa.nama_desa'
                )
                .count('tb_satupeta_location_points.id_location_point as jumlah_point') // jumlah data per kecamatan
                .whereIn('tb_satupeta_location_points.location_id', locationIds)
                .groupBy('tb_satupeta_location_points.kecamatan_id','tb_satupeta_location_points.desa_id')
                .limit(search_limit);

            /*  if (search_topik.length > 0) {
                query.andWhere((qb) => {
                    qb.whereIn('tb_satupeta_location_points.location_id', search_topik);
                });

                query_kecamatan.andWhere((qk) => {
                    qk.whereIn('tb_satupeta_location_points.location_id', search_topik);
                });
                query_desa.andWhere((qd) => {
                    qd.whereIn('tb_satupeta_location_points.location_id', search_topik);
                });
            } */

            if (search_kecamatan.length > 0) {
                query.andWhere((qb) => {
                    qb.whereIn('tb_satupeta_location_points.kecamatan_id', search_kecamatan);
                });

                query_kecamatan.andWhere((qk) => {
                    qk.whereIn('tb_satupeta_location_points.kecamatan_id', search_kecamatan);
                });
                query_desa.andWhere((qd) => {
                    qd.whereIn('tb_satupeta_location_points.kecamatan_id', search_kecamatan);
                });
            }

            if (search_desa.length > 0) {
                query.andWhere((qb) => {
                    qb.whereIn('tb_satupeta_location_points.desa_id', search_desa);
                });
                query_kecamatan.andWhere((qk) => {
                    qk.whereIn('tb_satupeta_location_points.desa_id', search_desa);
                });
                query_desa.andWhere((qd) => {
                    qd.whereIn('tb_satupeta_location_points.desa_id', search_desa);
                });
            }

            if (queryUrl.search_kunci) {
                query.andWhere('tb_satupeta_location_points.nama_location_point', 'like', `%${queryUrl.search_kunci}%`);
                query_kecamatan.andWhere('tb_satupeta_location_points.nama_location_point', 'like', `%${queryUrl.search_kunci}%`);
                query_desa.andWhere('tb_satupeta_location_points.nama_location_point', 'like', `%${queryUrl.search_kunci}%`);
            }

            const result = await query.orderBy('tb_satupeta_location_points.id_location_point', 'asc');

            //const resulttopik = await query_topik.orderBy('tb_satupeta_locations.sektor_id', 'asc');
            const resultkoleksi = await query_koleksi.orderBy('tb_satupeta_locations.sektor_id', 'asc');
            const resultbidang = await query_bidang.orderBy('tb_satupeta_locations.sektor_id', 'asc');
            const resultsatker = await query_satker.orderBy('tb_satupeta_locations.sektor_id', 'asc');
            const resultkecamatan = await query_kecamatan.orderBy('tb_satupeta_location_points.id_location_point', 'asc');
            const resultdesa = await query_desa.orderBy('tb_satupeta_location_points.id_location_point', 'asc');

            return h.response({ result, sektor,resultkoleksi,resultbidang,resultsatker,resultkecamatan,resultdesa }).code(200);
        }
        catch (error) {
            console.error('❌ Error in view_data:', error);
            return h.response({
                msg: 'Terjadi kesalahan pada server',
                error: error.message
            }).code(500);
        }
    },

    view_data_admin: async function (request, h) {
        const queryUrl = { ...request.query };
        const search_kecamatan = queryUrl.search_kecamatan;
        const search_satker = queryUrl.search_satker;

        try {
            const result = await Knex('tb_satupeta_location_points')
                .join('tb_kecamatan', 'tb_satupeta_location_points.kecamatan_id', '=', 'tb_kecamatan.id_kecamatan')
                .join('tb_desa', 'tb_satupeta_location_points.desa_id', '=', 'tb_desa.id_desa')
                .join('tb_satupeta_locations', 'tb_satupeta_location_points.location_id', '=', 'tb_satupeta_locations.id_location')
                .select(
                    'tb_satupeta_location_points.*',
                    'tb_kecamatan.nama_kecamatan as kecamatan',
                    'tb_desa.nama_desa as desa',
                    'tb_satupeta_locations.nama_location as lokasi',
                    'tb_satupeta_locations.sektor_id as bidangUrusanId'
                )
                .orderBy('tb_satupeta_location_points.id_location_point', 'desc');

            let querylocation = Knex('tb_satupeta_locations')
                .join('tb_opd', 'tb_satupeta_locations.satker_id', '=', 'tb_opd.id_opd')
                .join('tb_sektor', 'tb_satupeta_locations.sektor_id', '=', 'tb_sektor.id_sektor')
                .select(
                    'tb_satupeta_locations.*',
                    'tb_opd.nama_opd',
                    'tb_sektor.nama_sektor',
                    'tb_sektor.color_code as sektor_color'
                )
                .orderBy('tb_satupeta_locations.nama_location', 'asc');

            if (search_satker?.trim()) {
                querylocation = querylocation.where('tb_satupeta_locations.satker_id', search_satker.trim());
            }

            const resultlocation = await querylocation;

            let querylocationmaplist = Knex('tb_satupeta_location_maplist')
                .leftJoin('tb_opd', 'tb_satupeta_location_maplist.satker_id', '=', 'tb_opd.id_opd')
                .leftJoin('tb_sektor', 'tb_satupeta_location_maplist.sektor_id', '=', 'tb_sektor.id_sektor')
                .leftJoin('tb_satupeta_locations', 'tb_satupeta_location_maplist.location_id', '=', 'tb_satupeta_locations.id_location')
                .select(
                    'tb_satupeta_location_maplist.*',
                    'tb_opd.nama_opd',
                    'tb_sektor.nama_sektor',
                    'tb_sektor.color_code as sektor_color',
                    'tb_satupeta_locations.nama_location'
                )
                .orderBy([
                    { column: 'tb_satupeta_location_maplist.koleksi_data', order: 'asc' },
                    { column: 'tb_satupeta_location_maplist.title', order: 'asc' }
                ]);

            if (search_satker?.trim()) {
                querylocationmaplist = querylocationmaplist.where('tb_satupeta_location_maplist.satker_id', search_satker.trim());
            }

            const resultlocationmaplist = await querylocationmaplist;

            const resultlocationmaplistUrls = await Promise.all(
                resultlocationmaplist.map(async (item) => {
                    const plainItem = { ...item };
                    if (item.images) {
                        try {
                            plainItem.presignedUrl = await generatePresignedUrl(item.images, 60 * 5);
                            plainItem.presignedUrl_tumb = await generatePresignedUrl(`tumb/` + item.images, 60 * 5);
                        }
                        catch (err) {
                            console.warn('⚠️ Gagal buat presigned URL:', err.message);
                            plainItem.presignedUrl = null;
                            plainItem.presignedUrl_tumb = null;
                        }
                    }

                    return plainItem;
                })
            );

            const resultkecamatan = await Knex('tb_kecamatan')
                .orderBy('nama_kecamatan', 'asc');

            let querydesa = Knex('tb_desa')
                .select(
                    'tb_desa.*',
                    'tb_kecamatan.nama_kecamatan'
                )
                .join('tb_kecamatan', 'tb_desa.kecamatan_id', '=', 'tb_kecamatan.id_kecamatan')
                .orderBy('tb_desa.nama_desa', 'asc');

            if (search_kecamatan) {
                querydesa = querydesa.where('tb_desa.kecamatan_id', search_kecamatan);
            }

            const resultdesa = await querydesa;

            return h.response({
                result,
                resultlocation,
                resultlocationmaplistUrls,
                resultkecamatan,
                resultdesa
            }).code(200);

        }
        catch (err) {
            console.error('❌ Error in view_data_admin:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    view_locations_id: async function (request, h) {
        try {
            const { id } = request.params;
            const sql = internals_tb_satupeta_locations.sqlBaseView.clone();

            sql.join('tb_opd', 'tb_satupeta_locations.satker_id', '=', 'tb_opd.id_opd');
            sql.join('tb_sektor', 'tb_satupeta_locations.sektor_id', '=', 'tb_sektor.id_sektor');


            // Pilih kolom-kolom yang dibutuhkan
            sql.select(
                'tb_satupeta_locations.*',
                'tb_opd.nama_opd',
                'tb_sektor.nama_sektor'
            );
            const data = await sql.where('id_location', id).first();

            if (!data) {
                return h.response({ message: 'Data not found' }).code(404);
            }


            return h.response(data).code(200);
        }
        catch (err) {
            console.error('Error in view_id:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    update_locations: async function (request, h) {

        const { id } = request.params;
        const id_location = id;
        const {
            nama_location,satker_id,sektor_id,admin
        } = request.payload;


        //console.log('data id' + komponen);



        const tanggal = moment().format('YYYY-MM-DD');

        try {

            const oldData = await Knex('tb_satupeta_locations').where({ id_location }).first();

            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            // Simpan metadata ke database
            const updateData = {
                nama_location,
                satker_id,
                sektor_id,
                admin,
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };


            await Knex('tb_satupeta_locations').where({ id_location }).update(updateData);

            return h.response({ message: 'Berhasil Diupdate' }).code(201);
        }
        catch (err) {
            console.error('Error saat upload atau update:', err);
            return h.response({ msg: 'Gagal menyimpan' }).code(500);
        }
    },

    add_locations: async function (request, h) {
        const {
            nama_location_point,coordinat,location_id, kecamatan_id, desa_id
        } = request.payload;

        const tanggal = moment().format('YYYY-MM-DD');

        try {

            const exists = await Knex('tb_satupeta_location_points')
                .where({
                    nama_location_point,
                    kecamatan_id,
                    desa_id
                })
                .first();

            const addData = {
                nama_location_point,
                location_id,
                coordinat,
                kecamatan_id,
                desa_id,
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                created_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            if (!exists) {
                await Knex('tb_satupeta_location_points').insert(addData);
                return h.response({ message: 'Berhasil disimpan' }).code(201);
            }

            return h.response({ msg: 'Data Sudah Ada' }).code(500);


        }
        catch (err) {
            console.error('Error saat upload atau insert:', err);
            return h.response({ msg: 'Gagal menyimpan dataset' }).code(500);
        }
    },

    addmulti_locations: async function (request, h) {
        try {
            const { locations,admin } = request.payload;

            for (const loc of locations) {
                const exists = await Knex('tb_satupeta_locations')
                    //.where({ nama_location: loc.nama_location, sektor_id: loc.sektor_id, satker_id: loc.satker_id })
                    .where({ nama_location: loc.nama_location })
                    .first();

                const addData = {
                    nama_location: loc.nama_location,
                    sektor_id: loc.sektor_id,
                    satker_id: loc.satker_id,
                    admin,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                    created_at: moment().format('YYYY-MM-DD HH:mm:ss')
                };

                if (!exists) {
                    await Knex('tb_satupeta_locations').insert(addData);
                }
                else {
                    return h.response({ msg: `Data " ${loc.nama_location} " Sudah Ada` }).code(500);
                }
            }

            return h.response({ message: 'Semua data berhasil disimpan' }).code(201);

        }
        catch (err) {
            console.error('Error saat insert multiple locations:', err);
            return h.response({ msg: 'Gagal menyimpan dataset', error: err.message }).code(500);
        }
    },



    addcsv_locations: async function (request, h) {
        const { file,admin } = request.payload;

        if (!file) {
            return h.response({ error: 'File tidak ditemukan' }).code(400);
        }

        const filename = `${moment().format('YYYYMMDD_HHmmss')}_${file.hapi.filename}`;
        const filepath = path.join(__dirname, '../../../uploads', filename);

        try {
        // simpan file sementara
            await new Promise((resolve, reject) => {
                const fileStream = fs.createWriteStream(filepath);
                file.pipe(fileStream);
                file.on('end', () => fileStream.end(() => resolve()));
                file.on('error', reject);
            });

            const requiredCols = [
                'nama_location',
                'sektor',
                'satker'
            ];

            let rows = [];
            const ext = path.extname(filename).toLowerCase();

            if (ext === '.csv') {
                rows = await parseCSV(filepath);
            }
            else if (ext === '.xlsx' || ext === '.xls') {
                const workbook = XLSX.readFile(filepath);
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                rows = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
            }
            else {
                fs.unlinkSync(filepath);
                return h.response({ error: 'Format file tidak didukung (hanya CSV/XLS/XLSX)' }).code(400);
            }

            // hapus file setelah diproses
            fs.unlinkSync(filepath);

            if (!rows || rows.length === 0) {
                return h.response({ error: 'File kosong atau tidak bisa dibaca' }).code(400);
            }

            // validasi kolom
            const fileCols = Object.keys(rows[0] || {});
            const missingCols = requiredCols.filter((col) => !fileCols.includes(col));
            if (missingCols.length > 0) {
                return h.response({
                    error: 'Kolom tidak sesuai',
                    detail: `Kolom wajib tidak ditemukan: ${missingCols.join(', ')}`
                }).code(400);
            }

            // proses insert
            const insertData = [];
            for (const row of rows) {
                const exists = await Knex('tb_satupeta_locations')
                    .where({
                        nama_location: row.nama_location,
                        sektor_id: row.sektor,
                        satker_id: row.satker
                    })
                    .first();

                if (!exists) {
                    insertData.push({
                        nama_location: row.nama_location,
                        sektor_id: row.sektor,
                        satker_id: row.satker,
                        admin,
                        created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                        updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                    });
                }
            }

            if (insertData.length > 0) {
                await Knex.transaction(async (trx) => {
                    await trx.batchInsert('tb_satupeta_locations', insertData, 100);
                });
            }

            return h.response({
                message: `File ${ext === '.csv' ? 'CSV' : 'Excel'} berhasil diproses`,
                inserted: insertData.length,
                skipped: rows.length - insertData.length
            }).code(201);

        }
        catch (err) {
            console.error('CSV/Excel Upload Error:', err);
            return h.response({ error: 'Gagal memproses file', detail: err.message }).code(500);
        }
    },

    delete_locations: async function (request, h) {
        const id_location = request.params.id; // ambil ID dari URL

        try {
            await Knex('tb_satupeta_locations').where({ id_location }).del();
            return h.response({ message: 'Berhasil Dihapus' }).code(201);
        }
        catch (err) {
            console.error('Error saat upload atau update:', err);
            return h.response({ msg: 'Gagal Hapus' }).code(500);
        }
    },

    view_location_maplist_id: async function (request, h) {
        try {
            const { id } = request.params;
            const titleAsText = decodeURIComponent(id).replace(/-/g, ' ');

            console.log('titleAsText' + titleAsText);


            const sql = internals_tb_satupeta_location_maplist.sqlBaseView.clone();

            sql.leftJoin('tb_opd', 'tb_satupeta_location_maplist.satker_id', '=', 'tb_opd.id_opd');
            sql.leftJoin('tb_sektor', 'tb_satupeta_location_maplist.sektor_id', '=', 'tb_sektor.id_sektor');
            sql.leftJoin('tb_satupeta_locations', 'tb_satupeta_location_maplist.location_id', '=', 'tb_satupeta_locations.id_location');

            sql.select(
                'tb_satupeta_location_maplist.*',
                'tb_opd.nama_opd',
                'tb_sektor.nama_sektor',
                'tb_sektor.color_code as sektor_color',
                'tb_satupeta_locations.nama_location'
            );
            const data = await sql
                .whereRaw('LOWER(title) LIKE ?', [`%${titleAsText.toLowerCase()}%`])
                .first();

            if (!data) {
                return h.response({ message: 'Data not found' }).code(404);
            }

            const plainItem = data.toJSON ? data.toJSON() : { ...data };

            if (plainItem.images) {
                try {
                    plainItem.presignedUrl = await generatePresignedUrl(`tumb/` + plainItem.images, 60 * 5);
                }
                catch (err) {
                    console.warn(`⚠️ Gagal membuat presigned URL:`, err.message);
                    plainItem.presignedUrl = null;
                }
            }
            else {
                plainItem.presignedUrl = null;
            }

            const sql2 = internals_tb_satupeta_location_maplist.sqlBaseView.clone();
            const data2 = await sql2
                .whereRaw('LOWER(title) LIKE ?', [`%${titleAsText.toLowerCase()}%`])
                .first();

            const resultlocationpointQuery = internals_tb_satupeta_location_points.sqlBaseView.clone();
            resultlocationpointQuery.clearSelect();
            resultlocationpointQuery.leftJoin('tb_satupeta_locations', 'tb_satupeta_location_points.location_id', '=', 'tb_satupeta_locations.id_location');
            resultlocationpointQuery.leftJoin('tb_kecamatan', 'tb_satupeta_location_points.kecamatan_id', '=', 'tb_kecamatan.id_kecamatan');
            resultlocationpointQuery.leftJoin('tb_desa', 'tb_satupeta_location_points.desa_id', '=', 'tb_desa.id_desa');
            resultlocationpointQuery.select(
                'tb_satupeta_locations.nama_location as nama_lokasi',
                'tb_satupeta_location_points.nama_location_point',
                'tb_kecamatan.id_kecamatan as kode_kecamatan',
                'tb_desa.id_desa as kode_desa',
                'tb_satupeta_location_points.coordinat',
                'tb_satupeta_location_points.created_at',
                'tb_satupeta_location_points.updated_at'
            );
            resultlocationpointQuery.where('tb_satupeta_location_points.location_id', data2.location_id);

            const resultLocationPoint = await resultlocationpointQuery
                .orderBy('tb_satupeta_location_points.nama_location_point', 'asc');

            const dataCountRaw = await Knex('tb_satupeta_location_maplist_visitors')
                .where('id_maplist', id)
                .count('id_maplist as count_maplist')
                .first();

            const dataCount = dataCountRaw ? parseInt(dataCountRaw.count_maplist, 10) : 0;

            const dataCountRawDownload = await Knex('tb_satupeta_location_maplist_download')
                .where('id_maplist', id)
                .count('id_maplist as count_maplist')
                .first();

            const dataCountDownload = dataCountRawDownload ? parseInt(dataCountRawDownload.count_maplist, 10) : 0;

            return h.response({
                data: plainItem,
                datacount: dataCount,
                datacountdownload: dataCountDownload,
                resultLocationPoint
            }).code(200);
        }
        catch (err) {
            console.error('Error in view_id:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    update_location_maplist: async function (request, h) {
        const { id } = request.params;
        const id_maplist = id;
        const {
            koleksi_data, title, tahun_rilis, tipe, periode, pengukuran,
            deskripsi, visibilitas, location_id, satker_id, sektor_id, admin
        } = request.payload;

        const file = request.payload.file;
        let filename = null;
        let filename_tumb = null;
        const tanggal = moment().format('YYYY-MM-DD');

        try {
            const oldData = await Knex('tb_satupeta_location_maplist').where({ id_maplist }).first();
            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            // jika ada file baru
            if (file && file.hapi && file.hapi.filename) {
                if (oldData.images) {
                    try {
                        await deleteFile(oldData.images);
                        await deleteFile(`tumb` + oldData.images);
                    }
                    catch (err) {
                        console.warn('⚠️ Gagal hapus file lama:', err.message);
                    }
                }

                const ext1 = path.extname(file.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename = `satupeta/images/${tanggal}_${safeTitle}${ext1}`;
                filename_tumb = `tumb/satupeta/images/${tanggal}_${safeTitle}${ext1}`;

                // ambil buffer
                const fileData = file._data;
                if (!fileData) {
                    throw new Error('❌ File data kosong');
                }

                await uploadFile(fileData, filename, file.hapi.headers['content-type']);
                await uploadFileTumb(fileData, filename_tumb, file.hapi.headers['content-type']);
            }

            const updateData = {
                koleksi_data,
                title,
                tahun_rilis,
                tipe,
                periode,
                pengukuran,
                visibilitas,
                deskripsi,
                location_id,
                satker_id,
                sektor_id,
                admin,
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            if (filename) {
                updateData.images = filename;
            }

            await Knex('tb_satupeta_location_maplist').where({ id_maplist }).update(updateData);

            return h.response({ message: 'Berhasil Diupdate' }).code(201);
        }
        catch (err) {
            console.error('Error saat upload atau update:', err);
            return h.response({ msg: 'Gagal menyimpan' }).code(500);
        }
    },

    addmulti_location_maplist: async function (request, h) {
        try {
            let { locations, admin } = request.payload;

            if (typeof locations === 'string') {
                try {
                    locations = JSON.parse(locations);
                }
                catch (e) {
                    return h.response({ msg: 'Format locations tidak valid JSON' }).code(400);
                }
            }

            for (let i = 0; i < locations.length; i++) {
                const loc = locations[i];

                const exists = await Knex('tb_satupeta_location_maplist')
                    .where({
                        koleksi_data: loc.koleksi_data,
                        tipe: loc.tipe,
                        location_id: loc.location_id,
                        sektor_id: loc.sektor_id,
                        satker_id: loc.satker_id,
                        title: loc.title,
                        tahun_rilis: loc.tahun_rilis
                    })
                    .first();

                const addData = {
                    koleksi_data: loc.koleksi_data,
                    tipe: loc.tipe,
                    location_id: loc.location_id,
                    sektor_id: loc.sektor_id,
                    satker_id: loc.satker_id,
                    title: loc.title,
                    tahun_rilis: loc.tahun_rilis,
                    periode: loc.periode,
                    pengukuran: loc.pengukuran,
                    visibilitas: loc.visibilitas,
                    deskripsi: loc.deskripsi,
                    admin,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                    created_at: moment().format('YYYY-MM-DD HH:mm:ss')
                };

                if (!exists) {
                    const fileKey = `file_${i}`;
                    const file = request.payload[fileKey];

                    if (file && file.hapi && file._data) {
                    // ✅ Kalau pakai Hapi multipart, biasanya ada file._data langsung
                        const buffer = file._data;
                        const tanggal = moment().format('YYYY-MM-DD');
                        const ext1 = path.extname(file.hapi.filename);
                        const safeTitle = sanitizeFileName(loc.title);
                        const filename = `satupeta/images/${tanggal}_${safeTitle}${ext1}`;
                        const filename_tumb = `tumb/satupeta/images/${tanggal}_${safeTitle}${ext1}`;
                        addData.images = filename;

                        await uploadFile(buffer, filename,file.hapi.headers['content-type']);
                        await uploadFileTumb(buffer, filename_tumb,file.hapi.headers['content-type']);
                    }
                    else if (file && file.readable) {
                    // ✅ fallback kalau yang masuk Readable stream
                        const buffer = await streamToBuffer(file);
                        const tanggal = moment().format('YYYY-MM-DD');
                        const ext1 = path.extname(file.hapi.filename);
                        const safeTitle = sanitizeFileName(loc.title);
                        const filename = `satupeta/images/${tanggal}_${safeTitle}${ext1}`;
                        const filename_tumb = `tumb/satupeta/images/${tanggal}_${safeTitle}${ext1}`;
                        addData.images = filename;
                        await uploadFile(buffer, filename,file.hapi.headers['content-type']);
                        await uploadFileTumb(buffer, filename_tumb,file.hapi.headers['content-type']);
                    }

                    await Knex('tb_satupeta_location_maplist').insert(addData);
                }
                else {
                    console.log(`Data sudah ada: ${loc.title}`);
                }
            }

            return h.response({ message: 'Semua data berhasil disimpan' }).code(201);
        }
        catch (err) {
            console.error('Error saat insert multiple locations:', err);
            return h.response({ msg: 'Gagal menyimpan dataset', error: err.message }).code(500);
        }
    },


    addcsv_location_maplist: async function (request, h) {
        const { file,admin } = request.payload;

        if (!file) {
            return h.response({ error: 'File tidak ditemukan' }).code(400);
        }

        const filename = `${moment().format('YYYYMMDD_HHmmss')}_${file.hapi.filename}`;
        const filepath = path.join(__dirname, '../../../uploads', filename);

        try {
        // simpan file sementara
            await new Promise((resolve, reject) => {
                const fileStream = fs.createWriteStream(filepath);
                file.pipe(fileStream);
                file.on('end', () => fileStream.end(() => resolve()));
                file.on('error', reject);
            });

            const requiredCols = [
                'koleksi_data',
                'title',
                'satker_id',
                'sektor_id',
                'location_id',
                'tahun_rilis',
                'tipe',
                'pengukuran',
                'periode',
                'deskripsi',
                'images',
                'visibilitas'
            ];

            let rows = [];
            const ext = path.extname(filename).toLowerCase();

            if (ext === '.csv') {
                rows = await parseCSV(filepath);
            }
            else if (ext === '.xlsx' || ext === '.xls') {
                const workbook = XLSX.readFile(filepath);
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                rows = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
            }
            else {
                fs.unlinkSync(filepath);
                return h.response({ error: 'Format file tidak didukung (hanya CSV/XLSX)' }).code(400);
            }

            // hapus file setelah diproses
            fs.unlinkSync(filepath);

            if (!rows || rows.length === 0) {
                return h.response({ error: 'File kosong atau tidak bisa dibaca' }).code(400);
            }

            // validasi kolom
            const fileCols = Object.keys(rows[0] || {});
            const missingCols = requiredCols.filter((col) => !fileCols.includes(col));
            if (missingCols.length > 0) {
                return h.response({
                    error: 'Kolom tidak sesuai',
                    detail: `Kolom wajib tidak ditemukan: ${missingCols.join(', ')}`
                }).code(400);
            }

            // proses insert
            const insertData = [];
            for (const row of rows) {
                const exists = await Knex('tb_satupeta_location_maplist')
                    .where({
                        koleksi_data: row.koleksi_data,
                        satker_id: row.satker_id,
                        sektor_id: row.sektor_id,
                        location_id: row.location_id,
                        title: row.title,
                        tahun_rilis: row.tahun_rilis
                    })
                    .first();

                if (!exists) {
                    insertData.push({
                        koleksi_data: row.koleksi_data,
                        title: row.title,
                        sektor_id: row.sektor_id,
                        satker_id: row.satker_id,
                        location_id: row.location_id,
                        tahun_rilis: row.tahun_rilis,
                        tipe: row.tipe,
                        pengukuran: row.pengukuran,
                        periode: row.periode,
                        deskripsi: row.deskripsi,
                        images: row.images,
                        visibilitas: row.visibilitas,
                        admin,
                        created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                        updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                    });
                }
            }

            if (insertData.length > 0) {
                await Knex.transaction(async (trx) => {
                    await trx.batchInsert('tb_satupeta_location_maplist', insertData, 100);
                });
            }

            return h.response({
                message: `File ${ext === '.csv' ? 'CSV' : 'Excel'} berhasil diproses`,
                inserted: insertData.length,
                skipped: rows.length - insertData.length
            }).code(201);

        }
        catch (err) {
            console.error('CSV/Excel Upload Error:', err);
            return h.response({ error: 'Gagal memproses file', detail: err.message }).code(500);
        }
    },

    delete_location_maplist: async function (request, h) {
        const id_maplist = request.params.id;

        try {
            const oldData = await Knex('tb_satupeta_location_maplist').where({ id_maplist }).first();
            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            if (oldData.images) {
                try {
                    await deleteFile(oldData.images);
                    await deleteFile(`tumb/` + oldData.images);
                }
                catch (err) {
                    console.warn('⚠️ Gagal menghapus file lama dari storage:', err.message);
                }
            }

            await Knex('tb_satupeta_location_maplist').where({ id_maplist }).del();

            return h.response({ message: 'Berhasil Dihapus' }).code(201);
        }
        catch (err) {
            console.error('❌ Error saat hapus data:', err);
            return h.response({ msg: 'Gagal Hapus' }).code(500);
        }
    },

    add_location_maplist_visitor: async function (request, h) {
        const { id_maplist } = request.payload;
        const ip = request.info.remoteAddress;
        const userAgent = request.headers['user-agent'];
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        //console.log('id maplist : ' + id_maplist);

        try {
            if (!id_maplist) {
                return h.response({ msg: 'id_maplist wajib dikirim' }).code(400);
            }

            const exists = await Knex('tb_satupeta_location_maplist_visitors')
                .where('id_maplist', id_maplist)
                .andWhere('ip_address', ip)
                .andWhereRaw(`DATE(visited_at) = ?`, [today])
                .first();

            if (!exists) {
                await Knex('tb_satupeta_location_maplist_visitors').insert({
                    id_maplist,
                    ip_address: ip,
                    user_agent: userAgent,
                    visited_at: Knex.fn.now()
                });
            }

            return h.response({ message: 'Visitor logged' }).code(200);
        }
        catch (err) {
            console.error('❌ Error logging visitor:', err);
            return h.response({ message: 'Failed to log visitor' }).code(500);
        }
    },

    add_location_maplist_download: async function (request, h) {
        const { id_maplist } = request.payload;
        const ip = request.info.remoteAddress;
        const userAgent = request.headers['user-agent'];
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        //console.log('id maplist : ' + id_maplist);

        try {
            if (!id_maplist) {
                return h.response({ msg: 'id_maplist wajib dikirim' }).code(400);
            }

            const exists = await Knex('tb_satupeta_location_maplist_download')
                .where('id_maplist', id_maplist)
                .andWhere('ip_address', ip)
                .andWhereRaw(`DATE(visited_at) = ?`, [today])
                .first();

            if (!exists) {
                await Knex('tb_satupeta_location_maplist_download').insert({
                    id_maplist,
                    ip_address: ip,
                    user_agent: userAgent,
                    visited_at: Knex.fn.now()
                });
            }

            return h.response({ message: 'Visitor logged' }).code(200);
        }
        catch (err) {
            console.error('❌ Error logging visitor:', err);
            return h.response({ message: 'Failed to log visitor' }).code(500);
        }
    },

    view_location_point_id: async function (request, h) {
        try {
            const { id } = request.params;
            const sql = internals_tb_satupeta_location_points.sqlBaseView.clone();

            sql.join('tb_kecamatan', 'tb_satupeta_location_points.kecamatan_id', '=', 'tb_kecamatan.id_kecamatan');
            sql.join('tb_desa', 'tb_satupeta_location_points.desa_id', '=', 'tb_desa.id_desa');
            sql.join('tb_satupeta_locations', 'tb_satupeta_location_points.location_id', '=', 'tb_satupeta_locations.id_location');


            // Pilih kolom-kolom yang dibutuhkan
            sql.select(
                'tb_satupeta_location_points.*',
                'tb_kecamatan.nama_kecamatan as kecamatan',
                'tb_desa.nama_desa as desa',
                'tb_satupeta_locations.nama_location',
                'tb_satupeta_locations.sektor_id as bidangUrusanId'
            );
            const data = await sql.where('id_location_point', id).first();

            if (!data) {
                return h.response({ message: 'Data not found' }).code(404);
            }


            return h.response(data).code(200);
        }
        catch (err) {
            console.error('Error in view_id:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    update_location_point: async function (request, h) {

        const { id } = request.params;
        const id_location_point = id;
        const {
            nama_location_point,coordinat,location_id, kecamatan_id, desa_id
        } = request.payload;


        //console.log('data id' + komponen);



        const tanggal = moment().format('YYYY-MM-DD');

        try {

            const oldData = await Knex('tb_satupeta_location_points').where({ id_location_point }).first();

            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            // Simpan metadata ke database
            const updateData = {
                nama_location_point,
                location_id,
                coordinat,
                kecamatan_id,
                desa_id,
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };


            await Knex('tb_satupeta_location_points').where({ id_location_point }).update(updateData);

            return h.response({ message: 'Berhasil Diupdate' }).code(201);
        }
        catch (err) {
            console.error('Error saat upload atau update:', err);
            return h.response({ msg: 'Gagal menyimpan' }).code(500);
        }
    },

    add_location_point: async function (request, h) {
        const {
            nama_location_point,coordinat,location_id, kecamatan_id, desa_id
        } = request.payload;

        const tanggal = moment().format('YYYY-MM-DD');

        try {

            const exists = await Knex('tb_satupeta_location_points')
                .where({
                    nama_location_point,
                    kecamatan_id,
                    desa_id
                })
                .first();

            const addData = {
                nama_location_point,
                location_id,
                coordinat,
                kecamatan_id,
                desa_id,
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                created_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            if (!exists) {
                await Knex('tb_satupeta_location_points').insert(addData);
                return h.response({ message: 'Berhasil disimpan' }).code(201);
            }

            return h.response({ msg: 'Data Sudah Ada' }).code(500);


        }
        catch (err) {
            console.error('Error saat upload atau insert:', err);
            return h.response({ msg: 'Gagal menyimpan dataset' }).code(500);
        }
    },

    addmulti_location_point: async function (request, h) {
        try {
            const { locations } = request.payload;

            for (const loc of locations) {
                const exists = await Knex('tb_satupeta_location_points')
                    .where({ nama_location_point: loc.nama_location_point, kecamatan_id: loc.kecamatan_id, desa_id: loc.desa_id })
                    .first();

                const addData = {
                    nama_location_point: loc.nama_location_point,
                    coordinat: loc.coordinat,
                    location_id: loc.location_id,
                    kecamatan_id: loc.kecamatan_id,
                    desa_id: loc.desa_id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                    created_at: moment().format('YYYY-MM-DD HH:mm:ss')
                };

                if (!exists) {
                    await Knex('tb_satupeta_location_points').insert(addData);
                }
                else {
                    console.log(`Data sudah ada: ${loc.nama_location_point}`);
                }
            }

            return h.response({ message: 'Semua data berhasil disimpan' }).code(201);

        }
        catch (err) {
            console.error('Error saat insert multiple locations:', err);
            return h.response({ msg: 'Gagal menyimpan dataset', error: err.message }).code(500);
        }
    },



    addcsv_location_point: async function (request, h) {
        const { file } = request.payload;

        if (!file) {
            return h.response({ error: 'File tidak ditemukan' }).code(400);
        }

        const filename = `${moment().format('YYYYMMDD_HHmmss')}_${file.hapi.filename}`;
        const filepath = path.join(__dirname, '../../../uploads', filename);

        try {
        // simpan file sementara
            await new Promise((resolve, reject) => {
                const fileStream = fs.createWriteStream(filepath);
                file.pipe(fileStream);
                file.on('end', () => fileStream.end(() => resolve()));
                file.on('error', reject);
            });

            const requiredCols = [
                'nama_location_point',
                'coordinat',
                'location',
                'kecamatan',
                'desa'
            ];

            let rows = [];
            const ext = path.extname(filename).toLowerCase();

            if (ext === '.csv') {
                rows = await parseCSV(filepath);
            }
            else if (ext === '.xlsx' || ext === '.xls') {
                const workbook = XLSX.readFile(filepath);
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                rows = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
            }
            else {
                fs.unlinkSync(filepath);
                return h.response({ error: 'Format file tidak didukung (hanya CSV/XLS/XLSX)' }).code(400);
            }

            // hapus file setelah diproses
            fs.unlinkSync(filepath);

            if (!rows || rows.length === 0) {
                return h.response({ error: 'File kosong atau tidak bisa dibaca' }).code(400);
            }

            // validasi kolom
            const fileCols = Object.keys(rows[0] || {});
            const missingCols = requiredCols.filter((col) => !fileCols.includes(col));
            if (missingCols.length > 0) {
                return h.response({
                    error: 'Kolom tidak sesuai',
                    detail: `Kolom wajib tidak ditemukan: ${missingCols.join(', ')}`
                }).code(400);
            }

            // parsing koordinat: otomatis balik [lat, lon] → [lon, lat] jika perlu
            rows = rows.map((row) => {
                try {
                    let coord = row.coordinat;

                    if (typeof coord === 'string') {
                        coord = coord.trim();

                        // jika string JSON "[lat, lon]"
                        if (coord.startsWith('[') && coord.endsWith(']')) {
                            coord = JSON.parse(coord);
                        }
                        // jika string "lat, lon"
                        else if (coord.includes(',')) {
                            const parts = coord.split(',').map((s) => parseFloat(s.trim()));
                            if (parts.length === 2 && !parts.some(isNaN)) {
                                coord = parts;
                            }
                            else {
                                throw new Error('Format koordinat salah');
                            }
                        }
                        else {
                            throw new Error('Format koordinat tidak dikenal');
                        }
                    }

                    // balik [lat, lon] → [lon, lat] jika lat < 0 dan lon > 0
                    if (Array.isArray(coord) && coord.length === 2 && coord[0] < 0 && coord[1] > 0) {
                        coord = [coord[1], coord[0]];
                    }

                    row.coordinat = coord;
                }
                catch (e) {
                    console.error('Gagal parsing koordinat:', row.coordinat);
                    row.coordinat = null; // skip koordinat invalid
                }

                return row;
            });

            // proses insert
            const insertData = [];
            for (const row of rows) {
                if (!row.coordinat) {
                    continue;
                } // skip jika koordinat invalid

                const exists = await Knex('tb_satupeta_location_points')
                    .where({
                        nama_location_point: row.nama_location_point,
                        kecamatan_id: row.kecamatan,
                        desa_id: row.desa
                    })
                    .first();

                if (!exists) {
                    insertData.push({
                        nama_location_point: row.nama_location_point,
                        coordinat: JSON.stringify(row.coordinat),
                        location_id: row.location,
                        kecamatan_id: row.kecamatan,
                        desa_id: row.desa,
                        created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                        updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                    });
                }
            }

            if (insertData.length > 0) {
                await Knex.transaction(async (trx) => {
                    await trx.batchInsert('tb_satupeta_location_points', insertData, 100);
                });
            }

            return h.response({
                message: `File ${ext === '.csv' ? 'CSV' : 'Excel'} berhasil diproses`,
                inserted: insertData.length,
                skipped: rows.length - insertData.length
            }).code(201);

        }
        catch (err) {
            console.error('CSV/Excel Upload Error:', err);
            return h.response({ error: 'Gagal memproses file', detail: err.message }).code(500);
        }
    },

    delete_location_point: async function (request, h) {
        const id_location_point = request.params.id; // ambil ID dari URL

        try {
            const oldData = await Knex('tb_satupeta_location_points')
                .where({ id_location_point })
                .first();

            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            if (oldData.images) {
                try {
                    await deleteFile(oldData.images);
                }
                catch (err) {
                    console.warn('⚠️ Gagal menghapus file lama dari storage:', err.message);
                }
            }

            await Knex('tb_satupeta_location_points')
                .where({ id_location_point })
                .del();

            return h.response({ message: 'Berhasil Dihapus' }).code(201);
        }
        catch (err) {
            console.error('❌ Error saat hapus data:', err);
            return h.response({ msg: 'Gagal Hapus' }).code(500);
        }
    },







    view_datageo_kecamatan: async function (request, h) {
        try {
            // Ambil query param
            let search_kecamatan = request.query.search_kecamatan || [];

            // Pastikan selalu berupa array
            if (!Array.isArray(search_kecamatan)) {
                search_kecamatan = [search_kecamatan];
            }

            // Konversi ke integer, buang yang tidak valid
            search_kecamatan = search_kecamatan
                .map((v) => parseInt(v, 10))
                .filter((v) => !isNaN(v));

            //console.log('✅ search_kecamatan:', search_kecamatan);

            const query = Knex('tb_kecamatan');

            // Filter jika ada
            if (search_kecamatan.length > 0) {
                query.whereIn('id_kecamatan', search_kecamatan);
            }

            const data = await query.select(
                'id_kecamatan',
                'nama_kecamatan',
                'geojson',
                'map_color'
            );

            const features = data.map((row) => ({
                type: 'Feature',
                properties: {
                    id_kecamatan: row.id_kecamatan,
                    nama_kecamatan: row.nama_kecamatan,
                    map_color: row.map_color
                },
                geometry: {
                    type: 'Polygon',
                    coordinates: JSON.parse(row.geojson)
                }
            }));

            return h
                .response({
                    type: 'FeatureCollection',
                    features
                })
                .code(200);
        }
        catch (error) {
            console.error('❌ Error in view_datageo_kecamatan:', error);
            return h
                .response({
                    msg: 'Terjadi kesalahan pada server',
                    error: error.message
                })
                .code(500);
        }
    },


    view_datageo_desa: async function (request, h) {
        let search_kecamatan = request.query.search_kecamatan || [];
        let search_desa = request.query.search_desa || [];

        try {
        // ✅ Build query builder terlebih dahulu
            // Pastikan selalu berupa array
            if (!Array.isArray(search_kecamatan)) {
                search_kecamatan = [search_kecamatan];
            }

            // Konversi ke integer, buang yang tidak valid
            search_kecamatan = search_kecamatan
                .map((v) => parseInt(v, 10))
                .filter((v) => !isNaN(v));

            // Pastikan selalu berupa array
            if (!Array.isArray(search_desa)) {
                search_desa = [search_desa];
            }

            // Konversi ke integer, buang yang tidak valid
            search_desa = search_desa
                .map((v) => parseInt(v, 10))
                .filter((v) => !isNaN(v));

            let query = Knex('tb_desa')
                .join('tb_kecamatan', 'tb_desa.kecamatan_id', '=', 'tb_kecamatan.id_kecamatan')
                .select('tb_desa.*', 'tb_kecamatan.nama_kecamatan');

            // Filter jika ada
            if (search_kecamatan.length > 0) {
                query = query.whereIn('kecamatan_id', search_kecamatan);
            }

            // Filter jika ada
            if (search_desa.length > 0) {
                query = query.whereIn('id_desa', search_desa);
            }

            const data = await query;

            const features = data.map((row) => ({
                type: 'Feature',
                properties: {
                    id_desa: row.id_desa,
                    nama_desa: row.nama_desa,
                    map_color: row.map_color,
                    nama_kecamatan: row.nama_kecamatan // tambahkan supaya tooltip kecamatan bisa muncul
                },
                geometry: {
                    type: 'Polygon',
                    coordinates: JSON.parse(row.geojson)
                }
            }));

            return h.response({ type: 'FeatureCollection', features }).code(200);
        }
        catch (error) {
            console.error('❌ Error in view_datageo:', error);
            return h.response({ msg: 'Terjadi kesalahan pada server', error: error.message }).code(500);
        }
    },


    view_locationmaplist_id: async function (request, h) {
        try {
            const { id } = request.params;
            const sql = internals_location_maplist.sqlBaseView.clone();

            sql.join('tb_opd', 'tb_satupeta_location_maplist.satker_id', '=', 'tb_opd.id_opd');
            sql.join('tb_sektor', 'tb_satupeta_location_maplist.sektor_id', '=', 'tb_sektor.id_sektor');
            sql.select(
                'tb_satupeta_location_maplist.*',
                'tb_opd.nama_opd',
                'tb_sektor.nama_sektor'
            );

            const data = await sql.where('id_maplist', id).first();
            if (!data) {
                return h.response({ message: 'Data not found' }).code(404);
            }

            const plainItem = data.toJSON ? data.toJSON() : { ...data };
            const namaKategori = plainItem.document?.replace(/\s+/g, '') || 'default';

            try {
                plainItem.presignedUrl = data.images
                    ? await generatePresignedUrl(data.images)
                    : null;
            }
            catch (err) {
                console.warn(`⚠️ Gagal buat presigned URL untuk ${namaKategori}:`, err.message);
                plainItem.presignedUrl = null;
            }

            return h.response({ plainItem }).code(200);
        }
        catch (err) {
            console.error('❌ Error in view_locationmaplist_id:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },


    add_locationmaplist: async function (request, h) {
        const { koleksi_data, location_id, title, satker_id, sektor_id, tahun_rilis, visibilitas } = request.payload;
        const file = request.payload.file;
        const tanggal = moment().format('YYYY-MM-DD');
        let filename = null;

        try {
            if (file && file.hapi && file.hapi.filename) {
                const ext = path.extname(file.hapi.filename);
                filename = `satupeta/images/${tanggal}_${title}${ext}`;
                await uploadFile(filename, file, file.hapi.headers['content-type']);
            }

            const addData = {
                koleksi_data,
                location_id,
                title,
                satker_id,
                sektor_id,
                tahun_rilis,
                visibilitas,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            if (filename) {
                addData.images = filename;
            }

            await Knex('tb_satupeta_location_maplist').insert(addData);
            return h.response({ message: 'Berhasil disimpan' }).code(201);
        }
        catch (err) {
            console.error('❌ Error saat upload atau insert:', err);
            return h.response({ msg: 'Gagal menyimpan dataset' }).code(500);
        }
    },



    update_locationmaplist: async function (request, h) {
        const id = request.params.id;
        const { koleksi_data, location_id, title, satker_id, sektor_id, tahun_rilis, visibilitas } = request.payload;
        const file = request.payload.file;
        const tanggal = moment().format('YYYY-MM-DD');
        let filename = null;

        try {
            const oldData = await Knex('tb_satupeta_location_maplist').where({ id }).first();
            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            if (file && file.hapi && file.hapi.filename) {
                if (oldData.images) {
                    try {
                        await deleteFile(oldData.images);
                    }
                    catch (err) {
                        console.warn('⚠️ Gagal menghapus file lama:', err.message);
                    }
                }

                const ext = path.extname(file.hapi.filename);
                filename = `satupeta/images/${tanggal}_${title}${ext}`;
                await uploadFile(filename, file, file.hapi.headers['content-type']);
            }

            const updateData = {
                koleksi_data,
                location_id,
                title,
                satker_id,
                sektor_id,
                tahun_rilis,
                visibilitas,
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            if (filename) {
                updateData.images = filename;
            }

            await Knex('tb_satupeta_location_maplist').where({ id }).update(updateData);
            return h.response({ message: 'Berhasil Diupdate' }).code(201);
        }
        catch (err) {
            console.error('❌ Error saat update:', err);
            return h.response({ msg: 'Gagal menyimpan' }).code(500);
        }
    },


    delete_locationmaplist: async function (request, h) {
        const id = request.params.id;

        try {
            const oldData = await Knex('tb_satupeta_location_maplist').where({ id }).first();
            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            if (oldData.images) {
                try {
                    await deleteFile(oldData.images);
                    await deleteFile(`tumb/` + oldData.images);
                }
                catch (err) {
                    console.warn('⚠️ Gagal menghapus file lama:', err.message);
                }
            }

            await Knex('tb_satupeta_location_maplist').where({ id }).del();
            return h.response({ message: 'Berhasil Dihapus' }).code(201);
        }
        catch (err) {
            console.error('❌ Error saat hapus:', err);
            return h.response({ msg: 'Gagal Hapus' }).code(500);
        }
    },



    // ============================
    // VIEW BERITA
    // ============================
    view_list_artikel: async function (request, h) {
        try {
            const { page = 1, limit = 10, search_kunci = '' } = request.query;
            const offset = (page - 1) * limit;

            // filter pencarian
            let query = Knex('tb_satupeta_artikel');
            if (search_kunci) {
                query = query.where('title', 'like', `%${search_kunci}%`);
            }

            // ambil data + total
            const [rows, [{ count }]] = await Promise.all([
                query.clone().offset(offset).limit(limit),
                query.clone().count({ count: '*' })
            ]);

            // mapping & presigned URL
            const data = await Promise.all(rows.map(async (item) => {
                const plainItem = item.toJSON ? item.toJSON() : { ...item };
                try {
                    plainItem.presignedUrl_a = item.images_a
                        ? await generatePresignedUrl(item.images_a)
                        : null;
                    plainItem.presignedUrl_b = item.images_b
                        ? await generatePresignedUrl(item.images_b)
                        : null;
                    plainItem.presignedUrl_c = item.images_c
                        ? await generatePresignedUrl(item.images_c)
                        : null;
                    plainItem.presignedUrl_tumb_a = item.images_a
                        ? await generatePresignedUrl(`tumb/` + item.images_a)
                        : null;
                    plainItem.presignedUrl_tumb_b = item.images_b
                        ? await generatePresignedUrl(`tumb/` + item.images_b)
                        : null;
                    plainItem.presignedUrl_tumb_c = item.images_c
                        ? await generatePresignedUrl(`tumb/` + item.images_c)
                        : null;
                    plainItem.presignedUrl_download_file = item.download_file
                        ? await generatePresignedUrl(item.download_file)
                        : null;
                }
                catch (err) {
                    console.warn(`⚠️ Gagal generate URL untuk artikel ID ${item.id}:`, err.message);
                    plainItem.presignedUrl_a = null;
                    plainItem.presignedUrl_b = null;
                    plainItem.presignedUrl_c = null;
                    plainItem.presignedUrl_tumb_a = null;
                    plainItem.presignedUrl_tumb_b = null;
                    plainItem.presignedUrl_tumb_c = null;
                    plainItem.presignedUrl_download_file = null;
                }

                return plainItem;
            }));

            const total = parseInt(count, 10);
            const totalPages = Math.ceil(total / limit);

            return h.response({
                data,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages
                }
            }).code(200);

        }
        catch (err) {
            console.error('❌ Error in view_list_artikel:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },


    view_list_artikel_detail: async function (request, h) {
        try {
            const { title } = request.params;
            // Decode URL dan ubah tanda minus jadi spasi
            const titleAsText = decodeURIComponent(title).replace(/-/g, ' ');

            const sql = internals_artikel.sqlBaseView.clone();
            sql.join('tb_users', 'tb_satupeta_artikel.admin', '=', 'tb_users.id');
            sql.select(
                'tb_satupeta_artikel.*',
                'tb_users.nick as nick_admin'
            );

            const data = await sql
                .whereRaw('LOWER(title) LIKE ?', [`%${titleAsText.toLowerCase()}%`])
                .first();

            if (!data) {
                return h.response({ message: 'Data tidak ditemukan' }).code(404);
            }

            const plainItem = { ...data };

            // 🔹 Daftar kolom file yang butuh presigned URL
            const fileFields = [
                { key: 'images_a', urlKey: 'presignedUrl_a' },
                { key: 'images_b', urlKey: 'presignedUrl_b' },
                { key: 'images_c', urlKey: 'presignedUrl_c' },
                { key: 'download_file', urlKey: 'presignedUrl_download' }
            ];

            for (const { key, urlKey } of fileFields) {
                if (data[key]) {
                    try {
                        plainItem[urlKey] = await generatePresignedUrl(data[key]);
                        plainItem[urlKey + `_tumb`] = await generatePresignedUrl(`tumb/` + data[key]);
                    }
                    catch (err) {
                        console.warn(`⚠️ Gagal generate URL untuk ${key}:`, err.message);
                        plainItem[urlKey] = null;
                        plainItem[urlKey + `_tumb`] = null;
                    }
                }
            }

            return h.response(plainItem).code(200);
        }
        catch (err) {
            console.error('❌ Error in view_list_artikel_detail:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    view_list_artikel_detail_admin: async function (request, h) {
        try {
            const { id_artikel } = request.params;
            // Decode URL dan ubah tanda minus jadi spasi
            //const titleAsText = decodeURIComponent(title).replace(/-/g, ' ');

            const sql = internals_artikel.sqlBaseView.clone();
            sql.join('tb_users', 'tb_satupeta_artikel.admin', '=', 'tb_users.id');
            sql.select(
                'tb_satupeta_artikel.*',
                'tb_users.nick as nick_admin'
            );

            const data = await sql
                .where('id_artikel', id_artikel)
                .first();

            if (!data) {
                return h.response({ message: 'Data tidak ditemukan' }).code(404);
            }

            const plainItem = { ...data };

            // 🔹 Daftar kolom file yang butuh presigned URL
            const fileFields = [
                { key: 'images_a', urlKey: 'presignedUrl_a' },
                { key: 'images_b', urlKey: 'presignedUrl_b' },
                { key: 'images_c', urlKey: 'presignedUrl_c' },
                { key: 'download_file', urlKey: 'presignedUrl_download' }
            ];

            for (const { key, urlKey } of fileFields) {
                if (data[key]) {
                    try {
                        plainItem[urlKey] = await generatePresignedUrl(data[key]);
                        plainItem[urlKey + `_tumb`] = await generatePresignedUrl(`tumb/` + data[key]);
                    }
                    catch (err) {
                        console.warn(`⚠️ Gagal generate URL untuk ${key}:`, err.message);
                        plainItem[urlKey] = null;
                        plainItem[urlKey + `_tumb`] = null;
                    }
                }
            }

            return h.response(plainItem).code(200);
        }
        catch (err) {
            console.error('❌ Error in view_list_artikel_detail:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    // ============================
    // ADD BERITA
    // ============================
    add_artikel: async function (request, h) {
        const { title, content_a,content_b,content_c,sumber,  visibilitas,admin } = request.payload;
        const file_a = request.payload.file_a;
        const file_b = request.payload.file_b;
        const file_c = request.payload.file_c;
        const download_file = request.payload.download_file;
        const tanggal = moment().format('YYYY-MM-DD');
        let filename_a = null;
        let filename_b = null;
        let filename_c = null;
        let filename_a_tumb = null;
        let filename_b_tumb = null;
        let filename_c_tumb = null;
        let filename_download = null;

        try {


            if (file_a && file_a.hapi && file_a.hapi.filename) {
                const ext1 = path.extname(file_a.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename_a = `satupeta/artikel/${tanggal}_${safeTitle}_a${ext1}`;
                filename_a_tumb = `tumb/satupeta/artikel/${tanggal}_${safeTitle}_a${ext1}`;

                // ambil buffer
                const fileData = file_a._data;
                if (!fileData) {
                    throw new Error('❌ File data kosong');
                }

                await uploadFile(fileData, filename_a, file_a.hapi.headers['content-type']);
                await uploadFileTumb(fileData, filename_a_tumb, file_a.hapi.headers['content-type']);
            }

            if (file_b && file_b.hapi && file_b.hapi.filename) {
                const ext1 = path.extname(file_b.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename_b = `satupeta/artikel/${tanggal}_${safeTitle}_b${ext1}`;
                filename_b_tumb = `tumb/satupeta/artikel/${tanggal}_${safeTitle}_b${ext1}`;

                // ambil buffer
                const fileData = file_b._data;
                if (!fileData) {
                    throw new Error('❌ File data kosong');
                }

                await uploadFile(fileData, filename_b, file_b.hapi.headers['content-type']);
                await uploadFileTumb(fileData, filename_b_tumb, file_b.hapi.headers['content-type']);
            }

            if (file_c && file_c.hapi && file_c.hapi.filename) {
                const ext1 = path.extname(file_c.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename_c = `satupeta/artikel/${tanggal}_${safeTitle}_c${ext1}`;
                filename_c_tumb = `tumb/satupeta/artikel/${tanggal}_${safeTitle}_c${ext1}`;

                // ambil buffer
                const fileData = file_c._data;
                if (!fileData) {
                    throw new Error('❌ File data kosong');
                }

                await uploadFile(fileData, filename_c, file_c.hapi.headers['content-type']);
                await uploadFileTumb(fileData, filename_c_tumb, file_c.hapi.headers['content-type']);
            }

            if (download_file && download_file.hapi && download_file.hapi.filename) {
                const ext1 = path.extname(download_file.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename_download = `satupeta/download_file/artikel/${tanggal}_${safeTitle}${ext1}`;

                // ambil buffer
                const fileData = download_file._data;
                if (!fileData) {
                    throw new Error('❌ File data kosong');
                }

                await uploadFile(fileData, filename_download, download_file.hapi.headers['content-type']);
            }

            const updateData = {
                title,
                content_a,
                content_b,
                content_c,
                admin,
                sumber,
                visibilitas,
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };



            if (filename_a) {
                updateData.images_a = filename_a;
            }

            if (filename_b) {
                updateData.images_b = filename_b;
            }

            if (filename_c) {
                updateData.images_c = filename_c;
            }

            if (filename_download) {
                updateData.download_file = filename_download;
            }

            await Knex('tb_satupeta_artikel').insert(updateData);
            return h.response({ message: 'Berita berhasil ditambahkan' }).code(201);
        }
        catch (err) {
            console.error('❌ Error saat tambah artikel:', err);
            return h.response({ msg: 'Gagal menyimpan artikel' }).code(500);
        }
    },

    // ============================
    // UPDATE BERITA
    // ============================
    update_artikel: async function (request, h) {
        const id_artikel = request.params.id;
        const { title, content_a,content_b,content_c, sumber, visibilitas } = request.payload;
        const file_a = request.payload.file_a;
        const file_b = request.payload.file_b;
        const file_c = request.payload.file_c;
        const download_file = request.payload.download_file;
        const tanggal = moment().format('YYYY-MM-DD');
        let filename_a = null;
        let filename_b = null;
        let filename_c = null;
        let filename_a_tumb = null;
        let filename_b_tumb = null;
        let filename_c_tumb = null;
        let filename_download = null;

        try {
            const oldData = await Knex('tb_satupeta_artikel').where({ id_artikel }).first();
            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            //console.log('id_artikel', id_artikel);


            if (file_a && file_a.hapi && file_a.hapi.filename) {
                if (oldData.images_a) {
                    try {
                        await deleteFile(oldData.images_a);
                        await deleteFile(`tumb/` + oldData.images_a);
                    }
                    catch (err) {
                        console.warn('⚠️ Gagal hapus file lama artikel:', err.message);
                    }
                }

                const ext1 = path.extname(file_a.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename_a = `satupeta/artikel/${tanggal}_${safeTitle}_a${ext1}`;
                filename_a_tumb = `tumb/satupeta/artikel/${tanggal}_${safeTitle}_a${ext1}`;

                // ambil buffer
                const fileData = file_a._data;
                if (!fileData) {
                    throw new Error('❌ File data kosong');
                }

                await uploadFile(fileData, filename_a, file_a.hapi.headers['content-type']);
                await uploadFileTumb(fileData, filename_a_tumb, file_a.hapi.headers['content-type']);
            }

            if (file_b && file_b.hapi && file_b.hapi.filename) {
                if (oldData.images_b) {
                    try {
                        await deleteFile(oldData.images_b);
                        await deleteFile(`tumb/` + oldData.images_b);
                    }
                    catch (err) {
                        console.warn('⚠️ Gagal hapus file lama artikel:', err.message);
                    }
                }

                const ext1 = path.extname(file_b.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename_b = `satupeta/artikel/${tanggal}_${safeTitle}_b${ext1}`;
                filename_b_tumb = `tumb/satupeta/artikel/${tanggal}_${safeTitle}_b${ext1}`;

                // ambil buffer
                const fileData = file_b._data;
                if (!fileData) {
                    throw new Error('❌ File data kosong');
                }

                await uploadFile(fileData, filename_b, file_b.hapi.headers['content-type']);
                await uploadFileTumb(fileData, filename_b_tumb, file_b.hapi.headers['content-type']);
            }

            if (file_c && file_c.hapi && file_c.hapi.filename) {
                if (oldData.images_c) {
                    try {
                        await deleteFile(oldData.images_c);
                        await deleteFile(`tumb/` + oldData.images_c);
                    }
                    catch (err) {
                        console.warn('⚠️ Gagal hapus file lama artikel:', err.message);
                    }
                }

                const ext1 = path.extname(file_c.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename_c = `satupeta/artikel/${tanggal}_${safeTitle}_c${ext1}`;
                filename_c_tumb = `tumb/satupeta/artikel/${tanggal}_${safeTitle}_c${ext1}`;

                // ambil buffer
                const fileData = file_c._data;
                if (!fileData) {
                    throw new Error('❌ File data kosong');
                }

                await uploadFile(fileData, filename_c, file_c.hapi.headers['content-type']);
                await uploadFileTumb(fileData, filename_c_tumb, file_c.hapi.headers['content-type']);
            }

            if (download_file && download_file.hapi && download_file.hapi.filename) {
                if (oldData.download_file) {
                    try {
                        await deleteFile(oldData.download_file);
                    }
                    catch (err) {
                        console.warn('⚠️ Gagal hapus file lama artikel:', err.message);
                    }
                }

                const ext1 = path.extname(download_file.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename_download = `satupeta/download_file/artikel/${tanggal}_${safeTitle}${ext1}`;

                // ambil buffer
                const fileData = download_file._data;
                if (!fileData) {
                    throw new Error('❌ File data kosong');
                }

                await uploadFile(fileData, filename_download, download_file.hapi.headers['content-type']);
            }

            const updateData = {
                title,
                content_a,
                content_b,
                content_c,
                sumber,
                visibilitas,
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };



            if (filename_a) {
                updateData.images_a = filename_a;
            }

            if (filename_b) {
                updateData.images_b = filename_b;
            }

            if (filename_c) {
                updateData.images_c = filename_c;
            }

            if (filename_download) {
                updateData.download_file = filename_download;
            }

            await Knex('tb_satupeta_artikel').where({ id_artikel }).update(updateData);
            return h.response({ message: 'Berita berhasil diupdate' }).code(201);
        }
        catch (err) {
            console.error('❌ Error saat update artikel:', err);
            return h.response({ msg: 'Gagal update artikel' }).code(500);
        }
    },

    // ============================
    // DELETE BERITA
    // ============================
    delete_artikel: async function (request, h) {
        const id_artikel = request.params.id;

        try {
            const oldData = await Knex('tb_satupeta_artikel').where({ id_artikel }).first();
            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            if (oldData.images_a) {
                try {
                    await deleteFile(oldData.images_a);
                    await deleteFile(`tumb/` + oldData.images_a);
                }
                catch (err) {
                    console.warn('⚠️ Gagal hapus file artikel image a:', err.message);
                }
            }

            if (oldData.images_b) {
                try {
                    await deleteFile(oldData.images_b);
                    await deleteFile(`tumb/` + oldData.images_b);
                }
                catch (err) {
                    console.warn('⚠️ Gagal hapus file artikel image b:', err.message);
                }
            }

            if (oldData.images_c) {
                try {
                    await deleteFile(oldData.images_c);
                    await deleteFile(`tumb/` + oldData.images_c);
                }
                catch (err) {
                    console.warn('⚠️ Gagal hapus file artikel image c:', err.message);
                }
            }

            if (oldData.download_file) {
                try {
                    await deleteFile(oldData.download_file);
                }
                catch (err) {
                    console.warn('⚠️ Gagal hapus file artikel download:', err.message);
                }
            }

            await Knex('tb_satupeta_artikel').where({ id_artikel }).del();
            return h.response({ message: 'Berita berhasil dihapus' }).code(201);
        }
        catch (err) {
            console.error('❌ Error saat hapus artikel:', err);
            return h.response({ msg: 'Gagal hapus artikel' }).code(500);
        }
    },

    add: function (request, h) {

        return Knex('tb_sektor').insert(request.payload)
            .then(() => {

                return null;
            });
    },

    edit_id: function (request, h) {

        const { id } = { ...request.params };

        return Knex('tb_satupeta_locations')
            .update(request.payload)
            .where('tb_satupeta_locations.id_location', id)
            .then(() => {

                return null;
            });
    },

    delete_id: function (request, h) {

        const { id } = { ...request.params };

        return Knex('tb_satupeta_locations')
            .where('tb_satupeta_locations.id_location', id)
            .del()
            .then(() => {

                return null;
            });
    }




};
