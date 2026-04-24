'use strict';

const Knex = require('../database');

const satker = function () {

    return Knex('satker').select('nama_satker as title', 'id_satker as value');
};

const bidangUrusan = function () {

    return Knex('bidang_urusan').select('nama_bidang_urusan as title', 'id_bidang_urusan as value');
};

const location = function () {

    return Knex('locations').select('nama_location as title', 'id_location as value');
};

const alamat = function () {

    return Knex('tb_kecamatan')
        .leftJoin('tb_desa', 'tb_kecamatan.id_kecamatan', 'tb_desa.kecamatan_id')
        .groupBy('tb_kecamatan.id_kecamatan')
        .select(
            'tb_kecamatan.nama_kecamatan as title',
            'tb_kecamatan.id_kecamatan as value',
            Knex.raw(`
                    COALESCE(
                        JSON_ARRAYAGG(
                            CASE
                                WHEN tb_desa.id_desa IS NOT NULL THEN
                                    JSON_OBJECT(
                                        'title', tb_desa.nama_desa,
                                        'value', tb_desa.id_desa
                                    )
                                ELSE NULL
                            END
                        ),
                        JSON_ARRAY()
                    ) as desa
                `)
        );
};

const statistic = function () {

    return Knex('bidang_urusan')
        .leftJoin('statistics', 'bidang_urusan.id_bidang_urusan', 'statistics.bidang_urusan_id')
        .groupBy('bidang_urusan.id_bidang_urusan')
        .select(
            'bidang_urusan.nama_bidang_urusan as title',
            // Perbaiki petik satu agar SQL universal
            Knex.raw(`CONCAT('parent-', bidang_urusan.id_bidang_urusan) as value`),
            'bidang_urusan.icon as icon',
            Knex.raw(`
      COALESCE(
        JSON_ARRAYAGG(
          CASE
            WHEN statistics.id_statistic IS NOT NULL THEN
              JSON_OBJECT(
                'title', statistics.nama_statistic,
                'value', statistics.id_statistic
              )
            ELSE NULL
          END
        ),
        JSON_ARRAY()
      ) as children
    `)
        );
};

const motto = function () {

    return Knex('tb_motto').select('id','title', 'contents', 'images','createdAt');
};

const menu_ekosistem = function () {

    return Knex('tb_menu_ekosistem').select('id','category', 'sub_menu', 'linked','created_at');
};

const bioinfo = function () {

    return Knex('tb_bio').select('id', 'email', 'telpon', 'fax', 'alamat', 'luas', 'populasi', 'kepadatan', 'zona', 'kode_pos', 'facebook', 'instagram', 'linkedin', 'twitter');
};

module.exports = {
    satker,
    bidangUrusan,
    location,
    alamat,
    statistic,
    menu_ekosistem,
    motto,
    bioinfo
};

