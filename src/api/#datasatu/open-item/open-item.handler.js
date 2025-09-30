/* eslint-disable @hapi/scope-start */
'use strict';

const Knex = require('../../../database');
const { generatePresignedUrl,uploadFile,uploadFileTumb,deleteFile } = require('../../../utils/s3Client'); // path ke helper baru
const path = require('path');
const moment = require('moment');

const internals_ekosistem_setting = {
    sqlBaseView: Knex.select('*').from('tb_satuportal_setting')
};

const internals_opendata_setting = {
    sqlBaseView: Knex.select('*').from('tb_opendata_setting')
};

const internals_satupeta_setting = {
    sqlBaseView: Knex.select('*').from('tb_satupeta_setting')
};

const internals_ekosistem = {
    sqlBaseView: Knex.select('*').from('tb_satuportal_menu')
};

const internals_opendata = {
    sqlBaseView: Knex.select('*').from('tb_opendata_menu')
};

const internals_satupeta = {
    sqlBaseView: Knex.select('*').from('tb_satupeta_menu')
};

const internals_komponen = {
    sqlBaseView: Knex.select('*').from('tb_komponen')
};

const internals_ekosistem_pengumuman = {
    sqlBaseView: Knex.select('*').from('tb_satuportal_pengumuman')
};

const internals_ekosistem_iklan = {
    sqlBaseView: Knex.select('*').from('tb_satuportal_iklan')
};

const internals_ekosistem_visitor = {
    sqlBaseView: Knex.select('*').from('tb_satuportal_visitors')
};

const internals_opendata_iklan = {
    sqlBaseView: Knex.select('*').from('tb_opendata_iklan')
};
const internals_opendata_bantuan = {
    sqlBaseView: Knex.select('*').from('tb_opendata_bantuan')
};

const internals_satupeta_iklan = {
    sqlBaseView: Knex.select('*').from('tb_satupeta_iklan')
};

const internals_ekosistem_bio = {
    sqlBaseView: Knex.select('*').from('tb_satuportal_bio')
};


const internals_satker_code = {
    sqlBaseView: Knex.select('*').from('tb_opd')
};

const internals_bidangurusan = {
    sqlBaseView: Knex.select('*').from('tb_sektor')
};

const internals_satker = {
    sqlBaseView: Knex.select('*').from('tb_opd')
};


const sanitizeFileName = (name) => {
    return name
        .replace(/[^a-zA-Z0-9._-]/g, '_') // hanya huruf, angka, titik, underscore, dash
        .substring(0, 100); // batasi panjang supaya aman
};



