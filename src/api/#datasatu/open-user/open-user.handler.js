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


        try {
            const sql = internals_users.sqlBaseView.clone();
            if (search_role === 'Super Admin') {
                sql.leftJoin('tb_opd', 'tb_users.opd_id', '=', 'tb_opd.id_opd');
                sql.select(
                    'tb_users.*',
                    'tb_opd.nama_opd'
                );
                sql.orderBy('tb_users.id', 'asc');
            }
            else if (search_role === 'Admin') {
                sql.leftJoin('tb_opd', 'tb_users.opd_id', '=', 'tb_opd.id_opd');
                sql.select(
                    'tb_users.*',
                    'tb_opd.nama_opd'
                );
                sql.whereNot('tb_users.role', 'Super Admin');
                sql.orderBy('tb_users.id', 'asc');
            }

            else {
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
            nick, name, email, password, confpassword, role, opd_id, admin, jenis, komponen
        } = request.payload;

        const tanggal = moment().format('YYYY-MM-DD HH:mm:ss');

        try {
            const oldData = await Knex('tb_users').where('uuid', id).first();

            if (!oldData) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            // ===================== CEK NICK SUDAH DIPAKAI USER LAIN =====================
            const nickExist = await Knex('tb_users')
                .where('nick', nick)
                .whereNot('uuid', id) // pengecualian diri sendiri
                .first();

            if (nickExist) {
                return h
                    .response({ msg: 'Nick sudah digunakan pengguna lain, gunakan nick lain.' })
                    .code(400);
            }

            // ===================== CEK EMAIL SUDAH DIPAKAI USER LAIN =====================
            const emailExist = await Knex('tb_users')
                .where('email', email)
                .whereNot('uuid', id) // pengecualian diri sendiri
                .first();

            if (emailExist) {
                return h
                    .response({ msg: 'Email sudah digunakan pengguna lain, gunakan email lain.' })
                    .code(400);
            }

            // ===================== DATA UPDATE =====================
            const updateData = {
                nick,
                name,
                email,
                role,
                admin,
                updated_at: tanggal
            };

            // Role tertentu tidak punya opd_id
            if (['Super Admin', 'Admin', 'Operator', 'CS'].includes(role)) {
                updateData.opd_id = '';
            }
            else {
                updateData.opd_id = opd_id;
            }

            // ===================== PASSWORD (opsional) =====================
            if (password && password.trim() !== '') {
                if (password !== confpassword) {
                    return h.response({ msg: 'Konfirmasi password tidak sesuai' }).code(400);
                }

                const hashedPassword = await argon2.hash(password);
                updateData.password = hashedPassword;
            }

            // ===================== EXEC UPDATE =====================
            await Knex('tb_users').where('uuid', id).update(updateData);

            // Logging perubahan
            await Knex('tb_logging').insert({
                jenis,
                kategori: komponen,
                item: role + '-' + nick,
                deskripsi: 'Update data Pengguna aplikasi Satu Admin',
                admin,
                created_at: tanggal,
                updated_at: tanggal
            });

            return h.response({ message: 'Berhasil diupdate' }).code(201);
        }
        catch (err) {
            console.error('Error saat upload atau update:', err);
            return h.response({ msg: 'Gagal menyimpan' }).code(500);
        }
    },


    add_user: async function (request, h) {
        const { nick, name, email, password, confpassword, role, opd_id, admin, jenis, komponen } = request.payload;
        const tanggal = moment().format('YYYY-MM-DD HH:mm:ss');

        try {
        // Validasi password
            if (!password || password.trim() === '') {
                return h.response({ msg: 'Password wajib diisi' }).code(400);
            }

            if (password !== confpassword) {
                return h.response({ msg: 'Konfirmasi password tidak sesuai' }).code(400);
            }

            // ✅ CEK NICK SUDAH DIPAKAI?
            const nickExist = await Knex('tb_users')
                .where('nick', nick)
                .first();

            if (nickExist) {
                return h.response({ msg: 'Nick sudah digunakan, gunakan nick lain.' }).code(400);
            }

            // ✅ CEK EMAIL SUDAH DIPAKAI?
            const emailExist = await Knex('tb_users')
                .where('email', email)
                .first();

            if (emailExist) {
                return h.response({ msg: 'Email sudah digunakan, gunakan email lain.' }).code(400);
            }

            // Hashing password
            const hashedPassword = await argon2.hash(password);

            const insertData = {
                uuid: crypto.randomUUID(),
                nick,
                name,
                email,
                role,
                admin,
                password: hashedPassword,
                created_at: tanggal,
                updated_at: tanggal
            };

            // Role tertentu tidak memakai opd_id
            if (['Super Admin', 'Admin', 'Operator', 'CS'].includes(role)) {
                insertData.opd_id = '';
            }
            else {
                insertData.opd_id = opd_id;
            }

            // Insert user
            await Knex('tb_users').insert(insertData);

            // Logging
            await Knex('tb_logging').insert({
                jenis,
                kategori: komponen,
                item: `${role}-${nick}`,
                deskripsi: 'Tambah data Pengguna aplikasi Satu Admin',
                admin,
                created_at: tanggal,
                updated_at: tanggal
            });

            return h.response({ message: 'User berhasil ditambahkan' }).code(201);
        }
        catch (err) {
            console.error('Error saat tambah user:', err);
            return h.response({ msg: 'Gagal menyimpan' }).code(500);
        }
    },


    delete_user: async function (request, h) {
        const id = request.params.id; // ambil ID dari URL
        const { admin,jenis,komponen } = request.payload;
        const tanggal = moment().format('YYYY-MM-DD HH:mm:ss');
        try {
            const data = await Knex('tb_users').where({ id }).first();

            if (!data) {
                return h.response({ msg: 'Data tidak ditemukan' }).code(404);
            }

            // Hapus dari database
            await Knex('tb_users').where({ id }).del();
            await Knex('tb_logging').insert({
                jenis,
                kategori: komponen,
                item: data.role + '-' + data.nick,
                deskripsi: 'Delete data Pengguna aplikasi Satu Admin',
                admin,
                created_at: tanggal || moment().format('YYYY-MM-DD HH:mm:ss'),
                updated_at: tanggal || moment().format('YYYY-MM-DD HH:mm:ss')
            });

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

            //console.log('✅ User ditemukan:', user.email);

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

            return h
                .response({
                    role: user.role,
                    user: {
                        id: user.id,
                        email: user.email,
                        nick: user.nick,
                        name: user.name,
                        opd_id: user.opd_id
                    }
                })
                .state('token', token, {
                    isHttpOnly: true,
                    isSecure: false,     // ⬅ WAJIB FALSE (karena belum domain/HTTPS)
                    sameSite: 'Lax',
                    path: '/',
                    ttl: 2 * 60 * 60 * 1000 // 2 jam
                })
                .code(200);


        }
        catch (err) {
            console.error('🔥 ERROR LOGIN:', err);
            return h.response({ message: 'Terjadi kesalahan server' }).code(500);
        }
    }



};
