/* eslint-disable @hapi/capitalize-modules */
'use strict';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

// Master Data JSON
const tb_komponen = require('../default-data-json/tb_komponen.json');
const tb_opendata_artikel = require('../default-data-json/tb_opendata_artikel.json');
const tb_opendata_bantuan = require('../default-data-json/tb_opendata_bantuan.json');
const tb_opendata_dataset_download = require('../default-data-json/tb_opendata_dataset_download.json');
const tb_opendata_feedback = require('../default-data-json/tb_opendata_feedback.json');
const tb_opendata_iklan = require('../default-data-json/tb_opendata_iklan.json');
const tb_opendata_menu = require('../default-data-json/tb_opendata_menu.json');
const tb_opendata_setting = require('../default-data-json/tb_opendata_setting.json');
const tb_satupeta_artikel = require('../default-data-json/tb_satupeta_artikel.json');
const tb_satupeta_iklan = require('../default-data-json/tb_satupeta_iklan.json');
const tb_satupeta_location_maplist = require('../default-data-json/tb_satupeta_location_maplist.json');
const tb_satupeta_location_points = require('../default-data-json/tb_satupeta_location_points.json');
const tb_satupeta_locations = require('../default-data-json/tb_satupeta_locations.json');
const tb_satupeta_menu = require('../default-data-json/tb_satupeta_menu.json');
const tb_satupeta_setting = require('../default-data-json/tb_satupeta_setting.json');
const tb_satuportal_bio = require('../default-data-json/tb_satuportal_bio.json');
const tb_satuportal_iklan = require('../default-data-json/tb_satuportal_iklan.json');
const tb_satuportal_menu = require('../default-data-json/tb_satuportal_menu.json');
const tb_satuportal_pengumuman = require('../default-data-json/tb_satuportal_pengumuman.json');
const tb_satuportal_setting = require('../default-data-json/tb_satuportal_setting.json');
const tb_users = require('../default-data-json/tb_users.json');
const tb_sektor = require('../default-data-json/tb_sektor.json');
const tb_opd = require('../default-data-json/tb_opd.json');
const tb_kecamatan = require('../default-data-json/tb_kecamatan.json');
const tb_desa = require('../default-data-json/tb_desa.json');
const tb_desa_profil = require('../default-data-json/tb_desa_profil.json');

exports.seed = async function (knex) {

    // kosongkan dulu tabelnya biar tidak double
    await knex('tb_sektor').del();
    await knex('tb_opd').del();
    await knex('tb_kecamatan').del();
    await knex('tb_desa').del();
    await knex('tb_desa_profil').del();
    await knex('tb_komponen').del();
    await knex('tb_opendata_artikel').del();
    await knex('tb_opendata_bantuan').del();
    await knex('tb_opendata_dataset_download').del();
    await knex('tb_opendata_iklan').del();
    await knex('tb_opendata_menu').del();
    await knex('tb_opendata_setting').del();
    await knex('tb_satupeta_artikel').del();
    await knex('tb_satupeta_iklan').del();
    await knex('tb_satupeta_location_maplist').del();
    await knex('tb_satupeta_location_points').del();
    await knex('tb_satupeta_locations').del();
    await knex('tb_satupeta_menu').del();
    await knex('tb_satupeta_setting').del();
    await knex('tb_satuportal_bio').del();
    await knex('tb_satuportal_iklan').del();
    await knex('tb_satuportal_menu').del();
    await knex('tb_satuportal_pengumuman').del();
    await knex('tb_satuportal_setting').del();
    await knex('tb_users').del();

    // lalu insert dari JSON
    await knex('tb_sektor').insert(tb_sektor);
    await knex('tb_opd').insert(tb_opd);
    await knex('tb_kecamatan').insert(tb_kecamatan);
    await knex('tb_desa').insert(tb_desa);
    await knex('tb_desa_profil').insert(tb_desa_profil);
    await knex('tb_komponen').insert(tb_komponen);
    await knex('tb_opendata_artikel').insert(tb_opendata_artikel);
    await knex('tb_opendata_bantuan').insert(tb_opendata_bantuan);
    await knex('tb_opendata_dataset_download').insert(tb_opendata_dataset_download);
    await knex('tb_opendata_feedback').insert(tb_opendata_feedback);
    await knex('tb_opendata_iklan').insert(tb_opendata_iklan);
    await knex('tb_opendata_menu').insert(tb_opendata_menu);
    await knex('tb_opendata_setting').insert(tb_opendata_setting);
    await knex('tb_satupeta_artikel').insert(tb_satupeta_artikel);
    await knex('tb_satupeta_iklan').insert(tb_satupeta_iklan);
    await knex('tb_satupeta_location_maplist').insert(tb_satupeta_location_maplist);
    await knex('tb_satupeta_location_points').insert(tb_satupeta_location_points);
    await knex('tb_satupeta_locations').insert(tb_satupeta_locations);
    await knex('tb_satupeta_menu').insert(tb_satupeta_menu);
    await knex('tb_satupeta_setting').insert(tb_satupeta_setting);
    await knex('tb_satuportal_bio').insert(tb_satuportal_bio);
    await knex('tb_satuportal_iklan').insert(tb_satuportal_iklan);
    await knex('tb_satuportal_menu').insert(tb_satuportal_menu);
    await knex('tb_satuportal_pengumuman').insert(tb_satuportal_pengumuman);
    await knex('tb_satuportal_setting').insert(tb_satuportal_setting);
    await knex('tb_users').insert(tb_users);

};
