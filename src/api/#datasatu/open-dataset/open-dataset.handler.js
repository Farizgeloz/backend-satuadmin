/* eslint-disable @hapi/scope-start */
'use strict';

const Knex = require('../../../database');
const { generatePresignedUrl,uploadFile,deleteFile, uploadFileTumb } = require('../../../utils/s3Client'); // path ke helper baru

const path = require('path');

const moment = require('moment');



const internals_bidangurusan = {
    sqlBaseView: Knex.select('*').from('tb_sektor')
};

const internals_artikel = {
    sqlBaseView: Knex.select('*').from('tb_opendata_artikel')
};

const sanitizeFileName = (name) => {
    return name
        .replace(/[^a-zA-Z0-9._-]/g, '_') // hanya huruf, angka, titik, underscore, dash
        .substring(0, 100); // batasi panjang supaya aman
};


module.exports = {



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



    // ============================
    // VIEW ARTIKEL
    // ============================
    view_list_artikel: async function (request, h) {
        try {
            const { page = 1, limit = 10, search_kunci = '' } = request.query;
            const offset = (page - 1) * limit;

            // filter pencarian
            let query = Knex('tb_opendata_artikel');
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
            return h.response({ message: 'Berita berhasil dihapus' }).code(201);
        }
        catch (err) {
            console.error('❌ Error saat hapus artikel:', err);
            return h.response({ msg: 'Gagal hapus artikel' }).code(500);
        }
    }


};
