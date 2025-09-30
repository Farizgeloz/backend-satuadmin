/* eslint-disable @hapi/scope-start */
'use strict';

const Knex = require('../../../database');
const path = require('path');
const moment = require('moment');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');



const internals_users = {
    sqlBaseView: Knex.select('*').from('tb_users')
};


module.exports = {

    view_user: async function (request, h) {
        const queryUrl = { ...request.query };
        const search_opd = queryUrl.search_opd;
        const search_jabatan = queryUrl.search_jabatan;
        const search_role = queryUrl.search_role;

        console.log('search_opd : ' + search_opd);

        try {
            const sql = internals_users.sqlBaseView.clone();
            if (search_opd !== null && search_role !== 'Super Admin') {
                sql.leftJoin('tb_opd', 'tb_users.opd_id', '=', 'tb_opd.id_opd');
                sql.select(
                    'tb_users.*',
                    'tb_opd.nama_opd'
                );
                sql.orderBy('tb_users.id', 'asc');
                const opdArray = Array.isArray(search_opd)
                    ? search_opd
                    : search_opd.split(',').map((id) => Number(id.trim()));  // konversi ke number, atau parseInt
                sql.whereIn('tb_users.opd_id', opdArray);
            }
            else {
                sql.leftJoin('tb_opd', 'tb_users.opd_id', '=', 'tb_opd.id_opd');
                sql.select(
                    'tb_users.*',
                    'tb_opd.nama_opd'
                );
                sql.orderBy('tb_users.id', 'asc');
            }

            const data = await sql;


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

    view_user_id: async function (request, h) {
        try {
            const { id } = request.params;

            if (!id) {
                return h.response({ message: 'ID tidak boleh kosong' }).code(400);
            }

            // Ambil data berdasarkan kategori yang mengandung `id`
            const sql = internals_users.sqlBaseView.clone();
            sql.leftJoin('tb_opd', 'tb_users.opd_id', '=', 'tb_opd.id_opd');
            sql.select(
                'tb_users.*',
                'tb_opd.nama_opd'
            );
            const data = await sql.where('uuid', 'like', `%${id}%`).first();

            if (!data) {
                return h.response({ message: 'Data tidak ditemukan' }).code(404);
            }

            return h.response(data).code(200);
        }
        catch (err) {
            console.error('❌ Error in view_images_id:', err);
            return h.response({ message: 'Internal Server Error' }).code(500);
        }
    },

    update_user: async function (request, h) {
        const id = request.params.id;


        const {
            nick, name,email,password,confpassword,role,opd_id
        } = request.payload;


        const tanggal = moment().format('YYYY-MM-DD');

        try {
            const oldData = await Knex('tb_users').where('uuid', id).first();

            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            // ============ Simpan ke DB ============
            const updateData = {
                nick,
                name,
                email,
                role,
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            if (role !== 'Super Admin') {
                updateData.opd_id = opd_id;
            }

            // Simpan password jika ada dan bukan null/empty string
            if (password && password.trim() !== '') {
                if (password !== confpassword) {
                    return h.response({ msg: 'Konfirmasi password tidak sesuai' }).code(400);
                }

                const hashedPassword = await argon2.hash(password);
                updateData.password = hashedPassword;
            }

            // Update berdasarkan uuid
            await Knex('tb_users').where('uuid', id).update(updateData);

            return h.response({ message: 'Berhasil diupdate' }).code(201);

        }
        catch (err) {
            console.error('Error saat upload atau update:', err);
            return h.response({ msg: 'Gagal menyimpan' }).code(500);
        }
    },

    add_user: async function (request, h) {
        const { nick, name, email, password, confpassword, role, opd_id } = request.payload;

        try {
        // validasi password & confirm password
            if (!password || password.trim() === '') {
                return h.response({ msg: 'Password wajib diisi' }).code(400);
            }

            if (password !== confpassword) {
                return h.response({ msg: 'Konfirmasi password tidak sesuai' }).code(400);
            }

            // hashing password
            const hashedPassword = await argon2.hash(password);

            const insertData = {
                uuid: crypto.randomUUID(), // generate uuid baru
                nick,
                name,
                email,
                role,
                password: hashedPassword,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            if (role !== 'Super Admin') {
                insertData.opd_id = opd_id;
            }

            await Knex('tb_users').insert(insertData);

            return h.response({ message: 'User berhasil ditambahkan' }).code(201);
        }
        catch (err) {
            console.error('Error saat tambah user:', err);
            return h.response({ msg: 'Gagal menyimpan' }).code(500);
        }
    },

    delete_user: async function (request, h) {
        const id = request.params.id; // ambil ID dari URL

        try {
            const data = await Knex('tb_users').where({ id }).first();

            if (!data) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            // Hapus dari database
            await Knex('tb_users').where({ id }).del();

            return h.response({ msg: 'Data berhasil dihapus' }).code(200);

        }
        catch (err) {
            console.error('❌ Gagal menghapus data:', err);
            return h.response({ msg: 'Gagal menghapus data' }).code(500);
        }
    },

    login_user: async function (request, h) {
        const { email, password } = request.payload;

        try {
            const user = await Knex('tb_users').where({ email }).first();

            if (!user) {
                console.log('❌ Email tidak ditemukan:', email);
                return h.response({ message: 'Email tidak ditemukan' }).code(401);
            }

            console.log('✅ User ditemukan:', user.email);

            const valid = await argon2.verify(user.password, password);
            if (!valid) {
                console.log('❌ Password salah untuk:', email);
                return h.response({ message: 'Password salah' }).code(401);
            }

            const tokenPayload = {
                id: user.id,
                email: user.email,
                role: user.role
            };

            const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'rahasia', {
                expiresIn: '2h' // ⏰ 2 jam
            });

            console.log('✅ Login sukses:', email);

            return h.response({
                token,
                role: user.role,
                user: {
                    id: user.id,
                    email: user.email,
                    nick: user.nick,
                    name: user.name,
                    opd_id: user.opd_id
                }
            }).code(200);

        }
        catch (err) {
            console.error('🔥 ERROR LOGIN:', err);
            return h.response({ message: 'Terjadi kesalahan server' }).code(500);
        }
    }



};