module.exports = {

    view_count: async function (request, h) {
        try {
            const count_satuportal_iklan_raw = await Knex('tb_satuportal_iklan')
                .count('id as count_data')
                .first();
            const count_satuportal_iklan = count_satuportal_iklan_raw ? parseInt(count_satuportal_iklan_raw.count_data, 10) : 0;

            const count_satuportal_pengumuman_raw = await Knex('tb_satuportal_pengumuman')
                .count('id as count_data')
                .first();
            const count_satuportal_pengumuman = count_satuportal_pengumuman_raw ? parseInt(count_satuportal_pengumuman_raw.count_data, 10) : 0;

            const count_satuportal_visitors_raw = await Knex('tb_satuportal_visitors')
                .count('id as count_data')
                .first();
            const count_satuportal_visitors = count_satuportal_visitors_raw ? parseInt(count_satuportal_visitors_raw.count_data, 10) : 0;

            const count_opendata_artikel_raw = await Knex('tb_opendata_artikel')
                .count('id_artikel as count_data')
                .first();
            const count_opendata_artikel = count_opendata_artikel_raw ? parseInt(count_opendata_artikel_raw.count_data, 10) : 0;

            const count_opendata_dataset_download_raw = await Knex('tb_opendata_dataset_download')
                .count('id as count_data')
                .first();
            const count_opendata_dataset_download = count_opendata_dataset_download_raw ? parseInt(count_opendata_dataset_download_raw.count_data, 10) : 0;

            const count_opendata_dataset_visitors_raw = await Knex('tb_opendata_dataset_visitors')
                .count('id as count_data')
                .first();
            const count_opendata_dataset_visitors = count_opendata_dataset_visitors_raw ? parseInt(count_opendata_dataset_visitors_raw.count_data, 10) : 0;

            const count_opendata_feedback_raw = await Knex('tb_opendata_feedback')
                .count('id as count_data')
                .first();
            const count_opendata_feedback = count_opendata_feedback_raw ? parseInt(count_opendata_feedback_raw.count_data, 10) : 0;

            const count_opendata_iklan_raw = await Knex('tb_opendata_iklan')
                .count('id as count_data')
                .first();
            const count_opendata_iklan = count_opendata_iklan_raw ? parseInt(count_opendata_iklan_raw.count_data, 10) : 0;

            const count_opendata_visitors_raw = await Knex('tb_opendata_visitors')
                .count('id as count_data')
                .first();
            const count_opendata_visitors = count_opendata_visitors_raw ? parseInt(count_opendata_visitors_raw.count_data, 10) : 0;

            const count_satupeta_artikel_raw = await Knex('tb_satupeta_artikel')
                .count('id_artikel as count_data')
                .first();
            const count_satupeta_artikel = count_satupeta_artikel_raw ? parseInt(count_satupeta_artikel_raw.count_data, 10) : 0;

            const count_satupeta_feedback_raw = await Knex('tb_satupeta_feedback')
                .count('id as count_data')
                .first();
            const count_satupeta_feedback = count_satupeta_feedback_raw ? parseInt(count_satupeta_feedback_raw.count_data, 10) : 0;

            const count_satupeta_iklan_raw = await Knex('tb_satupeta_iklan')
                .count('id as count_data')
                .first();
            const count_satupeta_iklan = count_satupeta_iklan_raw ? parseInt(count_satupeta_iklan_raw.count_data, 10) : 0;

            const count_satupeta_locations_raw = await Knex('tb_satupeta_locations')
                .count('id_location as count_data')
                .first();
            const count_satupeta_locations = count_satupeta_locations_raw ? parseInt(count_satupeta_locations_raw.count_data, 10) : 0;

            const count_satupeta_location_maplist_raw = await Knex('tb_satupeta_location_maplist')
                .count('id_maplist as count_data')
                .first();
            const count_satupeta_location_maplist = count_satupeta_location_maplist_raw ? parseInt(count_satupeta_location_maplist_raw.count_data, 10) : 0;

            const count_satupeta_location_maplist_download_raw = await Knex('tb_satupeta_location_maplist_download')
                .count('id as count_data')
                .first();
            const count_satupeta_location_maplist_download = count_satupeta_location_maplist_download_raw ? parseInt(count_satupeta_location_maplist_download_raw.count_data, 10) : 0;

            const count_satupeta_location_maplist_visitors_raw = await Knex('tb_satupeta_location_maplist_visitors')
                .count('id as count_data')
                .first();
            const count_satupeta_location_maplist_visitors = count_satupeta_location_maplist_visitors_raw ? parseInt(count_satupeta_location_maplist_visitors_raw.count_data, 10) : 0;

            const count_satupeta_location_points_raw = await Knex('tb_satupeta_location_points')
                .count('id_location_point as count_data')
                .first();
            const count_satupeta_location_points = count_satupeta_location_points_raw ? parseInt(count_satupeta_location_points_raw.count_data, 10) : 0;

            const count_satupeta_visitors_raw = await Knex('tb_satupeta_visitors')
                .count('id as count_data')
                .first();
            const count_satupeta_visitors = count_satupeta_visitors_raw ? parseInt(count_satupeta_visitors_raw.count_data, 10) : 0;


            return h.response({
                //data: plainItem,
                count_satuportal_iklan,count_satuportal_pengumuman,count_satuportal_visitors,
                count_opendata_artikel,count_opendata_dataset_download,count_opendata_dataset_visitors,
                count_opendata_feedback,count_opendata_iklan,count_opendata_visitors,
                count_satupeta_artikel,count_satupeta_feedback,count_satupeta_iklan,count_satupeta_locations,
                count_satupeta_location_maplist,count_satupeta_location_maplist_download,count_satupeta_location_maplist_visitors,
                count_satupeta_location_points,count_satupeta_visitors
            }).code(200);




        }
        catch (err) {
            console.error('Error in view_ekosistem_setting:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },


    /* ------EKOSISTEM -------*/
    view_ekosistem_setting: async function (request, h) {
        try {
            const sql = internals_ekosistem_setting.sqlBaseView.clone();

            const datas = await sql.first();


            return h.response(datas).code(200);




        }
        catch (err) {
            console.error('Error in view_ekosistem_setting:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    update_ekosistem_setting: async function (request, h) {
        const { id } = request.params;

        const {
            bg_header,
            bg_body,
            bg_title,
            bg_content,
            color_title,
            color_date
        } = request.payload;


        try {
            const result = await Knex('tb_satuportal_setting')
                .where({ id })
                .update({
                    bg_header,
                    bg_body,
                    bg_title,
                    bg_content,
                    color_title,
                    color_date
                });

            if (result === 0) {
                return h.response({ message: 'Data tidak ditemukan.' }).code(404);
            }

            return h.response({ message: 'Warna berhasil diperbarui.' }).code(200);
        }
        catch (err) {
            console.error('Error updateSettings:', err);
            return h.response({ message: 'Gagal memperbarui warna.' }).code(500);
        }
    },

    view_ekosistem_menu: async function (request, h) {
        try {
            const sql = internals_ekosistem.sqlBaseView.clone();
            sql.orderBy('tb_satuportal_menu.id', 'asc');
            sql.groupBy('tb_satuportal_menu.category');

            const datas = await sql;

            return h.response(datas).code(200);

        }
        catch (err) {
            console.error('Error in view_menu_ekosistem:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    view_ekosistem2_menu: async function (request, h) {
        const queryUrl = { ...request.query };

        try {
            const sql = internals_ekosistem.sqlBaseView.clone();
            if (queryUrl.categoryku) {
                sql.where('tb_satuportal_menu.category', 'like', `%${queryUrl.categoryku}%`);
            }

            sql.orderBy('tb_satuportal_menu.id', 'asc');

            const datas = await sql;

            return h.response(datas).code(200);

        }
        catch (err) {
            console.error('Error in view_menu_ekosistem2:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    view_ekosistem_iklan: async function (request, h) {
        try {
        // --- Ambil 1 data random ---
            const sqlRandom = internals_ekosistem_iklan.sqlBaseView.clone();
            sqlRandom.orderByRaw('RAND()');
            const dataRandom = await sqlRandom.limit(1);

            const resultWithUrls = await Promise.all(
                dataRandom.map(async (item) => {
                    const plainItem = { ...item };
                    if (item.images) {
                        try {
                            plainItem.presignedUrl = await generatePresignedUrl(item.images, 60 * 5);
                        }
                        catch (err) {
                            console.warn('⚠️ Gagal buat presigned URL:', err.message);
                            plainItem.presignedUrl = null;
                        }
                    }

                    return plainItem;
                })
            );

            // --- Ambil semua data urut terbaru ---
            const sqlLatest = internals_ekosistem_iklan.sqlBaseView.clone();
            sqlLatest.orderBy('updated_at', 'desc');
            const dataLatest = await sqlLatest;

            const resultWithUrls2 = await Promise.all(
                dataLatest.map(async (item) => {
                    const plainItem = { ...item };
                    if (item.images) {
                        try {
                            plainItem.presignedUrl = await generatePresignedUrl(`tumb/` + item.images, 60 * 5);
                        }
                        catch (err) {
                            console.warn('⚠️ Gagal buat presigned URL:', err.message);
                            plainItem.presignedUrl = null;
                        }
                    }

                    return plainItem;
                })
            );

            if (!resultWithUrls || resultWithUrls.length === 0) {
                return h.response({ message: 'Data tidak ditemukan' }).code(404);
            }

            return h.response({
                resultWithUrls,
                resultWithUrls2
            }).code(200);
        }
        catch (err) {
            console.error('Error in view_ekosistem_iklan:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    view_ekosistem_iklan_id: async function (request, h) {
        try {
            const { id } = request.params;

            if (!id) {
                return h.response({ message: 'ID tidak boleh kosong' }).code(400);
            }

            // Ambil data berdasarkan title yang mengandung `id`
            const sql = internals_ekosistem_iklan.sqlBaseView.clone();
            const data = await sql.where('title', 'like', `%${id}%`).first();

            if (!data) {
                return h.response({ message: 'Data tidak ditemukan' }).code(404);
            }

            const plainItem = data.toJSON ? data.toJSON() : { ...data };

            const images = [
                { key: 'images', urlKey: 'presignedUrl' }
            ];

            // Buat semua URL sekaligus dalam paralel
            await Promise.all(images.map(async ({ key, urlKey }) => {
                const imageName = plainItem[key];
                if (imageName) {
                    try {
                        plainItem[urlKey] = await generatePresignedUrl(`tumb/` + imageName, 60 * 5);
                    }
                    catch (err) {
                        console.warn(`⚠️ Gagal membuat URL untuk ${key}:`, err.message);
                        plainItem[urlKey] = null;
                    }
                }
                else {
                    plainItem[urlKey] = null;
                }
            }));

            return h.response(plainItem).code(200);
        }
        catch (err) {
            console.error('❌ Error in view_ekosistem_iklan_id:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },


    add_ekosistem_iklan: async function (request, h) {
        const { kategori, title, linked, visibilitas } = request.payload;
        const file = request.payload.file;
        const tanggal = moment().format('YYYY-MM-DD');

        let filename = null;
        let filename_tumb = null;

        // helper: stream → buffer
        const streamToBuffer = async (stream) => {
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }

            return Buffer.concat(chunks);
        };

        try {
            // ============ File Upload ============
            if (file && file.hapi && file.hapi.filename) {
                const ext = path.extname(file.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename = `satuportal_iklan/images/${tanggal}_${safeTitle}${ext}`;
                filename_tumb = `tumb/satuportal_iklan/images/${tanggal}_${safeTitle}${ext}`;

                let buffer;

                if (file._data) {
                    // ✅ Hapi biasanya kasih langsung Buffer
                    buffer = file._data;
                }
                else if (file._readableState) {
                    // ✅ fallback kalau masih stream
                    buffer = await streamToBuffer(file);
                }
                else {
                    throw new Error('File tidak valid');
                }

                // pakai helper uploadFile
                await uploadFile(buffer, filename, file.hapi.headers['content-type']);
                await uploadFileTumb(buffer, filename_tumb, file.hapi.headers['content-type']);
            }

            // ============ Simpan ke DB ============
            const addData = {
                title,
                linked,
                visibilitas,
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            if (filename) {
                addData.images = filename;
            }

            await Knex('tb_satuportal_iklan').insert(addData);

            return h.response({ message: 'Berhasil Disimpan' }).code(201);
        }
        catch (err) {
            console.error('Error saat upload atau simpan:', err);
            return h.response({ msg: 'Gagal menyimpan' }).code(500);
        }
    },



    update_ekosistem_iklan: async function (request, h) {
        const id = request.params.id;
        const { title, linked, visibilitas } = request.payload;
        const file = request.payload.file;
        const tanggal = moment().format('YYYY-MM-DD');

        const filename = null;

        try {
            const oldData = await Knex('tb_satuportal_iklan').where({ id }).first();
            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            let filename = null; // ✅ tambahkan ini
            let filename_tumb = null; // ✅ tambahkan ini

            // ============ File Upload ============
            if (file && file.hapi && file.hapi.filename) {
                if (oldData.images) {
                    try {
                        await deleteFile(oldData.images);
                    }
                    catch (err) {
                        console.warn('⚠️ Gagal hapus file lama berita:', err.message);
                    }
                }

                const ext1 = path.extname(file.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename = `satuportal_iklan/images/${tanggal}_${safeTitle}${ext1}`;
                filename_tumb = `tumb/satuportal_iklan/images/${tanggal}_${safeTitle}${ext1}`;

                const fileData = file._data;
                if (!fileData) {
                    throw new Error('❌ File data kosong');
                }

                await uploadFile(fileData, filename, file.hapi.headers['content-type']);
                await uploadFileTumb(fileData, filename_tumb, file.hapi.headers['content-type']);
            }

            // ============ Simpan ke DB ============
            const updateData = {
                title,
                linked,
                visibilitas,
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            if (filename) {
                updateData.images = filename; // ✅ hanya overwrite kalau ada file baru
            }

            await Knex('tb_satuportal_iklan').where({ id }).update(updateData);

            return h.response({ message: 'Berhasil diupdate' }).code(201);
        }
        catch (err) {
            console.error('Error saat upload atau update:', err);
            return h.response({ msg: 'Gagal menyimpan' }).code(500);
        }
    },

    delete_ekosistem_iklan: async function (request, h) {
        const id = request.params.id;

        try {
            const data = await Knex('tb_satuportal_iklan').where({ id }).first();
            if (!data) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            // Hapus file dari MinIO jika ada
            if (data.images) {
                await deleteFile(data.images);
                await deleteFile('tumb/' + data.images);
            }

            // Hapus dari database
            await Knex('tb_satuportal_iklan').where({ id }).del();

            return h.response({ msg: 'Data berhasil dihapus' }).code(200);

        }
        catch (err) {
            console.error('❌ Gagal menghapus data:', err);
            return h.response({ msg: 'Gagal menghapus data' }).code(500);
        }
    },


    view_ekosistem_visitor: async function (request, h) {
        try {
            const sql2 = internals_ekosistem_visitor.sqlBaseView.clone();
            const data2 = await sql2.orderBy('visited_at','desc');



            if (!data2) {
                return h.response({ message: 'Data tidak ditemukan' }).code(404);
            }



            return h.response({
                data2
            }).code(200);
        }
        catch (err) {
            console.error('Error in view_visitor:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    delete_ekosistem_visitor: async function (request, h) {
        const { ids } = request.payload;

        if (!Array.isArray(ids) || ids.length === 0) {
            return h.response({ msg: 'IDs harus berupa array dan tidak kosong' }).code(400);
        }

        try {
            // Cek dulu data yang mau dihapus ada gak (optional)
            const dataCount = await Knex('tb_satuportal_visitors').whereIn('id', ids).count('id as count').first();
            if (dataCount.count === 0) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            // Hapus data dengan id di dalam array ids
            await Knex('tb_satuportal_visitors').whereIn('id', ids).del();

            return h.response({ msg: `${ids.length} data berhasil dihapus` }).code(200);

        }
        catch (err) {
            console.error('❌ Gagal menghapus dataku:', err);
            return h.response({ msg: 'Gagal menghapus data' }).code(500);
        }
    },

    view_ekosistem_bioinfo: async function (request, h) {
        try {
            const sql = internals_ekosistem_bio.sqlBaseView.clone();
            sql.orderBy('tb_satuportal_bio.id', 'asc');

            const data = await sql.first();


            if (!data) {
                return h.response({ message: 'Data tidak ditemukan' }).code(404);
            }

            return h.response(data).code(200);
        }
        catch (err) {
            console.error('Error in view_bioinfo:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    view_ekosistem_bio: async function (request, h) {
        try {
            const sql = internals_ekosistem_bio.sqlBaseView.clone();
            // sql.orderBy('tb_komponen.createdAt', 'asc');

            const datas = await sql;
            return h.response(datas).code(200);
        }
        catch (err) {
            console.error('Error in view_bio:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    view_ekosistem_bio_id: async function (request, h) {
        try {
            const { id } = request.params;
            const sql = internals_ekosistem_bio.sqlBaseView.clone();
            const data = await sql.where('id', 'like', `%${id}%`).first();

            return h.response(data).code(200);
        }
        catch (err) {
            console.error('Error in view_id:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    update_ekosistem_bio: async function (request, h) {
        const id = request.params.id; // ambil ID dari URL

        const {
            email,telpon,fax,alamat,luas,populasi,kepadatan,zona,
            kode_pos,instagram,linkedin,facebook,whatapp,twitter
        } = request.payload;

        const tanggal = moment().format('YYYY-MM-DD');

        try {

            const oldData = await Knex('tb_satuportal_bio').where({ id }).first();

            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }




            // Simpan metadata ke database
            const updateData = {
                email,telpon,fax,alamat,luas,populasi,kepadatan,zona,
                kode_pos,instagram,linkedin,facebook,whatapp,twitter
            };


            await Knex('tb_satuportal_bio').where({ id }).update(updateData);

            return h.response({ message: 'Berhasil diupdate' }).code(201);
        }
        catch (err) {
            console.error('Error saat upload atau update:', err);
            return h.response({ msg: 'Gagal menyimpan' }).code(500);
        }
    },

    view_ekosistem_list: async function (request, h) {
        try {
            const sql = internals_komponen.sqlBaseView.clone()
                .select('tb_komponen.*')
                .where('tb_komponen.kategori', 'Satu Portal List')
                .orderBy('tb_komponen.id', 'asc');

            const datas = await sql;

            const signedImage = async (filename) => {
                if (!filename) {
                    return null;
                }

                try {
                    return await generatePresignedUrl(`tumb/` + filename, 60 * 5);
                }
                catch (err) {
                    console.warn(`⚠️ Gagal buat presigned URL: ${filename} ->`, err.message);
                    return 'logo-kab-probolinggo.png'; // fallback path
                }
            };

            const result = await Promise.all(datas.map(async (item) => {
                const plainItem = { ...item };
                // Logos
                plainItem.presignedUrl_1 = await signedImage(item.logo_a);
                plainItem.presignedUrl_2 = await signedImage(item.logo_b);
                plainItem.presignedUrl_3 = await signedImage(item.logo_c);
                // Images
                plainItem.presignedUrl_a = await signedImage(item.images_a);
                plainItem.presignedUrl_b = await signedImage(item.images_b);
                plainItem.presignedUrl_c = await signedImage(item.images_c);
                return plainItem;
            }));

            return h.response(result).code(200);
        }
        catch (err) {
            console.error('Error in view_ekosistem_list:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },


    view_ekosistem_list_id: async function (request, h) {
        try {
            const { id } = request.params;

            if (!id) {
                return h.response({ message: 'ID tidak boleh kosong' }).code(400);
            }

            // Ambil data berdasarkan ID
            const sql = internals_komponen.sqlBaseView.clone();
            const data = await sql.where('id', 'like', `%${id}%`).first();

            if (!data) {
                return h.response({ message: 'Data tidak ditemukan' }).code(404);
            }

            const plainItem = data.toJSON ? data.toJSON() : { ...data };

            const images = [
                { key: 'images_a', urlKey: 'presignedUrl_a' },
                { key: 'images_b', urlKey: 'presignedUrl_b' },
                { key: 'images_c', urlKey: 'presignedUrl_c' }
            ];

            // Buat semua URL secara paralel
            await Promise.all(images.map(async ({ key, urlKey }) => {
                const imageName = plainItem[key];
                if (imageName) {
                    try {
                        plainItem[urlKey] = await generatePresignedUrl(`tumb/` + imageName, 60 * 5);
                    }
                    catch (err) {
                        console.warn(`⚠️ Gagal membuat URL untuk ${key}:`, err.message);
                        plainItem[urlKey] = null;
                    }
                }
                else {
                    plainItem[urlKey] = null;
                }
            }));

            return h.response(plainItem).code(200);
        }
        catch (err) {
            console.error('❌ Error in view_ekosistem_list_id:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },


    add_ekosistem_list: async function (request, h) {
        const {
            kategori, title, contents, title_images_a, title_images_b, title_images_c, linked
        } = request.payload;

        const file1 = request.payload.file1;
        const file2 = request.payload.file2;
        const file3 = request.payload.file3;

        const tanggal = moment().format('YYYY-MM-DD');

        let filename1 = null;
        let filename2 = null;
        let filename3 = null;

        try {
        // ============ File Upload ============
            if (file1 && file1.hapi && file1.hapi.filename) {
                const ext = path.extname(file1.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename1 = `komponen/images/${tanggal}_${safeTitle}_1${ext}`;
                await uploadFile(file1, filename1, file1.hapi.headers['content-type']);
            }

            if (file2 && file2.hapi && file2.hapi.filename) {
                const ext = path.extname(file2.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename2 = `komponen/images//${tanggal}_${safeTitle}_2${ext}`;
                await uploadFile(file2, filename2, file2.hapi.headers['content-type']);
            }

            if (file3 && file3.hapi && file3.hapi.filename) {
                const ext = path.extname(file3.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename3 = `komponen/images/${tanggal}_${safeTitle}_3${ext}`;
                await uploadFile(file3, filename3, file3.hapi.headers['content-type']);
            }

            // ============ Simpan ke DB ============
            const addData = {
                kategori,
                title,
                contents,
                title_images_a,
                title_images_b,
                title_images_c,
                linked,
                updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            if (filename1) {
                addData.images_a = filename1;
            }

            if (filename2) {
                addData.images_b = filename2;
            }

            if (filename3) {
                addData.images_c = filename3;
            }

            await Knex('tb_komponen').insert(addData);

            return h.response({ message: 'Berhasil Disimpan' }).code(201);

        }
        catch (err) {
            console.error('Error saat upload atau update:', err);
            return h.response({ msg: 'Gagal menyimpan' }).code(500);
        }
    },

    update_ekosistem_list: async function (request, h) {
        const id = request.params.id;
        const { title, contents, title_images_a, title_images_b, title_images_c, linked } = request.payload;
        const file1 = request.payload.file1;
        const file2 = request.payload.file2;
        const file3 = request.payload.file3;
        const tanggal = moment().format('YYYY-MM-DD');

        let filename1 = null; let filename2 = null; let filename3 = null;

        try {
            const oldData = await Knex('tb_komponen').where({ id }).first();
            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            // ============ File Upload ============
            if (file1 && file1.hapi && file1.hapi.filename) {
                if (oldData.images_a) {
                    await deleteFile(oldData.images_a);
                }

                const ext = path.extname(file1.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename1 = `komponen/images/${tanggal}_${safeTitle}_1${ext}`;
                await uploadFile(file1, filename1, file1.hapi.headers['content-type']);
            }

            if (file2 && file2.hapi && file2.hapi.filename) {
                if (oldData.images_b) {
                    await deleteFile(oldData.images_b);
                }

                const ext = path.extname(file2.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename2 = `komponen/images/${tanggal}_${safeTitle}_2${ext}`;
                await uploadFile(file2, filename2, file2.hapi.headers['content-type']);
            }

            if (file3 && file3.hapi && file3.hapi.filename) {
                if (oldData.images_c) {
                    await deleteFile(oldData.images_c);
                }

                const ext = path.extname(file3.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename3 = `komponen/images/${tanggal}_${safeTitle}_3${ext}`;
                await uploadFile(file3, filename3, file3.hapi.headers['content-type']);
            }

            // ============ Simpan ke DB ============
            const updateData = {
                title,
                contents,
                title_images_a,
                title_images_b,
                title_images_c,
                linked,
                updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            if (filename1) {
                updateData.images_a = filename1;
            }

            if (filename2) {
                updateData.images_b = filename2;
            }

            if (filename3) {
                updateData.images_c = filename3;
            }

            await Knex('tb_komponen').where({ id }).update(updateData);

            return h.response({ message: 'Berhasil diupdate' }).code(201);

        }
        catch (err) {
            console.error('Error saat upload atau update:', err);
            return h.response({ msg: 'Gagal menyimpan' }).code(500);
        }
    },

    delete_ekosistem_list: async function (request, h) {
        const id = request.params.id;

        try {
            const data = await Knex('tb_komponen').where({ id }).first();
            if (!data) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            // Hapus file dari MinIO jika ada
            const filesToDelete = [
                { filename: data.logo_a, label: 'logo_a' },
                { filename: data.logo_b, label: 'logo_b' },
                { filename: data.logo_c, label: 'logo_c' },
                { filename: data.images_a, label: 'images_a' },
                { filename: data.images_b, label: 'images_b' },
                { filename: data.images_c, label: 'images_c' }
            ];

            for (const { filename } of filesToDelete) {
                if (filename) {
                    await deleteFile(filename);
                    await deleteFile(`tumb/` + filename);
                }
            }

            // Hapus dari database
            await Knex('tb_komponen').where({ id }).del();

            return h.response({ msg: 'Data berhasil dihapus' }).code(200);

        }
        catch (err) {
            console.error('❌ Gagal menghapus data:', err);
            return h.response({ msg: 'Gagal menghapus data' }).code(500);
        }
    },



    view_ekosistem_pengumuman: async function (request, h) {
        try {
            const sql = internals_ekosistem_pengumuman.sqlBaseView.clone();
            sql.orderBy('tb_satuportal_pengumuman.id', 'asc');

            const data = await sql;

            if (!data) {
                return h.response({ message: 'Data tidak ditemukan' }).code(404);
            }

            return h.response(data).code(200);
        }
        catch (err) {
            console.error('Error in view_pengumuman:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },


    /* ------OPENDATA -------*/
    view_opendata_setting: async function (request, h) {
        try {
            const sql = internals_opendata_setting.sqlBaseView.clone();

            const datas = await sql.first();

            return h.response(datas).code(200);

        }
        catch (err) {
            console.error('Error in view_opendata_setting:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },
    update_opendata_setting: async function (request, h) {
        const { id } = request.params;

        console.log('id setting :' + id);


        const {
            bg_header,
            bg_body,
            bg_title,
            bg_content,
            color_title,
            color_date
        } = request.payload;


        try {
            const result = await Knex('tb_opendata_setting')
                .where({ id })
                .update({
                    bg_header,
                    bg_body,
                    bg_title,
                    bg_content,
                    color_title,
                    color_date
                });

            if (result === 0) {
                return h.response({ message: 'Data tidak ditemukan.' }).code(404);
            }

            return h.response({ message: 'Warna berhasil diperbarui.' }).code(200);
        }
        catch (err) {
            console.error('Error updateSettings:', err);
            return h.response({ message: 'Gagal memperbarui warna.' }).code(500);
        }
    },
    view_opendata_menu: async function (request, h) {
        try {
            const sql = internals_opendata.sqlBaseView.clone();
            sql.orderBy('tb_opendata_menu.id', 'asc');
            sql.groupBy('tb_opendata_menu.category');

            const datas = await sql;

            return h.response(datas).code(200);

        }
        catch (err) {
            console.error('Error in view_menu_opendata:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    view_opendata2_menu: async function (request, h) {
        const queryUrl = { ...request.query };

        try {
            const sql = internals_opendata.sqlBaseView.clone();
            if (queryUrl.categoryku) {
                sql.where('tb_opendata_menu.category', 'like', `%${queryUrl.categoryku}%`);
            }

            sql.orderBy('tb_opendata_menu.id', 'asc');

            const datas = await sql;

            return h.response(datas).code(200);

        }
        catch (err) {
            console.error('Error in view_menu_opendata2:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    view_opendata_iklan: async function (request, h) {
        try {
            const sql = internals_opendata_iklan.sqlBaseView.clone();
            sql.orderByRaw('RAND()'); // ← random order
            const data = await sql.limit(1);

            const resultWithUrls = await Promise.all(
                data.map(async (item) => {
                    const plainItem = { ...item };
                    if (item.images) {
                        try {
                            plainItem.presignedUrl = await generatePresignedUrl(item.images, 60 * 5);
                        }
                        catch (err) {
                            console.warn('⚠️ Gagal buat presigned URL:', err.message);
                            plainItem.presignedUrl = null;
                        }
                    }

                    return plainItem;
                })
            );

            const sql2 = internals_opendata_iklan.sqlBaseView.clone();
            const data2 = await sql2.orderBy('updated_at', 'desc');

            const resultWithUrls2 = await Promise.all(
                data2.map(async (item) => {
                    const plainItem = { ...item };
                    if (item.images) {
                        try {
                            plainItem.presignedUrl = await generatePresignedUrl(`tumb/` + item.images, 60 * 5);
                        }
                        catch (err) {
                            console.warn('⚠️ Gagal buat presigned URL:', err.message);
                            plainItem.presignedUrl = null;
                        }
                    }

                    return plainItem;
                })
            );

            if (!resultWithUrls.length) {
                return h.response({ message: 'Data tidak ditemukan' }).code(404);
            }

            return h.response({
                resultWithUrls,
                resultWithUrls2
            }).code(200);
        }
        catch (err) {
            console.error('Error in view_opendata_iklan:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },


    view_opendata_iklan_id: async function (request, h) {
        try {
            const { id } = request.params;

            if (!id) {
                return h.response({ message: 'ID tidak boleh kosong' }).code(400);
            }

            // Ambil data berdasarkan title yang mengandung `id`
            const sql = internals_opendata_iklan.sqlBaseView.clone();
            const data = await sql.where('title', 'like', `%${id}%`).first();

            if (!data) {
                return h.response({ message: 'Data tidak ditemukan' }).code(404);
            }

            const plainItem = data.toJSON ? data.toJSON() : { ...data };

            const images = [
                { key: 'images', urlKey: 'presignedUrl' }
            ];

            // Buat semua URL secara paralel
            await Promise.all(images.map(async ({ key, urlKey }) => {
                const imageName = plainItem[key];
                if (imageName) {
                    try {
                        plainItem[urlKey] = await generatePresignedUrl(`tumb/` + imageName, 60 * 5);
                    }
                    catch (err) {
                        console.warn(`⚠️ Gagal membuat URL untuk ${key}:`, err.message);
                        plainItem[urlKey] = null;
                    }
                }
                else {
                    plainItem[urlKey] = null;
                }
            }));

            return h.response(plainItem).code(200);
        }
        catch (err) {
            console.error('❌ Error in view_opendata_iklan_id:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    add_opendata_iklan: async function (request, h) {
        const { kategori, title, linked, visibilitas } = request.payload;
        const file = request.payload.file;
        const tanggal = moment().format('YYYY-MM-DD');

        let filename = null;
        let filename_tumb = null;

        // helper: stream → buffer
        const streamToBuffer = async (stream) => {
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }

            return Buffer.concat(chunks);
        };

        try {
            // ============ File Upload ============
            if (file && file.hapi && file.hapi.filename) {
                const ext = path.extname(file.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename = `opendata/iklan/images/${tanggal}_${safeTitle}${ext}`;
                filename_tumb = `tumb/opendata/iklan/images/${tanggal}_${safeTitle}${ext}`;

                let buffer;

                if (file._data) {
                    // ✅ Hapi biasanya kasih langsung Buffer
                    buffer = file._data;
                }
                else if (file._readableState) {
                    // ✅ fallback kalau masih stream
                    buffer = await streamToBuffer(file);
                }
                else {
                    throw new Error('File tidak valid');
                }

                // pakai helper uploadFile
                await uploadFile(buffer, filename, file.hapi.headers['content-type']);
                await uploadFileTumb(buffer, filename_tumb, file.hapi.headers['content-type']);
            }

            // ============ Simpan ke DB ============
            const addData = {
                title,
                linked,
                visibilitas,
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            if (filename) {
                addData.images = filename;
            }

            await Knex('tb_opendata_iklan').insert(addData);

            return h.response({ message: 'Berhasil Disimpan' }).code(201);
        }
        catch (err) {
            console.error('Error saat upload atau simpan:', err);
            return h.response({ msg: 'Gagal menyimpan' }).code(500);
        }
    },

    update_opendata_iklan: async function (request, h) {
        const id = request.params.id;
        const { title, linked, visibilitas } = request.payload;
        const file = request.payload.file;
        const tanggal = moment().format('YYYY-MM-DD');

        const filename = null;

        try {
            const oldData = await Knex('tb_opendata_iklan').where({ id }).first();
            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            let filename = null; // ✅ tambahkan ini
            let filename_tumb = null; // ✅ tambahkan ini

            // ============ File Upload ============
            if (file && file.hapi && file.hapi.filename) {
                if (oldData.images) {
                    try {
                        await deleteFile(oldData.images);
                        await deleteFile(`tumb` + oldData.images);
                    }
                    catch (err) {
                        console.warn('⚠️ Gagal hapus file lama berita:', err.message);
                    }
                }

                const ext1 = path.extname(file.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename = `opendata/iklan/images/${tanggal}_${safeTitle}${ext1}`;
                filename_tumb = `tumb/opendata/iklan/images/${tanggal}_${safeTitle}${ext1}`;

                const fileData = file._data;
                if (!fileData) {
                    throw new Error('❌ File data kosong');
                }

                await uploadFile(fileData, filename, file.hapi.headers['content-type']);
                await uploadFileTumb(fileData, filename_tumb, file.hapi.headers['content-type']);
            }

            // ============ Simpan ke DB ============
            const updateData = {
                title,
                linked,
                visibilitas,
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            if (filename) {
                updateData.images = filename; // ✅ hanya overwrite kalau ada file baru
            }

            await Knex('tb_opendata_iklan').where({ id }).update(updateData);

            return h.response({ message: 'Berhasil diupdate' }).code(201);
        }
        catch (err) {
            console.error('Error saat upload atau update:', err);
            return h.response({ msg: 'Gagal menyimpan' }).code(500);
        }
    },


    delete_opendata_iklan: async function (request, h) {
        const id = request.params.id;

        try {
            const data = await Knex('tb_opendata_iklan').where({ id }).first();
            if (!data) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            if (data.images) {
                await deleteFile(data.images);
                await deleteFile(`tumb/` + data.images);
            }

            await Knex('tb_opendata_iklan').where({ id }).del();

            return h.response({ msg: 'Data berhasil dihapus' }).code(200);

        }
        catch (err) {
            console.error('❌ Gagal menghapus data:', err);
            return h.response({ msg: 'Gagal menghapus data' }).code(500);
        }
    },


    view_opendata_bantuan: async function (request, h) {
        try {
            const sql = internals_opendata_bantuan.sqlBaseView.clone();
            const data = await sql;

            const resultWithUrls = await Promise.all(
                data.map(async (item) => {
                    const plainItem = { ...item };

                    if (item.image) {
                        try {
                            plainItem.presignedUrl = await generatePresignedUrl(item.image, 60 * 5);
                        }
                        catch (err) {
                            console.warn('⚠️ Gagal buat presigned URL:', err.message);
                            plainItem.presignedUrl = null;
                        }
                    }

                    return plainItem;
                })
            );

            return h.response({ resultWithUrls }).code(200);
        }
        catch (err) {
            console.error('Error in view_opendata_bantuan:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },


    view_opendata_bantuan_id: async function (request, h) {
        try {
            const { id } = request.params;

            if (!id) {
                return h.response({ message: 'ID tidak boleh kosong' }).code(400);
            }

            // Ambil data berdasarkan title yang mengandung `id`
            const sql = internals_opendata_bantuan.sqlBaseView.clone();
            const data = await sql.where('title', 'like', `%${id}%`).first();

            if (!data) {
                return h.response({ message: 'Data tidak ditemukan' }).code(404);
            }

            const plainItem = data.toJSON ? data.toJSON() : { ...data };

            const images = [
                { key: 'image', urlKey: 'presignedUrl' }
            ];

            // Buat semua URL secara paralel
            await Promise.all(images.map(async ({ key, urlKey }) => {
                const imageName = plainItem[key];
                if (imageName) {
                    try {
                        plainItem[urlKey] = await generatePresignedUrl(imageName, 60 * 5);
                    }
                    catch (err) {
                        console.warn(`⚠️ Gagal membuat URL untuk ${key}:`, err.message);
                        plainItem[urlKey] = null;
                    }
                }
                else {
                    plainItem[urlKey] = null;
                }
            }));

            return h.response(plainItem).code(200);
        }
        catch (err) {
            console.error('❌ Error in view_opendata_bantuan_id:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },


    add_opendata_bantuan: async function (request, h) {
        const { kategori, title, linked, visibilitas } = request.payload;
        const file = request.payload.file;
        const tanggal = moment().format('YYYY-MM-DD');

        let filename = null;

        try {
        // ============ File Upload ============
            if (file && file.hapi && file.hapi.filename) {
                const ext = path.extname(file.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename = `opendata_iklan/images/${tanggal}_${safeTitle}${ext}`;
                await uploadFile(file, filename, file.hapi.headers['content-type']);
            }

            // ============ Simpan ke DB ============
            const addData = {
                title,
                linked,
                visibilitas,
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            if (filename) {
                addData.images = filename;
            }

            await Knex('tb_opendata_iklan').insert(addData);

            return h.response({ message: 'Berhasil Disimpan' }).code(201);

        }
        catch (err) {
            console.error('Error saat upload atau update:', err);
            return h.response({ msg: 'Gagal menyimpan' }).code(500);
        }
    },

    update_opendata_bantuan: async function (request, h) {
        const id = request.params.id;
        const { title, linked, visibilitas } = request.payload;
        const file = request.payload.file;
        const tanggal = moment().format('YYYY-MM-DD');

        let filename = null;

        try {
            const oldData = await Knex('tb_opendata_iklan').where({ id }).first();
            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            // ============ File Upload ============
            if (file && file.hapi && file.hapi.filename) {
                if (oldData.images) {
                    await deleteFile(oldData.images);
                }

                const ext = path.extname(file.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename = `opendata_iklan/images/${tanggal}_${safeTitle}${ext}`;
                await uploadFile(file, filename, file.hapi.headers['content-type']);
            }

            // ============ Simpan ke DB ============
            const updateData = {
                title,
                linked,
                visibilitas,
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            if (filename) {
                updateData.images = filename;
            }

            await Knex('tb_opendata_iklan').where({ id }).update(updateData);

            return h.response({ message: 'Berhasil diupdate' }).code(201);

        }
        catch (err) {
            console.error('Error saat upload atau update:', err);
            return h.response({ msg: 'Gagal menyimpan' }).code(500);
        }
    },

    delete_opendata_bantuan: async function (request, h) {
        const id = request.params.id;

        try {
            const data = await Knex('tb_opendata_iklan').where({ id }).first();
            if (!data) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            if (data.images) {
                await deleteFile(data.images);
            }

            await Knex('tb_opendata_iklan').where({ id }).del();

            return h.response({ msg: 'Data berhasil dihapus' }).code(200);

        }
        catch (err) {
            console.error('❌ Gagal menghapus data:', err);
            return h.response({ msg: 'Gagal menghapus data' }).code(500);
        }
    },


    add_opendata_feedback: async function (request, h) {
        const {
            tujuan, posisi, temu, feedback
        } = request.payload;

        const ip = request.info.remoteAddress;
        const userAgent = request.headers['user-agent'];
        const tanggal = moment().format('YYYY-MM-DD');

        try {
            // Simpan metadata ke database
            await Knex('tb_opendata_feedback').insert({
                ip_address: ip,
                user_agent: userAgent,
                tujuan,
                posisi,
                visibilitas: temu,
                feedback,
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

    /* ------SATUPETA -------*/
    view_satupeta_setting: async function (request, h) {
        try {
            const sql = internals_satupeta_setting.sqlBaseView.clone();

            const datas = await sql.first();

            return h.response(datas).code(200);

        }
        catch (err) {
            console.error('Error in view_satupeta_setting:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },
    update_satupeta_setting: async function (request, h) {
        const { id } = request.params;

        const {
            bg_header,
            bg_body,
            bg_title,
            bg_content,
            color_title,
            color_date
        } = request.payload;


        try {
            const result = await Knex('tb_satupeta_setting')
                .where({ id })
                .update({
                    bg_header,
                    bg_body,
                    bg_title,
                    bg_content,
                    color_title,
                    color_date
                });

            if (result === 0) {
                return h.response({ message: 'Data tidak ditemukan.' }).code(404);
            }

            return h.response({ message: 'Warna berhasil diperbarui.' }).code(200);
        }
        catch (err) {
            console.error('Error updateSettings:', err);
            return h.response({ message: 'Gagal memperbarui warna.' }).code(500);
        }
    },

    view_satupeta_menu: async function (request, h) {
        try {
            const sql = internals_satupeta.sqlBaseView.clone();
            sql.orderBy('tb_satupeta_menu.id', 'asc');
            sql.groupBy('tb_satupeta_menu.category');

            const datas = await sql;

            return h.response(datas).code(200);

        }
        catch (err) {
            console.error('Error in view_menu_satupeta:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    view_satupeta2_menu: async function (request, h) {
        const queryUrl = { ...request.query };

        try {
            const sql = internals_satupeta.sqlBaseView.clone();
            if (queryUrl.categoryku) {
                sql.where('tb_satupeta_menu.category', 'like', `%${queryUrl.categoryku}%`);
            }

            sql.orderBy('tb_satupeta_menu.id', 'asc');

            const datas = await sql;

            return h.response(datas).code(200);

        }
        catch (err) {
            console.error('Error in view_menu_satupeta2:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    view_satupeta_iklan: async function (request, h) {
        try {
            const sql = internals_satupeta_iklan.sqlBaseView.clone();
            sql.orderByRaw('RAND()'); // ← random order
            const data = await sql.limit(1);

            const resultWithUrls = await Promise.all(
                data.map(async (item) => {
                    const plainItem = { ...item };
                    if (item.images) {
                        try {
                            plainItem.presignedUrl = await generatePresignedUrl(item.images, 60 * 5);
                        }
                        catch (err) {
                            console.warn('⚠️ Gagal buat presigned URL:', err.message);
                            plainItem.presignedUrl = null;
                        }
                    }

                    return plainItem;
                })
            );

            const sql2 = internals_satupeta_iklan.sqlBaseView.clone();
            const data2 = await sql2.orderBy('updated_at', 'desc');

            const resultWithUrls2 = await Promise.all(
                data2.map(async (item) => {
                    const plainItem = { ...item };
                    if (item.images) {
                        try {
                            plainItem.presignedUrl = await generatePresignedUrl(item.images, 60 * 5);
                        }
                        catch (err) {
                            console.warn('⚠️ Gagal buat presigned URL:', err.message);
                            plainItem.presignedUrl = null;
                        }
                    }

                    return plainItem;
                })
            );

            if (!resultWithUrls.length) {
                return h.response({ message: 'Data tidak ditemukan' }).code(404);
            }

            return h.response({
                resultWithUrls,
                resultWithUrls2
            }).code(200);
        }
        catch (err) {
            console.error('Error in view_opendata_iklan:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },


    view_satupeta_iklan_id: async function (request, h) {
        try {
            const { id } = request.params;

            if (!id) {
                return h.response({ message: 'ID tidak boleh kosong' }).code(400);
            }

            // Ambil data berdasarkan title yang mengandung `id`
            const sql = internals_satupeta_iklan.sqlBaseView.clone();
            const data = await sql.where('title', 'like', `%${id}%`).first();

            if (!data) {
                return h.response({ message: 'Data tidak ditemukan' }).code(404);
            }

            const plainItem = data.toJSON ? data.toJSON() : { ...data };

            const images = [
                { key: 'images', urlKey: 'presignedUrl' }
            ];

            // Buat semua URL secara paralel
            await Promise.all(images.map(async ({ key, urlKey }) => {
                const imageName = plainItem[key];
                if (imageName) {
                    try {
                        plainItem[urlKey] = await generatePresignedUrl(imageName, 60 * 5);
                    }
                    catch (err) {
                        console.warn(`⚠️ Gagal membuat URL untuk ${key}:`, err.message);
                        plainItem[urlKey] = null;
                    }
                }
                else {
                    plainItem[urlKey] = null;
                }
            }));

            return h.response(plainItem).code(200);
        }
        catch (err) {
            console.error('❌ Error in view_satupeta_iklan_id:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    add_satupeta_iklan: async function (request, h) {
        const { kategori, title, linked, visibilitas } = request.payload;
        const file = request.payload.file;
        const tanggal = moment().format('YYYY-MM-DD');

        let filename = null;

        // helper: stream → buffer
        const streamToBuffer = async (stream) => {
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }

            return Buffer.concat(chunks);
        };

        try {
            // ============ File Upload ============
            if (file && file.hapi && file.hapi.filename) {
                const ext = path.extname(file.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename = `satupeta/iklan/images/${tanggal}_${safeTitle}${ext}`;

                let buffer;

                if (file._data) {
                    // ✅ Hapi biasanya kasih langsung Buffer
                    buffer = file._data;
                }
                else if (file._readableState) {
                    // ✅ fallback kalau masih stream
                    buffer = await streamToBuffer(file);
                }
                else {
                    throw new Error('File tidak valid');
                }

                // pakai helper uploadFile
                await uploadFile(buffer, filename, file.hapi.headers['content-type']);
            }

            // ============ Simpan ke DB ============
            const addData = {
                title,
                linked,
                visibilitas,
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            if (filename) {
                addData.images = filename;
            }

            await Knex('tb_satupeta_iklan').insert(addData);

            return h.response({ message: 'Berhasil Disimpan' }).code(201);
        }
        catch (err) {
            console.error('Error saat upload atau simpan:', err);
            return h.response({ msg: 'Gagal menyimpan' }).code(500);
        }
    },

    update_satupeta_iklan: async function (request, h) {
        const id = request.params.id;
        const { title, linked, visibilitas } = request.payload;
        const file = request.payload.file;
        const tanggal = moment().format('YYYY-MM-DD');

        const filename = null;

        try {
            const oldData = await Knex('tb_satupeta_iklan').where({ id }).first();
            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            let filename = null; // ✅ tambahkan ini

            // ============ File Upload ============
            if (file && file.hapi && file.hapi.filename) {
                if (oldData.images) {
                    try {
                        await deleteFile(oldData.images);
                    }
                    catch (err) {
                        console.warn('⚠️ Gagal hapus file lama berita:', err.message);
                    }
                }

                const ext1 = path.extname(file.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename = `satupeta/iklan/images/${tanggal}_${safeTitle}${ext1}`;

                const fileData = file._data;
                if (!fileData) {
                    throw new Error('❌ File data kosong');
                }

                await uploadFile(fileData, filename, file.hapi.headers['content-type']);
            }

            // ============ Simpan ke DB ============
            const updateData = {
                title,
                linked,
                visibilitas,
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            if (filename) {
                updateData.images = filename; // ✅ hanya overwrite kalau ada file baru
            }

            await Knex('tb_satupeta_iklan').where({ id }).update(updateData);

            return h.response({ message: 'Berhasil diupdate' }).code(201);
        }
        catch (err) {
            console.error('Error saat upload atau update:', err);
            return h.response({ msg: 'Gagal menyimpan' }).code(500);
        }
    },


    delete_satupeta_iklan: async function (request, h) {
        const id = request.params.id;

        try {
            const data = await Knex('tb_satupeta_iklan').where({ id }).first();
            if (!data) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            if (data.images) {
                await deleteFile(data.images);
                await deleteFile(`tumb/` + data.images);
            }

            await Knex('tb_satupeta_iklan').where({ id }).del();

            return h.response({ msg: 'Data berhasil dihapus' }).code(200);

        }
        catch (err) {
            console.error('❌ Gagal menghapus data:', err);
            return h.response({ msg: 'Gagal menghapus data' }).code(500);
        }
    },

    add_satupeta_feedback: async function (request, h) {
        const {
            tujuan, posisi, temu, feedback
        } = request.payload;

        const ip = request.info.remoteAddress;
        const userAgent = request.headers['user-agent'];
        const tanggal = moment().format('YYYY-MM-DD');

        try {
            // Simpan metadata ke database
            await Knex('tb_satupeta_feedback').insert({
                ip_address: ip,
                user_agent: userAgent,
                tujuan,
                posisi,
                visibilitas: temu,
                feedback,
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

    view_komponen: async function (request, h) {
        try {
        // --- Ambil data utama ---
            const sql = internals_komponen.sqlBaseView.clone();
            const datas = await sql.whereNotIn('kategori', ['satu portal list', 'satu portal motto']);

            const resultWithUrls = await Promise.all(
                datas.map(async (item) => {
                    const plainItem = { ...item };

                    // array field logo & image
                    const logoFields = ['logo_a', 'logo_b', 'logo_c'];
                    const imageFields = ['images_a', 'images_b', 'images_c'];

                    // logos
                    for (let i = 0; i < logoFields.length; i++) {
                        const key = logoFields[i];
                        if (item[key]) {
                            try {
                                plainItem[`presignedUrl_${i + 1}`] = await generatePresignedUrl(item[key], 60 * 5);
                                plainItem[`presignedUrl_Tumb_${i + 1}`] = await generatePresignedUrl(`tumb/` + item[key], 60 * 5);
                            }
                            catch (err) {
                                console.warn(`⚠️ Gagal buat presigned URL untuk ${key}:`, err.message);
                                plainItem[`presignedUrl_${i + 1}`] = 'logo-kab-probolinggo.png';
                            }
                        }
                        else {
                            plainItem[`presignedUrl_${i + 1}`] = 'logo-kab-probolinggo.png';
                        }
                    }

                    // images
                    for (const key of imageFields) {
                        if (item[key]) {
                            try {
                                plainItem[`presignedUrl_${key.split('_')[1]}`] = await generatePresignedUrl(item[key], 60 * 5);
                                plainItem[`presignedUrl_Tumb_${key.split('_')[1]}`] = await generatePresignedUrl(`tumb/` + item[key], 60 * 5);
                            }
                            catch (err) {
                                console.warn(`⚠️ Gagal buat presigned URL untuk ${key}:`, err.message);
                                plainItem[`presignedUrl_${key.split('_')[1]}`] = null;
                                plainItem[`presignedUrl_${key.split('_')[1]}`] = null;
                            }
                        }
                        else {
                            plainItem[`presignedUrl_Tumb_${`tumb` + key.split('_')[1]}`] = null;
                        }
                    }

                    return plainItem;
                })
            );

            // --- Satu Portal Motto ---
            const sql_satuportal_motto = internals_komponen.sqlBaseView.clone();
            sql_satuportal_motto.where('tb_komponen.kategori', 'Satu Portal Motto');
            const datas_satuportal_motto = await sql_satuportal_motto;

            const resultWithUrls_satuportal_motto = await Promise.all(
                datas_satuportal_motto.map(async (item) => {
                    const plainItem = { ...item };
                    if (item.images_a) {
                        try {
                            plainItem.presignedUrl = await generatePresignedUrl(item.images_a, 60 * 5);
                            plainItem.presignedUrl_Tumb = await generatePresignedUrl(`tumb` + item.images_a, 60 * 5);
                        }
                        catch (err) {
                            console.warn('⚠️ Gagal buat presigned URL:', err.message);
                            plainItem.presignedUrl = null;
                            plainItem.presignedUrl_Tumb = null;
                        }
                    }

                    return plainItem;
                })
            );

            // --- Satu Portal Info ---
            const sql_satuportal_info = internals_komponen.sqlBaseView.clone();
            sql_satuportal_info.where('tb_komponen.kategori', 'Satu Portal Info').first();
            const datas_satuportal_info = await sql_satuportal_info;

            // --- Satu Portal List ---
            const sql_satuportal_list = internals_komponen.sqlBaseView.clone();
            sql_satuportal_list.select('tb_komponen.*')
                .where('tb_komponen.kategori', 'Satu Portal List')
                .orderBy('tb_komponen.id', 'asc');
            const datas_satuportal_list = await sql_satuportal_list;

            const resultWithUrls_satuportal_list = await Promise.all(
                datas_satuportal_list.map(async (item) => {
                    const plainItem = { ...item };

                    const logoFields = ['logo_a', 'logo_b', 'logo_c'];
                    const imageFields = ['images_a', 'images_b', 'images_c'];

                    for (let i = 0; i < logoFields.length; i++) {
                        const key = logoFields[i];
                        if (item[key]) {
                            try {
                                plainItem[`presignedUrl_${i + 1}`] = await generatePresignedUrl(item[key], 60 * 5);
                                plainItem[`presignedUrl_Tumb_${i + 1}`] = await generatePresignedUrl(`tumb/` + item[key], 60 * 5);
                            }
                            catch (err) {
                                console.warn(`⚠️ Gagal buat presigned URL untuk ${key}:`, err.message);
                                plainItem[`presignedUrl_${i + 1}`] = 'logo-kab-probolinggo.png';
                                plainItem[`presignedUrl_Tumb_${i + 1}`] = 'logo-kab-probolinggo.png';
                            }
                        }
                        else {
                            plainItem[`presignedUrl_${i + 1}`] = 'logo-kab-probolinggo.png';
                        }
                    }

                    for (const key of imageFields) {
                        if (item[key]) {
                            try {
                                plainItem[`presignedUrl_${key.split('_')[1]}`] = await generatePresignedUrl(item[key], 60 * 5);
                                plainItem[`presignedUrl_Tumb_${key.split('_')[1]}`] = await generatePresignedUrl(`tumb/` + item[key], 60 * 5);
                            }
                            catch (err) {
                                console.warn(`⚠️ Gagal buat presigned URL untuk ${key}:`, err.message);
                                plainItem[`presignedUrl_${key.split('_')[1]}`] = null;
                                plainItem[`presignedUrl_Tumb_${key.split('_')[1]}`] = null;
                            }
                        }
                        else {
                            plainItem[`presignedUrl_${key.split('_')[1]}`] = null;
                        }
                    }

                    return plainItem;
                })
            );

            // --- Satupeta Motto & Fitur ---
            const sql_satupeta_motto = internals_komponen.sqlBaseView.clone();
            sql_satupeta_motto.where('tb_komponen.kategori', 'Satupeta Motto');
            const data_satupeta_motto = await sql_satupeta_motto.first();

            const sql_satupeta_fitur = internals_komponen.sqlBaseView.clone();
            sql_satupeta_fitur.where('tb_komponen.kategori', 'Satupeta Fitur');
            const data_satupeta_fitur = await sql_satupeta_fitur.first();

            // helper untuk set presignedUrl_a/b/c
            const setPresignedUrls = async (data) => {
                if (!data) {
                    return;
                }

                const imageFields = ['images_a', 'images_b', 'images_c'];
                for (const key of imageFields) {
                    if (data[key]) {
                        try {
                            data[`presignedUrl_${key.split('_')[1]}`] = await generatePresignedUrl(data[key], 60 * 5);
                            data[`presignedUrl_Tumb_${key.split('_')[1]}`] = await generatePresignedUrl(`tumb/` + data[key], 60 * 5);
                        }
                        catch (err) {
                            console.warn(`⚠️ Gagal buat presigned URL untuk ${key}:`, err.message);
                            data[`presignedUrl_${key.split('_')[1]}`] = null;
                            //data[`presignedUrl_Tumb_${key.split('_')[1]}`] = null;
                        }
                    }
                    else {
                        data[`presignedUrl_${key.split('_')[1]}`] = null;
                        data[`presignedUrl_Tumb_${key.split('_')[1]}`] = null;
                    }
                }
            };

            await setPresignedUrls(data_satupeta_motto);
            await setPresignedUrls(data_satupeta_fitur);

            return h.response({
                resultWithUrls,
                resultWithUrls_satuportal_motto,
                datas_satuportal_info,
                resultWithUrls_satuportal_list,
                data_satupeta_motto,
                data_satupeta_fitur
            }).code(200);

        }
        catch (err) {
            console.error('Error in view_komponen:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    view_komponen_id: async function (request, h) {
        try {
            const { title } = request.params;
            const titleAsText = decodeURIComponent(title).replace(/-/g, ' ');

            console.log('id' + titleAsText);


            const sql = internals_komponen.sqlBaseView.clone();
            const item = await sql
                .whereRaw('LOWER(tb_komponen.title) LIKE ?', [`%${titleAsText.toLowerCase()}%`])
                .first();

            if (!item) {
                return h.response({ message: 'Data not found' }).code(404);
            }

            const plainItem = { ...item };
            const imageFields = ['images_a', 'images_b', 'images_c'];

            for (const key of imageFields) {
                if (item[key]) {
                    try {
                        plainItem[`presignedUrl_${key.split('_')[1]}`] = await generatePresignedUrl(item[key], 60 * 5);
                        plainItem[`presignedUrl_Tumb_${key.split('_')[1]}`] = await generatePresignedUrl(`tumb` + item[key], 60 * 5);
                    }
                    catch (err) {
                        console.warn(`⚠️ Gagal buat presigned URL (${key}):`, err.message);
                        plainItem[`presignedUrl_${key.split('_')[1]}`] = null;
                        plainItem[`presignedUrl_Tumb_${key.split('_')[1]}`] = null;
                    }
                }
                else {
                    plainItem[`presignedUrl_Tumb_${key.split('_')[1]}`] = null;
                }
            }

            return h.response(plainItem).code(200);

        }
        catch (err) {
            console.error('Error in view_komponen_id:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    // ----------------- ADD KOMPOSEN -----------------
    add_komponen: async function (request, h) {
        const { title, contents, kategori,title_images_a,title_images_b,title_images_c,linked } = request.payload;
        const file = request.payload.file;
        const tanggal = moment().format('YYYY-MM-DD');

        const fileFields = [
            { key: 'logo_a', folder: 'logo' },
            { key: 'logo_b', folder: 'logo' },
            { key: 'logo_c', folder: 'logo' },
            { key: 'images_a', folder: 'gambar_content' },
            { key: 'images_b', folder: 'gambar_content' },
            { key: 'images_c', folder: 'gambar_content' }
        ];

        try {
            const insert = {};
            let filename = null;
            let filename_tumb = null;

            for (const field of fileFields) {
                const file = request.payload[`file_${field.key}`];
                if (file && file.hapi && file.hapi.filename) {
                    const ext = path.extname(file.hapi.filename);
                    const safeTitle = sanitizeFileName(title || 'file');
                    filename = `komponen/images/${field.folder}/${tanggal}_${safeTitle}_${field.key.split('_')[1]}${ext}`;
                    filename_tumb = `tumb/komponen/images/${field.folder}/${tanggal}_${safeTitle}_${field.key.split('_')[1]}${ext}`;


                    const fileData = file._data;
                    if (!fileData) {
                        throw new Error(`File ${field.key} tidak tersedia`);
                    }

                    const contentType = file.hapi.headers['content-type'] || 'application/octet-stream';
                    await uploadFile(fileData, filename, contentType);
                    await uploadFileTumb(fileData, filename_tumb, contentType);

                    insert[field.key] = filename;
                }
            }

            /* // file utama
            if (file && file.hapi && file.hapi.filename) {
                const ext = path.extname(file.hapi.filename);
                const safeTitle = sanitizeFileName(title);
                filename = `komponen/images/${tanggal}_${safeTitle}${ext}`;
                await uploadFile(file._data, filename, file.hapi.headers['content-type']);
                insert.images_a = filename; // misal simpan sebagai images_a
            } */
            if (title_images_a !== '') {
                insert.title_images_a = title_images_a;
            }

            if (title_images_b !== '') {
                insert.title_images_b = title_images_b;
            }

            if (title_images_c !== '') {
                insert.title_images_c = title_images_c;
            }

            if (linked !== '') {
                insert.linked = linked;
            }



            await Knex('tb_komponen').insert({
                kategori,
                title,
                contents,
                ...insert,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            });

            return h.response({ message: 'Komponen berhasil disimpan' }).code(201);

        }
        catch (err) {
            console.error('Error saat upload atau insert:', err);
            return h.response({ msg: 'Gagal menyimpan Komponen' }).code(500);
        }
    },


    // ----------------- UPDATE KOMPOSEN -----------------
    update_komponen: async function (request, h) {
        const id = request.params.id;
        const { title, contents,title_images_a,title_images_b,title_images_c, linked } = request.payload;
        const tanggal = moment().format('YYYY-MM-DD');

        const fileFields = [
            { key: 'logo_a', folder: 'logo' },
            { key: 'logo_b', folder: 'logo' },
            { key: 'logo_c', folder: 'logo' },
            { key: 'images_a', folder: 'gambar_content' },
            { key: 'images_b', folder: 'gambar_content' },
            { key: 'images_c', folder: 'gambar_content' }
        ];

        try {
            const oldData = await Knex('tb_komponen').where({ id }).first();
            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            const updateData = { title, contents, updated_at: moment().format('YYYY-MM-DD HH:mm:ss') };

            if (title_images_a !== '') {
                updateData.title_images_a = title_images_a;
            }

            if (title_images_b !== '') {
                updateData.title_images_b = title_images_b;
            }

            if (title_images_c !== '') {
                updateData.title_images_c = title_images_c;
            }

            if (linked !== '') {
                updateData.linked = linked;
            }

            for (const field of fileFields) {
                const file = request.payload[`file_${field.key}`];
                if (file && file.hapi && file.hapi.filename) {
                // Hapus file lama jika ada
                    if (oldData[field.key]) {
                        try {
                            await deleteFile(oldData[field.key]);
                            await deleteFile(oldData[`tumb` + field.key]);
                        }
                        catch (err) {
                            console.warn('⚠️ Gagal hapus file:', err.message);
                        }
                    }

                    const ext = path.extname(file.hapi.filename);
                    const safeTitle = sanitizeFileName(title || 'file');
                    const filename = `komponen/images/${field.folder}/${tanggal}_${safeTitle}_${field.key.split('_')[1]}${ext}`;
                    const filename_tumb = `tumb/komponen/images/${field.folder}/${tanggal}_${safeTitle}_${field.key.split('_')[1]}${ext}`;

                    // Pakai Buffer dari file._data
                    const fileData = file._data;
                    if (!fileData) {
                        throw new Error(`File ${field.key} tidak tersedia`);
                    }

                    const contentType = file.hapi.headers['content-type'] || 'application/octet-stream';
                    await uploadFile(fileData, filename, contentType);
                    await uploadFileTumb(fileData, filename_tumb, contentType);

                    updateData[field.key] = filename;
                }
            }

            await Knex('tb_komponen').where({ id }).update(updateData);

            return h.response({ message: 'Komponen berhasil diupdate' }).code(201);

        }
        catch (err) {
            console.error('Error saat upload atau update:', err);
            return h.response({ msg: 'Gagal menyimpan Komponen' }).code(500);
        }
    },


    // ----------------- DELETE KOMPOSEN -----------------
    delete_komponen: async function (request, h) {
        const id = request.params.id;

        try {
            const data = await Knex('tb_komponen').where({ id }).first();
            if (!data) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            // Hapus semua file jika ada
            const fileKeys = ['logo_a', 'logo_b', 'logo_c', 'images_a', 'images_b', 'images_c'];
            for (const key of fileKeys) {
                if (data[key]) {
                    await deleteFile(data[key]);
                    await deleteFile(`tumb/` + data[key]);
                }
            }

            await Knex('tb_komponen').where({ id }).del();
            return h.response({ msg: 'Data berhasil dihapus' }).code(200);

        }
        catch (err) {
            console.error('❌ Gagal menghapus data:', err);
            return h.response({ msg: 'Gagal menghapus data' }).code(500);
        }
    },

    view_images: async function (request, h) {
        try {
            const sql = internals_komponen.sqlBaseView.clone();
            const datas = await sql;

            const resultWithUrls = await Promise.all(
                datas.map(async (item) => {
                    const plainItem = { ...item };

                    const images = [
                        { key: 'images_a', urlKey: 'presignedUrl1' },
                        { key: 'images_b', urlKey: 'presignedUrl2' },
                        { key: 'images_c', urlKey: 'presignedUrl3' }
                    ];

                    await Promise.all(images.map(async ({ key, urlKey }) => {
                        const imageName = plainItem[key];
                        if (imageName) {
                            try {
                                plainItem[urlKey] = await generatePresignedUrl(imageName, 60 * 5);
                            }
                            catch (err) {
                                console.warn(`Gagal buat presigned URL untuk ${key}:`, err.message);
                                plainItem[urlKey] = null;
                            }
                        }
                        else {
                            plainItem[urlKey] = null;
                        }
                    }));

                    return plainItem;
                })
            );

            return h.response(resultWithUrls).code(200);
        }
        catch (err) {
            console.error('Error in view_komponen:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    view_images_id: async function (request, h) {
        try {
            const { id } = request.params;
            if (!id) {
                return h.response({ message: 'ID tidak boleh kosong' }).code(400);
            }

            const sql = internals_komponen.sqlBaseView.clone();
            const data = await sql.where('kategori', 'like', `%${id}%`).first();

            if (!data) {
                return h.response({ message: 'Data tidak ditemukan' }).code(404);
            }

            const plainItem = data.toJSON ? data.toJSON() : { ...data };

            const images = [
                { key: 'images_a', urlKey: 'presignedUrl1' },
                { key: 'images_b', urlKey: 'presignedUrl2' },
                { key: 'images_c', urlKey: 'presignedUrl3' }
            ];

            await Promise.all(images.map(async ({ key, urlKey }) => {
                const imageName = plainItem[key];
                if (imageName) {
                    try {
                        plainItem[urlKey] = await generatePresignedUrl(imageName, 60 * 5);
                    }
                    catch (err) {
                        console.warn(`⚠️ Gagal membuat URL untuk ${key}:`, err.message);
                        plainItem[urlKey] = null;
                    }
                }
                else {
                    plainItem[urlKey] = null;
                }
            }));

            return h.response(plainItem).code(200);
        }
        catch (err) {
            console.error('❌ Error in view_images_id:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    update_images: async function (request, h) {
        const id = request.params.id;
        const { kategori, title, contents } = request.payload;
        const file1 = request.payload.file1;
        const file2 = request.payload.file2;
        const file3 = request.payload.file3;
        const tanggal = moment().format('YYYY-MM-DD');

        let filename1 = null;
        let filename2 = null;
        let filename3 = null;

        try {
            const oldData = await Knex('tb_komponen').where({ id }).first();
            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            const files = [
                { file: file1, old: oldData.images_a, suffix: '_a', setFilename: (f) => filename1 = f },
                { file: file2, old: oldData.images_b, suffix: '_b', setFilename: (f) => filename2 = f },
                { file: file3, old: oldData.images_c, suffix: '_c', setFilename: (f) => filename3 = f }
            ];

            for (const { file, old, suffix, setFilename } of files) {
                if (file && file.hapi && file.hapi.filename) {
                    if (old) {
                        try {
                            await deleteFile(old);
                        }
                        catch (err) {
                            console.warn('⚠️ Gagal hapus file:', err.message);
                        }
                    }

                    const ext = path.extname(file.hapi.filename);
                    const safeTitle = sanitizeFileName(title);
                    const newFilename = `items/images/${tanggal}_${safeTitle}${suffix}${ext}`;
                    await uploadFile(file, newFilename);
                    setFilename(newFilename);
                }
            }

            const updateData = {
                title,
                contents,
                updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                ...(filename1 && { images_a: filename1 }),
                ...(filename2 && { images_b: filename2 }),
                ...(filename3 && { images_c: filename3 })
            };

            await Knex('tb_komponen').where({ id }).update(updateData);

            return h.response({ message: 'Gambar berhasil diupdate' }).code(201);
        }
        catch (err) {
            console.error('Error saat upload atau update:', err);
            return h.response({ msg: 'Gagal menyimpan Gambar' }).code(500);
        }
    },

    view_image_item: async function (request, h) {
        const portal = request.query.portal;

        try {
            const getDataWithUrls = async (queryFn, keys) => {
                const data = await queryFn.first();
                if (!data) {
                    return null;
                }

                const plainItem = data.toJSON ? data.toJSON() : { ...data };
                await Promise.all(keys.map(async ({ key, urlKey }) => {
                    const fileName = plainItem[key];
                    plainItem[urlKey] = fileName ? await generatePresignedUrl(`tumb/` + fileName, 60 * 5) : null;
                }));
                return plainItem;
            };

            const sql_logo = internals_komponen.sqlBaseView.clone();
            if (portal === 'Satu Portal Logo') {
                sql_logo.where('kategori', portal);
            }
            else {
                sql_logo.where('title', portal);
            }

            const data_logo = await getDataWithUrls(sql_logo, [
                { key: 'logo_a', urlKey: 'presignedUrl1' },
                { key: 'logo_b', urlKey: 'presignedUrl2' },
                { key: 'logo_c', urlKey: 'presignedUrl3' }
            ]);

            const data_diskominfo = await getDataWithUrls(
                internals_komponen.sqlBaseView.clone().where('tb_komponen.kategori', 'Diskominfo Logo'),
                [
                    { key: 'logo_a', urlKey: 'presignedUrl1' },
                    { key: 'logo_b', urlKey: 'presignedUrl2' }
                ]
            );

            const data_kabupaten = await getDataWithUrls(
                internals_komponen.sqlBaseView.clone().where('tb_komponen.kategori', 'Kabupaten Logo'),
                [
                    { key: 'logo_a', urlKey: 'presignedUrl1' },
                    { key: 'logo_b', urlKey: 'presignedUrl2' }
                ]
            );

            const data_opendata_bio = await getDataWithUrls(
                internals_komponen.sqlBaseView.clone().where('tb_komponen.kategori', 'Gambar Opendata Bio'),
                [
                    { key: 'images_a', urlKey: 'presignedUrl1' },
                    { key: 'images_b', urlKey: 'presignedUrl2' }
                ]
            );

            const data_opendata_kategoribidang = await getDataWithUrls(
                internals_komponen.sqlBaseView.clone().where('tb_komponen.kategori', 'Gambar Opendata Kategoribidang'),
                [
                    { key: 'images_a', urlKey: 'presignedUrl1' },
                    { key: 'images_b', urlKey: 'presignedUrl2' },
                    { key: 'contents', urlKey: 'contents' }
                ]
            );

            const data_opendata_dataset = await getDataWithUrls(
                internals_komponen.sqlBaseView.clone().where('tb_komponen.kategori', 'Gambar Opendata Dataset'),
                [
                    { key: 'images_a', urlKey: 'presignedUrl1' },
                    { key: 'images_b', urlKey: 'presignedUrl2' }
                ]
            );

            const data_opendata_populer = await getDataWithUrls(
                internals_komponen.sqlBaseView.clone().where('tb_komponen.kategori', 'Gambar Opendata Populer'),
                [{ key: 'images_a', urlKey: 'presignedUrl1' }]
            );

            const data_opendata_komponen = await getDataWithUrls(
                internals_komponen.sqlBaseView.clone().where('tb_komponen.kategori', 'Gambar Opendata Komponen'),
                [
                    { key: 'images_a', urlKey: 'presignedUrl1' },
                    { key: 'images_b', urlKey: 'presignedUrl2' }
                ]
            );

            const data_opendata_graphtahun = await getDataWithUrls(
                internals_komponen.sqlBaseView.clone().where('tb_komponen.kategori', 'Gambar Opendata Graph Tahun'),
                [
                    { key: 'images_a', urlKey: 'presignedUrl1' },
                    { key: 'images_b', urlKey: 'presignedUrl2' }
                ]
            );

            return h.response({
                image_logo: data_logo,
                image_opendata_populer: data_opendata_populer,
                image_opendata_bio: data_opendata_bio,
                image_opendata_kategoribidang: data_opendata_kategoribidang,
                image_opendata_dataset: data_opendata_dataset,
                image_opendata_komponen: data_opendata_komponen,
                image_opendata_graphtahun: data_opendata_graphtahun,
                image_diskominfo: data_diskominfo,
                image_kabupaten: data_kabupaten
            }).code(200);

        }
        catch (err) {
            console.error('Error in view_komponen:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },
    view_satker_code: async function (request, h) {
        try {
            const sql = internals_satker_code.sqlBaseView.clone();
            sql.orderBy('tb_opd.id_opd', 'asc');

            const datas = await sql;



            return h.response(datas).code(200);

        }
        catch (err) {
            console.error('Error in view_ekosistemlist:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    view_satker_code_id: async function (request, h) {
        try {
            const { id } = request.params;
            if (!id) {
                return h.response({ message: 'ID tidak boleh kosong' }).code(400);
            }


            const sql = internals_satker_code.sqlBaseView.clone();
            const data = await sql.where('id_opd', 'like', `%${id}%`).first();

            if (!data) {
                return h.response({ message: 'Data tidak ditemukan' }).code(404);
            }

            const plainItem = data.toJSON ? data.toJSON() : { ...data };

            const images = [
                { key: 'images', urlKey: 'presignedUrl' }
            ];

            // Buat semua URL sekaligus dalam paralel
            await Promise.all(images.map(async ({ key, urlKey }) => {
                const imageName = plainItem[key];
                if (imageName) {
                    try {
                        plainItem[urlKey] = await generatePresignedUrl(imageName, 60 * 5);
                    }
                    catch (err) {
                        console.warn(`⚠️ Gagal membuat URL untuk ${key}:`, err.message);
                        plainItem[urlKey] = null;
                    }
                }
                else {
                    plainItem[urlKey] = null;
                }
            }));

            return h.response(plainItem).code(200);

        }
        catch (err) {
            console.error('❌ Error in view_satker_code_id:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },



    add_satker_code: async function (request, h) {
        const { title, contents, title_images_a, title_images_b, title_images_c, linked } = request.payload;
        const file1 = request.payload.file1;
        const file2 = request.payload.file2;
        const file3 = request.payload.file3;
        const tanggal = moment().format('YYYY-MM-DD');

        let filename1 = null; let filename2 = null; let filename3 = null;

        try {
            if (file1?.hapi?.filename) {
                const ext = path.extname(file1.hapi.filename);
                filename1 = `frontend_portal/images/dashboard/${tanggal}_${title}_1${ext}`;
                await uploadFile(file1, filename1, file1.hapi.headers['content-type']);
            }

            if (file2?.hapi?.filename) {
                const ext = path.extname(file2.hapi.filename);
                filename2 = `frontend_portal/images/dashboard/${tanggal}_${title}_2${ext}`;
                await uploadFile(file2, filename2, file2.hapi.headers['content-type']);
            }

            if (file3?.hapi?.filename) {
                const ext = path.extname(file3.hapi.filename);
                filename3 = `frontend_portal/images/dashboard/${tanggal}_${title}_3${ext}`;
                await uploadFile(file3, filename3, file3.hapi.headers['content-type']);
            }

            const addData = {
                title,
                contents,
                title_images_a,
                title_images_b,
                title_images_c,
                linked,
                updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
            };
            if (filename1) {
                addData.images_a = filename1;
            }

            if (filename2) {
                addData.images_b = filename2;
            }

            if (filename3) {
                addData.images_c = filename3;
            }

            await Knex('tb_satker_code').insert(addData);
            return h.response({ message: 'Berhasil Disimpan' }).code(201);

        }
        catch (err) {
            console.error('Error saat upload atau update:', err);
            return h.response({ msg: 'Gagal menyimpan' }).code(500);
        }
    },

    update_satker_code: async function (request, h) {
        const id_opd = request.params.id;
        const { nama_satker, kode_satker, no_satker } = request.payload;
        const file1 = request.payload.file1;
        const tanggal = moment().format('YYYY-MM-DD');
        let filename1 = null;

        try {
            const oldData = await Knex('tb_opd').where({ id_opd }).first();
            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            if (file1?.hapi?.filename) {
                if (oldData.logo_satker) {
                    await deleteFile(oldData.logo_satker);
                }

                const ext = path.extname(file1.hapi.filename);
                filename1 = `frontend_portal/images/satker/${tanggal}_${nama_satker}_1${ext}`;
                await uploadFile(file1, filename1, file1.hapi.headers['content-type']);
            }

            const updateData = {
                nama_satker,
                kode_satker,
                no_satker,
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };
            if (filename1) {
                updateData.logo_satker = filename1;
            }

            await Knex('tb_opd').where({ id_opd }).update(updateData);
            return h.response({ message: 'Berhasil diupdate' }).code(201);

        }
        catch (err) {
            console.error('Error saat upload atau update:', err);
            return h.response({ msg: 'Gagal menyimpan' }).code(500);
        }
    },

    delete_satker_code: async function (request, h) {
        const id = request.params.id;

        try {
            const data = await Knex('tb_satker_code').where({ id }).first();
            if (!data) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            await deleteFile(data.images_a);
            await deleteFile(data.images_b);
            await deleteFile(data.images_c);

            await Knex('tb_satker_code').where({ id }).del();
            return h.response({ msg: 'Data berhasil dihapus' }).code(200);

        }
        catch (err) {
            console.error('❌ Gagal menghapus data:', err);
            return h.response({ msg: 'Gagal menghapus data' }).code(500);
        }
    },

    view_bidangurusan: async function (request, h) {
        try {
            const sql = internals_bidangurusan.sqlBaseView.clone();
            sql.orderBy('tb_sektor.id_sektor', 'asc');

            const datas = await sql;

            const resultWithUrls = await Promise.all(
                datas.map(async (item) => {
                    const plainItem = item.toJSON ? item.toJSON() : { ...item };
                    const namaKategori = plainItem.nama_sektor?.replace(/\s+/g, '') || 'default';

                    try {
                        const objectPath = `dimensi/${namaKategori}.png`;
                        plainItem.presignedUrl = await generatePresignedUrl(objectPath, 60 * 5);
                    }
                    catch (err) {
                        console.warn(`⚠️ Gagal buat presigned URL untuk ${namaKategori}:`, err.message);
                        plainItem.presignedUrl = null;
                    }

                    return plainItem;
                })
            );

            return h.response(resultWithUrls).code(200);
        }
        catch (err) {
            console.error('❌ Error in view_bidangurusan:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },



    view_id: async function (request, h) {
        try {
            const { id } = request.params;
            const sql = internals_bidangurusan.sqlBaseView.clone();
            const data = await sql.where('tb_sektor.id_sektor', id).first();

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


    view_satkercode_search: async function (request, h) {
        const queryUrl = { ...request.query };

        try {
            const satkerkode = await Knex('tb_opd')
                .where('id_opd', 'like', `%${queryUrl.search_satker}%`)
                .first();

            const kodeset = satkerkode ? satkerkode.no_satker + 1 : 1;

            // SELECT id_opd, kode_satker, no_satker, nama_satker FROM tb_satker WHERE id_opd = ?
            const response = await Knex('tb_opd')
                .select('id_opd', 'nama_opd')
                .where('id_opd', queryUrl.search_satker)
                .first();

            return h.response({
                kode_satker: response?.kode_satker + ' - ' + kodeset,
                kode_file: kodeset
            });

        }
        catch (err) {
            console.error('Error in view_menu_satupeta2:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    view_satker: async function (request, h) {
        const queryUrl = { ...request.query };
        const search_satker = queryUrl.search_satker;
        try {

            // 1. Ambil bidang urusan
            let query = Knex('tb_opd')
                .select('id_opd', 'nama_opd')
                .orderBy('nama_opd', 'asc');

            if (search_satker?.trim()) {
                query = query.where('tb_opd.id_opd', search_satker.trim());
            }

            const resultsatker = await query;



            return h.response({
                resultsatker
            }).code(200);
        }
        catch (error) {
            console.error('❌ Error in getMapsetUnsur:', error);
            return h.response({ msg: error.message }).code(500);
        }
    }

};
