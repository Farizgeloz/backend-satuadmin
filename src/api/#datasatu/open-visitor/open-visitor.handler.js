/* eslint-disable @hapi/scope-start */
'use strict';

const Knex = require('../../../database');
const { minioClient, minioBucket } = require('../../../utils/minioClient');
const path = require('path');
const moment = require('moment');






module.exports = {

    getSatuportalCountVisitor: async function (request, h) {
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const month = String(now.getMonth() + 1).padStart(2, '0'); // MM
        const year = now.getFullYear(); // YYYY

        try {
            const [todayResult] = await Knex('tb_satuportal_visitors')
                .whereRaw(`DATE(visited_at) = ?`, [today])
                .count('id as total');

            const [monthResult] = await Knex('tb_satuportal_visitors')
                .whereRaw(`MONTH(visited_at) = ? AND YEAR(visited_at) = ?`, [month, year])
                .count('id as total');

            const [yearResult] = await Knex('tb_satuportal_visitors')
                .whereRaw(`YEAR(visited_at) = ?`, [year])
                .count('id as total');

            const [allTimeResult] = await Knex('tb_satuportal_visitors')
                .count('id as total');

            return h.response({
                today: Number(todayResult.total),
                month: Number(monthResult.total),
                year: Number(yearResult.total),
                allTime: Number(allTimeResult.total)
            }).code(200);

        }
        catch (err) {
            console.error('❌ Gagal ambil statistik visitor:', err);
            return h.response({ message: 'Failed to get visitor stats' }).code(500);
        }
    },


    logSatuportalVisitor: async function (request, h) {
        const ip = request.info.remoteAddress;
        const userAgent = request.headers['user-agent'];
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        try {
            const exists = await Knex('tb_satuportal_visitors')
                .where('ip_address', ip)
                .andWhereRaw(`DATE(visited_at) = ?`, [today])
                .first();

            if (!exists) {
                await Knex('tb_satuportal_visitors').insert({
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

    getOpendataCountVisitor: async function (request, h) {
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const month = String(now.getMonth() + 1).padStart(2, '0'); // MM
        const year = now.getFullYear(); // YYYY

        try {
            const [todayResult] = await Knex('tb_opendata_visitors')
                .whereRaw(`DATE(visited_at) = ?`, [today])
                .count('id as total');

            const [monthResult] = await Knex('tb_opendata_visitors')
                .whereRaw(`MONTH(visited_at) = ? AND YEAR(visited_at) = ?`, [month, year])
                .count('id as total');

            const [yearResult] = await Knex('tb_opendata_visitors')
                .whereRaw(`YEAR(visited_at) = ?`, [year])
                .count('id as total');

            const [allTimeResult] = await Knex('tb_opendata_visitors')
                .count('id as total');

            return h.response({
                today: Number(todayResult.total),
                month: Number(monthResult.total),
                year: Number(yearResult.total),
                allTime: Number(allTimeResult.total)
            }).code(200);

        }
        catch (err) {
            console.error('❌ Gagal ambil statistik visitor:', err);
            return h.response({ message: 'Failed to get visitor stats' }).code(500);
        }
    },


    logOpendataVisitor: async function (request, h) {
        const ip = request.info.remoteAddress;
        const userAgent = request.headers['user-agent'];
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        try {
            const exists = await Knex('tb_opendata_visitors')
                .where('ip_address', ip)
                .andWhereRaw(`DATE(visited_at) = ?`, [today])
                .first();

            if (!exists) {
                await Knex('tb_opendata_visitors').insert({
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

    getSatupetaCountVisitor: async function (request, h) {
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const month = String(now.getMonth() + 1).padStart(2, '0'); // MM
        const year = now.getFullYear(); // YYYY

        try {
            const [todayResult] = await Knex('tb_satupeta_visitors')
                .whereRaw(`DATE(visited_at) = ?`, [today])
                .count('id as total');

            const [monthResult] = await Knex('tb_satupeta_visitors')
                .whereRaw(`MONTH(visited_at) = ? AND YEAR(visited_at) = ?`, [month, year])
                .count('id as total');

            const [yearResult] = await Knex('tb_satupeta_visitors')
                .whereRaw(`YEAR(visited_at) = ?`, [year])
                .count('id as total');

            const [allTimeResult] = await Knex('tb_satupeta_visitors')
                .count('id as total');

            return h.response({
                today: Number(todayResult.total),
                month: Number(monthResult.total),
                year: Number(yearResult.total),
                allTime: Number(allTimeResult.total)
            }).code(200);

        }
        catch (err) {
            console.error('❌ Gagal ambil statistik visitor:', err);
            return h.response({ message: 'Failed to get visitor stats' }).code(500);
        }
    },


    logSatupetaVisitor: async function (request, h) {
        const ip = request.info.remoteAddress;
        const userAgent = request.headers['user-agent'];
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        try {
            const exists = await Knex('tb_satupeta_visitors')
                .where('ip_address', ip)
                .andWhereRaw(`DATE(visited_at) = ?`, [today])
                .first();

            if (!exists) {
                await Knex('tb_satupeta_visitors').insert({
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
