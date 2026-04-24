/* eslint-disable @hapi/scope-start */
'use strict';

const Knex = require('../../../database');
const { generatePresignedUrl,uploadFile,deleteFile, uploadFileTumb } = require('../../../utils/s3Client'); // path ke helper baru

const path = require('path');

const moment = require('moment');
const { log } = require('console');



const internals_bidangurusan = {
    sqlBaseView: Knex.select('*').from('tb_sektor')
};

const internals_artikel = {
    sqlBaseView: Knex.select('*').from('tb_opendata_artikel')
};
const internals_dataset_permohonan = {
    sqlBaseView: Knex.select('*').from('tb_opendata_dataset_permohonan')
};
const internals_dataset_permohonan_tiket = {
    sqlBaseView: Knex.select('*').from('tb_opendata_dataset_permohonan_tiket')
};
const internals_infografik = {
    sqlBaseView: Knex.select('*').from('tb_opendata_infografik')
};

const sanitizeFileName = (name) => {
    return name
        .replace(/[^a-zA-Z0-9._-]/g, '_') // hanya huruf, angka, titik, underscore, dash
        .substring(0, 100); // batasi panjang supaya aman
};


module.exports = {

    view_dataset_top: async function (request, h) {


        try {
            const sql = Knex('tb_opendata_dataset_visitors')
                .select('id_dataset')
                .count('* as count_dataset')
                .groupBy('id_dataset')
                .orderBy('count_dataset', 'desc');
            const datas = await sql;


            return h.response(datas).code(200);
        }
        catch (err) {
            console.error('❌ Error in view_dataset:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },


    view_id: async function (request, h) {
        try {
            const { id } = request.params;


            const dataCountRaw = await Knex('tb_opendata_dataset_visitors')
                .where('id_dataset', id)
                .count('id as count_datasetvisitor')
                .first();

            // kalau kosong, isi default 0
            const dataCount = dataCountRaw ? parseInt(dataCountRaw.count_datasetvisitor, 10) : 0;
            //console.log('dataCountRaw 👉', id);
            const dataCountRawDownload = await Knex('tb_opendata_dataset_download')
                .where('id_dataset', id)
                .count('id as count_datasetdownload')
                .first();

            // kalau kosong, isi default 0
            const dataCountDownload = dataCountRawDownload ? parseInt(dataCountRawDownload.count_datasetdownload, 10) : 0;
            //console.log('dataCountRaw 👉', dataCountRaw);

            return h.response({
                //data: plainItem,
                datacount: dataCount,
                datacountdownload: dataCountDownload
            }).code(200);
        }
        catch (err) {
            console.error('Error in view_id:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },



    add_dataset_visitor: async function (request, h) {
        const { id_dataset } = request.payload;
        //const titleAsText = decodeURIComponent(id_dataset).replace(/-/g, ' ');
        const ip = request.info.remoteAddress;
        const userAgent = request.headers['user-agent'];
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD


        try {
            /* const data = await Knex('tb_opendata_dataset')
                .whereRaw('LOWER(nama_dataset) LIKE ?', [`%${titleAsText.toLowerCase()}%`])
                .first();

            if (!data) {
                return h.response({ message: 'Data not found' }).code(404);
            }

            console.log('id dataset : ' + data.id_dataset); */

            const exists = await Knex('tb_opendata_dataset_visitors')
                .where('id_dataset', id_dataset)
                .andWhere('ip_address', ip)
                .andWhereRaw(`DATE(visited_at) = ?`, [today])
                .first();

            if (!exists) {
                await Knex('tb_opendata_dataset_visitors').insert({
                    id_dataset,
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

    add_dataset_download: async function (request, h) {
        const { id_dataset } = request.payload;
        //const titleAsText = decodeURIComponent(id_dataset).replace(/-/g, ' ');
        const ip = request.info.remoteAddress;
        const userAgent = request.headers['user-agent'];
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD


        try {
            /* const data = await Knex('tb_opendata_dataset')
                .whereRaw('LOWER(nama_dataset) LIKE ?', [`%${titleAsText.toLowerCase()}%`])
                .first();

            if (!data) {
                return h.response({ message: 'Data not found' }).code(404);
            }

            console.log('id dataset : ' + data.id_dataset); */

            const exists = await Knex('tb_opendata_dataset_download')
                .where('id_dataset', id_dataset)
                .andWhere('ip_address', ip)
                .andWhereRaw(`DATE(visited_at) = ?`, [today])
                .first();

            if (!exists) {
                await Knex('tb_opendata_dataset_download').insert({
                    id_dataset,
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

    view_opendata_permohonan_cek_tiket: async function (request, h) {
        try {
            const { nomor } = request.params;


            const exists = await request.knex('tb_opendata_dataset_permohonan')
                .where('nomor_tiket', nomor)
                .first();

            return h.response({ exists: !!exists }).code(200);
        }
        catch (err) {
            console.error('Error in view_id:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    view_opendata_permohonan_tiket: async function (request, h) {
        try {
            const { nomor_tiket, email } = request.query;


            // Cek data berdasarkan nomor_tiket & email
            const record = await Knex('tb_opendata_dataset_permohonan')
                .where({ nomor_tiket, email })
                .first();

            // Jika data tidak ditemukan
            if (!record) {
                console.log('⚠️ Data tidak ditemukan untuk tiket/email ini');
                return h
                    .response({
                        exists: false,
                        message: 'Nomor tiket atau email tidak ditemukan.',
                        data: null
                    })
                    .code(200); // tetap 200 agar frontend bisa handle tanpa error
            }

            // Jika data ditemukan
            console.log('✅ Data ditemukan:', record);
            return h
                .response({
                    exists: true,
                    message: 'Data ditemukan.',
                    data: record
                })
                .code(200);

        }
        catch (err) {
            console.error('❌ Error di view_opendata_permohonan_tiket:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    view_opendata_permohonan_tiket_cek: async function (request, h) {
        try {
            const { nomor } = request.params;

            // Ambil 1 data permohonan berdasarkan nomor_tiket
            const permohonan = await Knex('tb_opendata_dataset_permohonan')
                .leftJoin('tb_opd', 'tb_opendata_dataset_permohonan.opd', '=', 'tb_opd.id_opd')
                .select('tb_opendata_dataset_permohonan.*', 'tb_opd.nama_opd as nama_opd')
                .where('nomor_tiket', nomor)
                .first();

            // Ambil semua tiket terkait
            const permohonan_tiket = await Knex('tb_opendata_dataset_permohonan_tiket')
                .where('nomor_tiket', nomor)
                .select('*')
                .orderBy('updated_at', 'desc');
                //.groupBy('nomor_tiket');

            // Jika data permohonan tidak ditemukan
            if (!permohonan) {
                return h
                    .response({
                        msg: 'Data permohonan tidak ditemukan',
                        permohonan: null,
                        permohonan_tiket: []
                    })
                    .code(404);
            }

            // Pastikan hasil tiket selalu berupa array
            const tiketData = Array.isArray(permohonan_tiket)
                ? permohonan_tiket
                : [];

            return h
                .response({
                    permohonan,
                    permohonan_tiket: tiketData
                })
                .code(200);
        }
        catch (err) {
            console.error('Error in view_opendata_permohonan_tiket_cek:', err);
            return h
                .response({
                    msg: 'Terjadi kesalahan server',
                    permohonan: null,
                    permohonan_tiket: []
                })
                .code(500);
        }
    },

    view_opendata_permohonan: async function (request, h) {
        try {
            const { page = 1, limit = 10, search_kunci = '' } = request.query;
            const offset = (page - 1) * limit;

            // 🔹 Filter pencarian
            let query = Knex('tb_opendata_dataset_permohonan');
            query = query.orderBy('updated_at', 'desc');
            if (search_kunci) {
                query = query
                    .where('nomor_tiket', 'like', `%${search_kunci}%`)
                    .orWhere('nama_lengkap', 'like', `%${search_kunci}%`);
            }

            // 🔹 Ambil data dan total
            const [rows, [{ count }]] = await Promise.all([
                query.clone().offset(offset).limit(limit),
                query.clone().count({ count: '*' })
            ]);

            // 🔹 Konversi data ke bentuk plain object
            const data = rows.map((item) => (item.toJSON ? item.toJSON() : { ...item }));

            const total = parseInt(count, 10);
            const totalPages = Math.ceil(total / limit);


            // 🔹 Response akhir
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
            console.error('❌ Error in view_opendata_permohonan:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    view_opendata_permohonan_detail: async function (request, h) {
        try {
            const { id } = request.params;
            // Decode URL dan ubah tanda minus jadi spasi
            //const titleAsText = decodeURIComponent(title).replace(/-/g, ' ');

            const sql = internals_dataset_permohonan.sqlBaseView.clone();

            const data = await sql
                //.whereRaw('LOWER(title) LIKE ?', [`%${titleAsText.toLowerCase()}%`])
                .where('id_permohonan', id)
                .first();

            if (!data) {
                return h.response({ message: 'Data tidak ditemukan' }).code(404);
            }

            const sql2 = internals_dataset_permohonan_tiket.sqlBaseView.clone();
            const data2 = await sql2
                //.whereRaw('LOWER(title) LIKE ?', [`%${titleAsText.toLowerCase()}%`])
                .where('nomor_tiket', data.nomor_tiket)
                .orderBy('updated_at', 'desc');

            const updateData = {
                status: 'Read'
            };



            await Knex('tb_opendata_dataset_permohonan_tiket').where('nomor_tiket', data.nomor_tiket).update(updateData);

            return h.response({
                permohonan: data,
                tiket: data2
            }).code(200);
        }
        catch (err) {
            console.error('❌ Error in view_opendata_permohonan_detail:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    view_opendata_permohonan_detail_jumlah: async function (request, h) {
        try {
            const { id } = request.params;
            // Decode URL dan ubah tanda minus jadi spasi
            //const titleAsText = decodeURIComponent(title).replace(/-/g, ' ');

            const sql = internals_dataset_permohonan.sqlBaseView.clone();

            const data = await sql
                //.whereRaw('LOWER(title) LIKE ?', [`%${titleAsText.toLowerCase()}%`])
                .where('id_permohonan', id)
                .first();

            if (!data) {
                return h.response({ message: 'Data tidak ditemukan' }).code(404);
            }

            const sql2 = internals_dataset_permohonan_tiket.sqlBaseView.clone();
            const data2 = await sql2
                //.whereRaw('LOWER(title) LIKE ?', [`%${titleAsText.toLowerCase()}%`])
                .where('nomor_tiket', data.nomor_tiket)
                .whereNot('status','Read')
                .orderBy('updated_at', 'desc');


            return h.response({
                tiket: data2
            }).code(200);
        }
        catch (err) {
            console.error('❌ Error in view_opendata_permohonan_detail_jumlah:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },





    add_opendata_permohonan: async function (request, h) {
        const {
            nomor_tiket,nama,telpon, email, pekerjaan, instansi, bidangusaha, bidangilmu, jabatan, judul, penghasil, opd, tujuan, dihubungi, deskripsi
        } = request.payload;


        const ip = request.info.remoteAddress;
        const userAgent = request.headers['user-agent'];
        const tanggal = moment().format('YYYY-MM-DD HH:mm:ss');

        try {
            // Simpan metadata ke database
            await Knex('tb_opendata_dataset_permohonan').insert({
                nomor_tiket,
                nama_lengkap: nama,
                telpon,
                email,
                pekerjaan,
                instansi,
                bidang_usaha: bidangusaha,
                bidang_ilmu: bidangilmu,
                jabatan,
                judul,
                paham_opd: penghasil,
                opd,
                deskripsi,
                tujuan,
                dihubungi,
                status: 'Proses',
                created_at: tanggal || moment().format('YYYY-MM-DD HH:mm:ss'),
                updated_at: tanggal || moment().format('YYYY-MM-DD HH:mm:ss')
            });

            return h.response({ message: 'Feedback berhasil Dikirim' }).code(201);
        }
        catch (err) {
            console.error('Error saat upload atau insert:', err);
            return h.response({ msg: 'Gagal Dikirim' }).code(500);
        }
    },

    add_opendata_permohonan_tiket: async function (request, h) {
        const {
            nomor_tiket,from,to, pesan,status,admin,jenis,komponen
        } = request.payload;


        const ip = request.info.remoteAddress;
        const userAgent = request.headers['user-agent'];
        const tanggal = moment().format('YYYY-MM-DD HH:mm:ss');

        if (pesan === '') {
            return h.response({ msg: 'Pesan belum dituliskan' }).code(500);
        }

        if (status === null) {
            return h.response({ msg: 'Status belum dituliskan' }).code(500);
        }

        try {
            // Simpan metadata ke database
            await Knex('tb_opendata_dataset_permohonan_tiket').insert({
                nomor_tiket,
                from,
                to,
                pesan,
                status,
                created_at: tanggal || moment().format('YYYY-MM-DD HH:mm:ss'),
                updated_at: tanggal || moment().format('YYYY-MM-DD HH:mm:ss')
            });

            if (status === 'Selesai') {
                const updateData = {
                    status: 'Selesai'
                };



                await Knex('tb_opendata_dataset_permohonan').where('nomor_tiket', nomor_tiket).update(updateData);
            }

            await Knex('tb_logging').insert({
                jenis,
                kategori: komponen,
                item: nomor_tiket,
                deskripsi: 'Balas permohonan tiket dari netizen',
                admin,
                created_at: tanggal || moment().format('YYYY-MM-DD HH:mm:ss'),
                updated_at: tanggal || moment().format('YYYY-MM-DD HH:mm:ss')
            });


            return h.response({ msg: 'Pesan berhasil Dikirim' }).code(201);
        }
        catch (err) {
            console.error('Error saat upload atau insert:', err);
            return h.response({ msg: 'Gagal Dikirim' }).code(500);
        }
    },




    // ============================
    // VIEW ARTIKEL
    // ============================
    view_list_artikel: async function (request, h) {
        try {
            const { page = 1, limit = 10, search_kunci = '' } = request.query;
            const offset = (page - 1) * limit;

            // filter pencarian
            let query = Knex('tb_opendata_artikel');
            query = query.orderBy('updated_at', 'desc');
            if (search_kunci) {
                query = query.where('title', 'like', `%${search_kunci}%`);
            }

            query.where('visibilitas', `Publik`);

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
                    plainItem.presignedUrl_download_file = item.download_file
                        ? await generatePresignedUrl(item.download_file)
                        : null;
                    plainItem.presignedUrl_a_tumb = item.images_a
                        ? await generatePresignedUrl(`tumb/` + item.images_a)
                        : null;
                    plainItem.presignedUrl_b_tumb = item.images_b
                        ? await generatePresignedUrl(`tumb/` + item.images_b)
                        : null;
                    plainItem.presignedUrl_c_tumb = item.images_c
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
                    plainItem.presignedUrl_a_tumb = null;
                    plainItem.presignedUrl_b_tumb = null;
                    plainItem.presignedUrl_c_tumb = null;
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
            sql.join('tb_users', 'tb_opendata_artikel.admin', '=', 'tb_users.id');
            sql.select(
                'tb_opendata_artikel.*',
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
                    }
                    catch (err) {
                        console.warn(`⚠️ Gagal generate URL untuk ${key}:`, err.message);
                        plainItem[urlKey] = null;
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

    view_list_artikel_admin: async function (request, h) {
        try {
            const { page = 1, limit = 10, search_kunci = '' } = request.query;
            const offset = (page - 1) * limit;

            // filter pencarian
            let query = Knex('tb_opendata_artikel');
            query = query.orderBy('updated_at', 'desc');
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
                    plainItem.presignedUrl_download_file = item.download_file
                        ? await generatePresignedUrl(item.download_file)
                        : null;
                    plainItem.presignedUrl_a_tumb = item.images_a
                        ? await generatePresignedUrl(`tumb/` + item.images_a)
                        : null;
                    plainItem.presignedUrl_b_tumb = item.images_b
                        ? await generatePresignedUrl(`tumb/` + item.images_b)
                        : null;
                    plainItem.presignedUrl_c_tumb = item.images_c
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
                    plainItem.presignedUrl_a_tumb = null;
                    plainItem.presignedUrl_b_tumb = null;
                    plainItem.presignedUrl_c_tumb = null;
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

    view_list_artikel_detail_admin: async function (request, h) {
        try {
            const { id_artikel } = request.params;
            // Decode URL dan ubah tanda minus jadi spasi
            //const titleAsText = decodeURIComponent(title).replace(/-/g, ' ');

            const sql = internals_artikel.sqlBaseView.clone();
            sql.join('tb_users', 'tb_opendata_artikel.admin', '=', 'tb_users.id');
            sql.select(
                'tb_opendata_artikel.*',
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
                    }
                    catch (err) {
                        console.warn(`⚠️ Gagal generate URL untuk ${key}:`, err.message);
                        plainItem[urlKey] = null;
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
    // ADD artikel
    // ============================
    add_artikel: async function (request, h) {
        const { title, content_a,content_b,content_c,sumber,  visibilitas,admin,jenis,komponen } = request.payload;
        const file_a = request.payload.file_a;
        const file_b = request.payload.file_b;
        const file_c = request.payload.file_c;
        const download_file = request.payload.download_file;
        const tanggal = moment().format('YYYY-MM-DD HH:mm:ss');
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
                filename_a = `opendata/artikel/${tanggal}_${safeTitle}_a${ext1}`;
                filename_a_tumb = `tumb/opendata/artikel/${tanggal}_${safeTitle}_a${ext1}`;

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
                filename_b = `opendata/artikel/${tanggal}_${safeTitle}_b${ext1}`;
                filename_b_tumb = `tumb/opendata/artikel/${tanggal}_${safeTitle}_b${ext1}`;

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
                filename_c = `opendata/artikel/${tanggal}_${safeTitle}_c${ext1}`;
                filename_c_tumb = `tumb/opendata/artikel/${tanggal}_${safeTitle}_c${ext1}`;

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
                filename_download = `opendata/download_file/artikel/${tanggal}_${safeTitle}${ext1}`;

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

            await Knex('tb_opendata_artikel').insert(updateData);
            await Knex('tb_logging').insert({
                jenis,
                kategori: komponen,
                item: title,
                deskripsi: 'Tambah data Artikel aplikasi Open Data',
                admin,
                created_at: tanggal || moment().format('YYYY-MM-DD HH:mm:ss'),
                updated_at: tanggal || moment().format('YYYY-MM-DD HH:mm:ss')
            });
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
        const { title, content_a,content_b,content_c, sumber, visibilitas,admin,jenis,komponen } = request.payload;
        const file_a = request.payload.file_a;
        const file_b = request.payload.file_b;
        const file_c = request.payload.file_c;
        const download_file = request.payload.download_file;
        const tanggal = moment().format('YYYY-MM-DD HH:mm:ss');
        let filename_a = null;
        let filename_b = null;
        let filename_c = null;
        let filename_a_tumb = null;
        let filename_b_tumb = null;
        let filename_c_tumb = null;
        let filename_download = null;

        try {
            const oldData = await Knex('tb_opendata_artikel').where({ id_artikel }).first();
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
                filename_a = `opendata/artikel/${tanggal}_${safeTitle}_a${ext1}`;
                filename_a_tumb = `tumb/opendata/artikel/${tanggal}_${safeTitle}_a${ext1}`;

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
                filename_b = `opendata/artikel/${tanggal}_${safeTitle}_b${ext1}`;
                filename_b_tumb = `tumb/opendata/artikel/${tanggal}_${safeTitle}_b${ext1}`;

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
                filename_c = `opendata/artikel/${tanggal}_${safeTitle}_c${ext1}`;
                filename_c_tumb = `tumb/opendata/artikel/${tanggal}_${safeTitle}_c${ext1}`;

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
                filename_download = `opendata/download_file/artikel/${tanggal}_${safeTitle}${ext1}`;

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
                admin,
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

            await Knex('tb_opendata_artikel').where({ id_artikel }).update(updateData);
            await Knex('tb_logging').insert({
                jenis,
                kategori: komponen,
                item: title,
                deskripsi: 'Update data Artikel aplikasi Open Data',
                admin,
                created_at: tanggal || moment().format('YYYY-MM-DD HH:mm:ss'),
                updated_at: tanggal || moment().format('YYYY-MM-DD HH:mm:ss')
            });
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
        const { admin,jenis,komponen } = request.payload;
        const tanggal = moment().format('YYYY-MM-DD HH:mm:ss');

        try {
            const oldData = await Knex('tb_opendata_artikel').where({ id_artikel }).first();
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

            await Knex('tb_opendata_artikel').where({ id_artikel }).del();
            await Knex('tb_logging').insert({
                jenis,
                kategori: komponen,
                item: oldData.title,
                deskripsi: 'Delete data Artikel aplikasi Open Data',
                admin,
                created_at: tanggal || moment().format('YYYY-MM-DD HH:mm:ss'),
                updated_at: tanggal || moment().format('YYYY-MM-DD HH:mm:ss')
            });
            return h.response({ message: 'Berita berhasil dihapus' }).code(201);
        }
        catch (err) {
            console.error('❌ Error saat hapus artikel:', err);
            return h.response({ msg: 'Gagal hapus artikel' }).code(500);
        }
    },

    // ============================
    // VIEW Infografik
    // ============================
    view_list_infografik: async function (request, h) {
        try {

            const { page = 1, limit = 10, search_kunci = '', search_dimensi = '', search_penyusun = '' } = request.query;

            const pageNum = Number(page) || 1;
            const limitNum = Number(limit) || 10;
            const offset = (pageNum - 1) * limitNum;

            // QUERY UTAMA LIST DATA
            const query = Knex('tb_opendata_infografik')
                .leftJoin('tb_sektor', 'tb_opendata_infografik.topik', '=', 'tb_sektor.id_sektor')
                .select(
                    'tb_opendata_infografik.id_infografik',
                    'tb_opendata_infografik.title',
                    'tb_opendata_infografik.sub_title',
                    'tb_opendata_infografik.content',
                    'tb_opendata_infografik.images_a',
                    'tb_opendata_infografik.images_b',
                    'tb_opendata_infografik.images_c',
                    'tb_opendata_infografik.images_d',
                    'tb_opendata_infografik.penyusun',
                    'tb_opendata_infografik.updated_at',
                    'tb_sektor.nama_sektor as nama_topik'
                )
                .where('tb_opendata_infografik.visibilitas', 'Publik')
                .orderBy('tb_opendata_infografik.updated_at', 'desc');


            // FILTER
            if (search_kunci) {
                query.whereRaw('LOWER(tb_opendata_infografik.title) LIKE LOWER(?)', [`%${search_kunci}%`]);
            }

            if (search_dimensi) {
                query.where('tb_opendata_infografik.topik', search_dimensi);
            }

            if (search_penyusun) {
                query.whereRaw('LOWER(tb_opendata_infografik.penyusun) LIKE LOWER(?)', [`%${search_penyusun}%`]);
            }


            // ===============================
            //       FIX COUNT MARIA DB
            // ===============================
            const countQuery = Knex('tb_opendata_infografik')
                .where('visibilitas', 'Publik')
                .modify((q) => {
                    if (search_kunci) {
                        q.whereRaw('LOWER(title) LIKE LOWER(?)', [`%${search_kunci}%`]);
                    }

                    if (search_dimensi) {
                        q.where('topik', search_dimensi);
                    }

                    if (search_penyusun) {
                        q.whereRaw('LOWER(penyusun) LIKE LOWER(?)', [`%${search_penyusun}%`]);
                    }
                })
                .count('* as count');   // ← FIX WAJIB UNTUK MARIA DB


            // JALANKAN QUERY + COUNT
            const [rows, countResult] = await Promise.all([
                query.clone().offset(offset).limit(limitNum),
                countQuery
            ]);


            const total = parseInt(countResult?.[0]?.count ?? 0, 10);
            const totalPages = Math.ceil(total / limitNum);


            // presigned URL
            const data = await Promise.all(
                rows.map(async (item) => {
                    const plainItem = { ...item };
                    try {
                        plainItem.presignedUrl_a = item.images_a ? await generatePresignedUrl(item.images_a) : null;
                        plainItem.presignedUrl_b = item.images_b ? await generatePresignedUrl(item.images_b) : null;
                        plainItem.presignedUrl_c = item.images_c ? await generatePresignedUrl(item.images_c) : null;
                        plainItem.presignedUrl_d = item.images_d ? await generatePresignedUrl(item.images_d) : null;

                        plainItem.presignedUrl_a_tumb = item.images_a ? await generatePresignedUrl(`tumb/${item.images_a}`) : null;
                        plainItem.presignedUrl_b_tumb = item.images_b ? await generatePresignedUrl(`tumb/${item.images_b}`) : null;
                        plainItem.presignedUrl_c_tumb = item.images_c ? await generatePresignedUrl(`tumb/${item.images_c}`) : null;
                        plainItem.presignedUrl_d_tumb = item.images_d ? await generatePresignedUrl(`tumb/${item.images_d}`) : null;
                    }
                    catch {
                        plainItem.presignedUrl_a = null;
                        plainItem.presignedUrl_b = null;
                        plainItem.presignedUrl_c = null;
                        plainItem.presignedUrl_d = null;
                        plainItem.presignedUrl_a_tumb = null;
                        plainItem.presignedUrl_b_tumb = null;
                        plainItem.presignedUrl_c_tumb = null;
                        plainItem.presignedUrl_d_tumb = null;
                    }

                    return plainItem;
                })
            );


            return h.response({
                data,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages
                }
            }).code(200);


        }
        catch (err) {
            console.error('❌ Error in view_list_infografik:', err);
            return h.response({ message: err }).code(500);
        }
    },

    view_list_infografik_penyusun: async function (request, h) {
        try {

            // ambil daftar penyusun (tidak ada masalah)
            const data_penyusun = await Knex('tb_opendata_infografik')
                .select('penyusun')
                .groupBy('penyusun')
                .orderBy('penyusun', 'asc');





            return h.response({
                data_penyusun

            }).code(200);


        }
        catch (err) {
            console.error('❌ Error in view_list_infografik:', err);
            return h.response({ message: err }).code(500);
        }
    },
    view_list_infografik_admin: async function (request, h) {
        try {

            // Pagination
            const { page = 1, limit = 10 } = request.query;

            const pageNum = Number(page) || 1;
            const limitNum = Number(limit) || 10;
            const offset = (pageNum - 1) * limitNum;

            // Query utama
            const query = Knex('tb_opendata_infografik')
                .leftJoin('tb_sektor', 'tb_opendata_infografik.topik', '=', 'tb_sektor.id_sektor')
                .select(
                    'tb_opendata_infografik.id_infografik',
                    'tb_opendata_infografik.title',
                    'tb_opendata_infografik.sub_title',
                    'tb_opendata_infografik.content',
                    'tb_opendata_infografik.images_a',
                    'tb_opendata_infografik.images_b',
                    'tb_opendata_infografik.images_c',
                    'tb_opendata_infografik.images_d',
                    'tb_opendata_infografik.penyusun',
                    'tb_opendata_infografik.visibilitas',
                    'tb_opendata_infografik.updated_at',
                    'tb_sektor.nama_sektor as nama_topik'
                )
                .orderBy('tb_opendata_infografik.updated_at', 'desc');

            // ============================
            //   FIX COUNT MARIA DB
            // ============================
            const countQuery = Knex('tb_opendata_infografik')
                .count('* as count');   // ← WAJIB untuk MariaDB


            // Jalankan paralel
            const [rows, countResult] = await Promise.all([
                query.clone().offset(offset).limit(limitNum),
                countQuery
            ]);

            const total = parseInt(countResult?.[0]?.count ?? 0, 10);
            const totalPages = Math.ceil(total / limitNum);

            // Generate presigned URLs
            const data = await Promise.all(
                rows.map(async (item) => {
                    const plainItem = { ...item };
                    try {
                        plainItem.presignedUrl_a = item.images_a ? await generatePresignedUrl(item.images_a) : null;
                        plainItem.presignedUrl_b = item.images_b ? await generatePresignedUrl(item.images_b) : null;
                        plainItem.presignedUrl_c = item.images_c ? await generatePresignedUrl(item.images_c) : null;
                        plainItem.presignedUrl_d = item.images_d ? await generatePresignedUrl(item.images_d) : null;

                        plainItem.presignedUrl_a_tumb = item.images_a ? await generatePresignedUrl(`tumb/${item.images_a}`) : null;
                        plainItem.presignedUrl_b_tumb = item.images_b ? await generatePresignedUrl(`tumb/${item.images_b}`) : null;
                        plainItem.presignedUrl_c_tumb = item.images_c ? await generatePresignedUrl(`tumb/${item.images_c}`) : null;
                        plainItem.presignedUrl_d_tumb = item.images_d ? await generatePresignedUrl(`tumb/${item.images_d}`) : null;
                    }
                    catch {
                        plainItem.presignedUrl_a = null;
                        plainItem.presignedUrl_b = null;
                        plainItem.presignedUrl_c = null;
                        plainItem.presignedUrl_d = null;

                        plainItem.presignedUrl_a_tumb = null;
                        plainItem.presignedUrl_b_tumb = null;
                        plainItem.presignedUrl_c_tumb = null;
                        plainItem.presignedUrl_d_tumb = null;
                    }

                    return plainItem;
                })
            );

            // Response
            return h.response({
                data,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages
                }
            }).code(200);

        }
        catch (err) {
            console.error('❌ Error in view_list_infografik_admin:', err);
            return h.response({ message: err }).code(500);
        }
    },






    view_list_infografik_detail: async function (request, h) {
        try {
            const { title } = request.params;
            // Decode URL dan ubah tanda minus jadi spasi
            const titleAsText = decodeURIComponent(title).replace(/-/g, ' ');

            const sql = internals_infografik.sqlBaseView.clone();
            sql.join('tb_users', 'tb_opendata_infografik.admin', '=', 'tb_users.id');
            sql.join('tb_sektor', 'tb_opendata_infografik.topik', '=', 'tb_sektor.id_sektor');
            sql.select(
                'tb_opendata_infografik.*',
                'tb_users.nick as nick_admin',
                'tb_sektor.nama_sektor as nama_topik'
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
                { key: 'images_d', urlKey: 'presignedUrl_d' }
            ];

            for (const { key, urlKey } of fileFields) {
                if (data[key]) {
                    try {
                        plainItem[urlKey] = await generatePresignedUrl(data[key]);
                    }
                    catch (err) {
                        console.warn(`⚠️ Gagal generate URL untuk ${key}:`, err.message);
                        plainItem[urlKey] = null;
                    }
                }
            }

            return h.response(plainItem).code(200);
        }
        catch (err) {
            console.error('❌ Error in view_list_infografik_detail:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    view_list_infografik_detail_admin: async function (request, h) {
        try {
            const { id_infografik } = request.params;
            // Decode URL dan ubah tanda minus jadi spasi
            //const titleAsText = decodeURIComponent(title).replace(/-/g, ' ');

            const sql = internals_infografik.sqlBaseView.clone();
            sql.leftJoin('tb_users', 'tb_opendata_infografik.admin', '=', 'tb_users.id');
            sql.leftJoin('tb_sektor', 'tb_opendata_infografik.topik', '=', 'tb_sektor.id_sektor');
            sql.select(
                'tb_opendata_infografik.*',
                'tb_users.nick as nick_admin',
                'tb_sektor.nama_sektor as nama_sektor',
                'tb_sektor.id_sektor as id_sektor'
            );

            const data = await sql
                .where('id_infografik', id_infografik)
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
                { key: 'images_d', urlKey: 'presignedUrl_d' }
            ];

            for (const { key, urlKey } of fileFields) {
                if (data[key]) {
                    try {
                        plainItem[urlKey] = await generatePresignedUrl(data[key]);
                    }
                    catch (err) {
                        console.warn(`⚠️ Gagal generate URL untuk ${key}:`, err.message);
                        plainItem[urlKey] = null;
                    }
                }
            }

            return h.response(plainItem).code(200);
        }
        catch (err) {
            console.error('❌ Error in view_list_infografik_detail:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    // ============================
    // ADD infografik
    // ============================
    add_infografik: async function (request, h) {
        const { topik,title,sub_title, content,penyusun,  visibilitas,admin,jenis,komponen } = request.payload;
        const file_a = request.payload.file_a;
        const file_b = request.payload.file_b;
        const file_c = request.payload.file_c;
        const file_d = request.payload.file_d;
        const tanggal = moment().format('YYYY-MM-DD HH:mm:ss');
        let filename_a = null;
        let filename_b = null;
        let filename_c = null;
        let filename_d = null;
        let filename_a_tumb = null;
        let filename_b_tumb = null;
        let filename_c_tumb = null;
        let filename_d_tumb = null;

        try {


            if (file_a && file_a.hapi && file_a.hapi.filename) {
                const ext1 = path.extname(file_a.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename_a = `opendata/infografik/${tanggal}_${safeTitle}_a${ext1}`;
                filename_a_tumb = `tumb/opendata/infografik/${tanggal}_${safeTitle}_a${ext1}`;

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
                filename_b = `opendata/infografik/${tanggal}_${safeTitle}_b${ext1}`;
                filename_b_tumb = `tumb/opendata/infografik/${tanggal}_${safeTitle}_b${ext1}`;

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
                filename_c = `opendata/infografik/${tanggal}_${safeTitle}_c${ext1}`;
                filename_c_tumb = `tumb/opendata/infografik/${tanggal}_${safeTitle}_c${ext1}`;

                // ambil buffer
                const fileData = file_c._data;
                if (!fileData) {
                    throw new Error('❌ File data kosong');
                }

                await uploadFile(fileData, filename_c, file_c.hapi.headers['content-type']);
                await uploadFileTumb(fileData, filename_c_tumb, file_c.hapi.headers['content-type']);
            }

            if (file_d && file_d.hapi && file_d.hapi.filename) {
                const ext1 = path.extname(file_d.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename_d = `opendata/infografik/${tanggal}_${safeTitle}_d${ext1}`;
                filename_d_tumb = `tumb/opendata/infografik/${tanggal}_${safeTitle}_d${ext1}`;

                // ambil buffer
                const fileData = file_d._data;
                if (!fileData) {
                    throw new Error('❌ File data kosong');
                }

                await uploadFile(fileData, filename_d, file_d.hapi.headers['content-type']);
                await uploadFileTumb(fileData, filename_d_tumb, file_d.hapi.headers['content-type']);
            }


            const updateData = {
                topik,
                title,
                sub_title,
                content,
                admin,
                penyusun,
                visibilitas,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
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

            if (filename_d) {
                updateData.images_d = filename_d;
            }


            await Knex('tb_opendata_infografik').insert(updateData);
            await Knex('tb_logging').insert({
                jenis,
                kategori: komponen,
                item: title,
                deskripsi: 'Tambah data Infografik aplikasi Open Data',
                admin,
                created_at: tanggal || moment().format('YYYY-MM-DD HH:mm:ss'),
                updated_at: tanggal || moment().format('YYYY-MM-DD HH:mm:ss')
            });
            return h.response({ message: 'Berita berhasil ditambahkan' }).code(201);
        }
        catch (err) {
            console.error('❌ Error saat tambah infografik:', err);
            return h.response({ msg: 'Gagal menyimpan infografik' }).code(500);
        }
    },

    // ============================
    // UPDATE BERITA
    // ============================
    update_infografik: async function (request, h) {
        const id_infografik = request.params.id;
        //console.log('id_infografik :',id_infografik);

        const { topik,title,sub_title, content,penyusun,  visibilitas,admin,jenis,komponen } = request.payload;
        const file_a = request.payload.file_a;
        const file_b = request.payload.file_b;
        const file_c = request.payload.file_c;
        const file_d = request.payload.file_d;
        const tanggal = moment().format('YYYY-MM-DD HH:mm:ss');
        let filename_a = null;
        let filename_b = null;
        let filename_c = null;
        let filename_d = null;
        let filename_a_tumb = null;
        let filename_b_tumb = null;
        let filename_c_tumb = null;
        let filename_d_tumb = null;

        try {
            const oldData = await Knex('tb_opendata_infografik').where({ id_infografik }).first();
            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            //console.log('id_infografik', id_infografik);


            if (file_a && file_a.hapi && file_a.hapi.filename) {
                if (oldData.images_a) {
                    try {
                        await deleteFile(oldData.images_a);
                        await deleteFile(`tumb/` + oldData.images_a);
                    }
                    catch (err) {
                        console.warn('⚠️ Gagal hapus file lama infografik:', err.message);
                    }
                }

                const ext1 = path.extname(file_a.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename_a = `opendata/infografik/${tanggal}_${safeTitle}_a${ext1}`;
                filename_a_tumb = `tumb/opendata/infografik/${tanggal}_${safeTitle}_a${ext1}`;

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
                        console.warn('⚠️ Gagal hapus file lama infografik:', err.message);
                    }
                }

                const ext1 = path.extname(file_b.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename_b = `opendata/infografik/${tanggal}_${safeTitle}_b${ext1}`;
                filename_b_tumb = `tumb/opendata/infografik/${tanggal}_${safeTitle}_b${ext1}`;

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
                        console.warn('⚠️ Gagal hapus file lama infografik:', err.message);
                    }
                }

                const ext1 = path.extname(file_c.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename_c = `opendata/infografik/${tanggal}_${safeTitle}_c${ext1}`;
                filename_c_tumb = `tumb/opendata/infografik/${tanggal}_${safeTitle}_c${ext1}`;

                // ambil buffer
                const fileData = file_c._data;
                if (!fileData) {
                    throw new Error('❌ File data kosong');
                }

                await uploadFile(fileData, filename_c, file_c.hapi.headers['content-type']);
                await uploadFileTumb(fileData, filename_c_tumb, file_c.hapi.headers['content-type']);
            }

            if (file_d && file_d.hapi && file_d.hapi.filename) {
                if (oldData.images_d) {
                    try {
                        await deleteFile(oldData.images_d);
                        await deleteFile(`tumb/` + oldData.images_d);
                    }
                    catch (err) {
                        console.warn('⚠️ Gagal hapus file lama infografik:', err.message);
                    }
                }

                const ext1 = path.extname(file_d.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename_d = `opendata/infografik/${tanggal}_${safeTitle}_d${ext1}`;
                filename_d_tumb = `tumb/opendata/infografik/${tanggal}_${safeTitle}_d${ext1}`;

                // ambil buffer
                const fileData = file_d._data;
                if (!fileData) {
                    throw new Error('❌ File data kosong');
                }

                await uploadFile(fileData, filename_d, file_d.hapi.headers['content-type']);
                await uploadFileTumb(fileData, filename_d_tumb, file_d.hapi.headers['content-type']);
            }


            const updateData = {
                topik,
                title,
                sub_title,
                content,
                admin,
                penyusun,
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


            if (filename_d) {
                updateData.images_d = filename_d;
            }

            await Knex('tb_opendata_infografik').where({ id_infografik }).update(updateData);
            await Knex('tb_logging').insert({
                jenis,
                kategori: komponen,
                item: title,
                deskripsi: 'Update data Infografik aplikasi Open Data',
                admin,
                created_at: tanggal || moment().format('YYYY-MM-DD HH:mm:ss'),
                updated_at: tanggal || moment().format('YYYY-MM-DD HH:mm:ss')
            });
            return h.response({ message: 'Berita berhasil diupdate' }).code(201);
        }
        catch (err) {
            console.error('❌ Error saat update infografik:', err);
            return h.response({ msg: 'Gagal update infografik' }).code(500);
        }
    },

    // ============================
    // DELETE BERITA
    // ============================
    delete_infografik: async function (request, h) {
        const id_infografik = request.params.id;
        const { admin,jenis,komponen } = request.payload;
        const tanggal = moment().format('YYYY-MM-DD HH:mm:ss');
        try {
            const oldData = await Knex('tb_opendata_infografik').where({ id_infografik }).first();
            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            if (oldData.images_a) {
                try {
                    await deleteFile(oldData.images_a);
                    await deleteFile(`tumb/` + oldData.images_a);
                }
                catch (err) {
                    console.warn('⚠️ Gagal hapus file infografik image a:', err.message);
                }
            }

            if (oldData.images_b) {
                try {
                    await deleteFile(oldData.images_b);
                    await deleteFile(`tumb/` + oldData.images_b);
                }
                catch (err) {
                    console.warn('⚠️ Gagal hapus file infografik image b:', err.message);
                }
            }

            if (oldData.images_c) {
                try {
                    await deleteFile(oldData.images_c);
                    await deleteFile(`tumb/` + oldData.images_c);
                }
                catch (err) {
                    console.warn('⚠️ Gagal hapus file infografik image c:', err.message);
                }
            }

            if (oldData.images_d) {
                try {
                    await deleteFile(oldData.images_d);
                    await deleteFile(`tumb/` + oldData.images_d);
                }
                catch (err) {
                    console.warn('⚠️ Gagal hapus file infografik image d:', err.message);
                }
            }

            await Knex('tb_opendata_infografik').where({ id_infografik }).del();
            await Knex('tb_logging').insert({
                jenis,
                kategori: komponen,
                item: oldData.title,
                deskripsi: 'Delete data Infografik aplikasi Open Data',
                admin,
                created_at: tanggal || moment().format('YYYY-MM-DD HH:mm:ss'),
                updated_at: tanggal || moment().format('YYYY-MM-DD HH:mm:ss')
            });
            return h.response({ message: 'Berita berhasil dihapus' }).code(201);
        }
        catch (err) {
            console.error('❌ Error saat hapus infografik:', err);
            return h.response({ msg: 'Gagal hapus infografik' }).code(500);
        }
    },

    view_infografik_visitor: async function (request, h) {
        try {
            const { id } = request.params;


            const dataCountRaw = await Knex('tb_opendata_infografik_visitors')
                .where('id_infografik', id)
                .count('id as count_infografikvisitor')
                .first();

            // kalau kosong, isi default 0
            const dataCount = dataCountRaw ? parseInt(dataCountRaw.count_infografikvisitor, 10) : 0;
            //console.log('dataCountRaw 👉', id);
            const dataCountRawDownload = await Knex('tb_opendata_infografik_download')
                .where('id_infografik', id)
                .count('id as count_infografikdownload')
                .first();

            // kalau kosong, isi default 0
            const dataCountDownload = dataCountRawDownload ? parseInt(dataCountRawDownload.count_infografikdownload, 10) : 0;
            //console.log('dataCountRaw 👉', dataCountRaw);

            return h.response({
                //data: plainItem,
                datacount: dataCount,
                datacountdownload: dataCountDownload
            }).code(200);
        }
        catch (err) {
            console.error('Error in view_id:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },



    add_infografik_visitor: async function (request, h) {
        const { id_infografik } = request.payload;
        //const titleAsText = decodeURIComponent(id_dataset).replace(/-/g, ' ');
        const ip = request.info.remoteAddress;
        const userAgent = request.headers['user-agent'];
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD


        try {
            /* const data = await Knex('tb_opendata_dataset')
                .whereRaw('LOWER(nama_dataset) LIKE ?', [`%${titleAsText.toLowerCase()}%`])
                .first();

            if (!data) {
                return h.response({ message: 'Data not found' }).code(404);
            }

            console.log('id dataset : ' + data.id_dataset); */

            const exists = await Knex('tb_opendata_infografik_visitors')
                .where('id_infografik', id_infografik)
                .andWhere('ip_address', ip)
                .andWhereRaw(`DATE(visited_at) = ?`, [today])
                .first();

            if (!exists) {
                await Knex('tb_opendata_infografik_visitors').insert({
                    id_infografik,
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

    add_infografik_download: async function (request, h) {
        const { id_infografik } = request.payload;
        //console.log('idinfo:' + id_infografik);

        //const titleAsText = decodeURIComponent(id_dataset).replace(/-/g, ' ');
        const ip = request.info.remoteAddress;
        const userAgent = request.headers['user-agent'];
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD


        try {
            /* const data = await Knex('tb_opendata_dataset')
                .whereRaw('LOWER(nama_dataset) LIKE ?', [`%${titleAsText.toLowerCase()}%`])
                .first();

            if (!data) {
                return h.response({ message: 'Data not found' }).code(404);
            }

            console.log('id dataset : ' + data.id_dataset); */

            const exists = await Knex('tb_opendata_infografik_download')
                .where('id_infografik', id_infografik)
                .andWhere('ip_address', ip)
                .andWhereRaw(`DATE(visited_at) = ?`, [today])
                .first();

            if (!exists) {
                await Knex('tb_opendata_infografik_download').insert({
                    id_infografik,
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
    }


};
