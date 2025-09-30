'use strict';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function (knex) {

    return Promise.all([

        knex.schema.hasTable('error_report').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('error_report', (table) => {

                    table.increments('id').primary().notNullable();
                    table.string('name', 50).notNullable().index();
                    table.text('data').notNullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                })
                    .then(() => console.info('\x1b[33m error_report has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_komponen').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_komponen', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.string('kategori', 255).notNullable().index();
                    table.string('title',255).notNullable().index();
                    table.text('contents', 'longtext').nullable(); // di MySQL bisa atur jenis: tinytext, text, mediumtext, longtext
                    table.string('logo_a',255).nullable();
                    table.string('logo_b',255).nullable();
                    table.string('logo_c',255).nullable();
                    table.string('images_a',255).nullable();
                    table.string('images_b',255).nullable();
                    table.string('images_c',255).nullable();
                    table.string('title_images_a',50).nullable();
                    table.string('title_images_b',50).nullable();
                    table.string('title_images_c',50).nullable();
                    table.string('document',100).nullable();
                    table.string('linked',255).nullable();
                    table.string('color_code',10).nullable();
                    table.string('visibilitas',20).nullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m komponen has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_opendata_artikel').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_opendata_artikel', (table) => {

                    table.increments('id_artikel').unsigned().primary().notNullable();
                    table.string('title',255).notNullable().index();
                    table.text('content_a', 'longtext').nullable(); // di MySQL bisa atur jenis: tinytext, text, mediumtext, longtext
                    table.string('images_a',255).nullable();
                    table.text('content_b', 'longtext').nullable(); // di MySQL bisa atur jenis: tinytext, text, mediumtext, longtext
                    table.string('images_b',255).nullable();
                    table.text('content_c', 'longtext').nullable(); // di MySQL bisa atur jenis: tinytext, text, mediumtext, longtext
                    table.string('images_c',255).nullable();
                    table.string('download_file', 255).nullable(); // di MySQL bisa atur jenis: tinytext, text, mediumtext, longtext
                    table.string('sumber',255).nullable();
                    table.string('admin',50).nullable();
                    table.string('visibilitas',10).nullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_opendata_artikel has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_opendata_bantuan').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_opendata_bantuan', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.string('kategori',50).notNullable().index();
                    table.string('seksi',50).nullable();
                    table.string('title',50).notNullable();
                    table.text('content', 'longtext').nullable(); // di MySQL bisa atur jenis: tinytext, text, mediumtext, longtext
                    table.string('image',100).nullable();
                    table.string('admin',50).nullable();
                    table.string('visibilitas',10).nullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_opendata_bantuan has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_opendata_dataset_download').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_opendata_dataset_download', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.bigInteger('id_dataset',20).notNullable().index();
                    table.string('ip_address',50).nullable();
                    table.text('user_agent', 'longtext').nullable();
                    table.date('visited_at').defaultTo(knex.fn.now());
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_opendata_dataset_download has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_opendata_dataset_visitors').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_opendata_dataset_visitors', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.bigInteger('id_dataset',20).notNullable().index();
                    table.string('ip_address',50).nullable();
                    table.text('user_agent', 'longtext').nullable();
                    table.date('visited_at').defaultTo(knex.fn.now());
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_opendata_dataset_visitors has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_opendata_feedback').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_opendata_feedback', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.string('ip_address',50).nullable();
                    table.text('user_agent', 'longtext').nullable();
                    table.string('tujuan',100).nullable();
                    table.string('posisi',100).nullable();
                    table.string('visibilitas',10).nullable();
                    table.text('feedback', 'longtext').nullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_opendata_feedback has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_opendata_iklan').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_opendata_iklan', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.string('title',100).notNullable();
                    table.string('images',100).nullable();
                    table.string('visibilitas',10).nullable();
                    table.string('linked',100).nullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_opendata_iklan has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_opendata_menu').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_opendata_menu', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.string('category',50).notNullable();
                    table.string('sub_menu',100).nullable();
                    table.string('linked',100).notNullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_opendata_menu has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_opendata_setting').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_opendata_setting', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.string('bg_header',10).nullable();
                    table.string('bg_body',10).nullable();
                    table.string('bg_title',10).nullable();
                    table.string('bg_content',10).nullable();
                    table.string('bg_content2',10).nullable();
                    table.string('bg_content3',10).nullable();
                    table.string('bg_input',10).nullable();
                    table.string('bg_footer',10).nullable();
                    table.string('color_title',10).nullable();
                    table.string('color_date',10).nullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_opendata_setting has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_opendata_visitors').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_opendata_visitors', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.string('ip_address',50).nullable();
                    table.text('user_agent', 'longtext').nullable();
                    table.date('visited_at').defaultTo(knex.fn.now());
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_opendata_visitors has been created \x1b[0m'));
            }
        }),

        //---------SATUPETA-------------

        knex.schema.hasTable('tb_satupeta_artikel').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_satupeta_artikel', (table) => {

                    table.increments('id_artikel').unsigned().primary().notNullable();
                    table.string('title',255).notNullable().index();
                    table.text('content_a', 'longtext').nullable(); // di MySQL bisa atur jenis: tinytext, text, mediumtext, longtext
                    table.string('images_a',255).nullable();
                    table.text('content_b', 'longtext').nullable(); // di MySQL bisa atur jenis: tinytext, text, mediumtext, longtext
                    table.string('images_b',255).nullable();
                    table.text('content_c', 'longtext').nullable(); // di MySQL bisa atur jenis: tinytext, text, mediumtext, longtext
                    table.string('images_c',255).nullable();
                    table.string('download_file', 255).nullable(); // di MySQL bisa atur jenis: tinytext, text, mediumtext, longtext
                    table.string('sumber',255).nullable();
                    table.string('admin',50).nullable();
                    table.string('visibilitas',10).nullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_satupeta_artikel has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_satupeta_feedback').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_satupeta_feedback', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.string('ip_address',50).nullable();
                    table.text('user_agent', 'longtext').nullable();
                    table.string('tujuan',100).nullable();
                    table.string('posisi',100).nullable();
                    table.string('visibilitas',10).nullable();
                    table.text('feedback', 'longtext').nullable();
                    table.string('admin',50).nullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_opendata_feedback has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_satupeta_iklan').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_satupeta_iklan', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.string('title',100).notNullable();
                    table.string('images',100).nullable();
                    table.string('visibilitas',10).nullable();
                    table.string('linked',100).nullable();
                    table.string('admin',50).nullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_satupeta_iklan has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_satupeta_locations').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_satupeta_locations', (table) => {

                    table.increments('id_location').unsigned().primary().notNullable();
                    table.string('nama_location', 255).notNullable();
                    table.integer('satker_id').unsigned().notNullable();
                    table.integer('sektor_id').unsigned().notNullable();
                    table.string('admin', 50).notNullable().defaultTo('');
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table
                        .timestamp('updated_at')
                        .notNullable()
                        .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

                    // Indexes
                    table.index('nama_location', 'locations_nama_location_index');
                    table.index('satker_id', 'locations_satker_id_foreign');
                    table.index('sektor_id', 'locations_bidang_urusan_id_foreign');

                    // Foreign keys
                    table
                        .foreign('sektor_id')
                        .references('id_sektor')
                        .inTable('tb_sektor')
                        .onDelete('NO ACTION')
                        .onUpdate('NO ACTION');

                    table
                        .foreign('satker_id')
                        .references('id_opd')
                        .inTable('tb_opd')
                        .onDelete('NO ACTION')
                        .onUpdate('NO ACTION');
                })
                    .then(() =>
                        console.info('\x1b[33m tb_satupeta_locations has been created \x1b[0m')
                    );
            }
        }),
        knex.schema.hasTable('tb_satupeta_location_maplist').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_satupeta_location_maplist', (table) => {

                    table.increments('id_maplist').unsigned().primary().notNullable();
                    table.string('koleksi_data', 50).notNullable();
                    table.string('title', 255).notNullable();
                    table.integer('satker_id').unsigned().notNullable();
                    table.integer('sektor_id').unsigned().notNullable();
                    table.integer('location_id').notNullable();
                    table.specificType('tahun_rilis', 'year').notNullable(); // pakai YEAR biar sesuai MySQL
                    table.string('tipe', 255).notNullable();
                    table.string('pengukuran', 255).notNullable();
                    table.string('periode', 255).nullable();
                    table.text('deskripsi').notNullable();
                    table.string('images', 255).nullable();
                    table.string('visibilitas', 20).nullable();
                    table.string('admin', 50).nullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table
                        .timestamp('updated_at')
                        .notNullable()
                        .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

                    // Indexes
                    table.index('location_id', 'idx_maplist_location');
                    table.index('satker_id', 'idx_maplist_satker');
                    table.index('sektor_id', 'idx_maplist_sektor');

                    // Foreign keys
                    table
                        .foreign('sektor_id')
                        .references('id_sektor')
                        .inTable('tb_sektor')
                        .onDelete('NO ACTION')
                        .onUpdate('NO ACTION');

                    table
                        .foreign('satker_id')
                        .references('id_opd')
                        .inTable('tb_opd')
                        .onDelete('NO ACTION')
                        .onUpdate('NO ACTION');
                })
                    .then(() =>
                        console.info('\x1b[33m tb_satupeta_location_maplist has been created \x1b[0m')
                    );
            }
        }),

        knex.schema.hasTable('tb_satupeta_location_maplist_download').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_satupeta_location_maplist_download', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.integer('id_maplist',20).notNullable;
                    table.string('ip_address',50).nullable();
                    table.text('user_agent', 'longtext').nullable();
                    table.date('visited_at').defaultTo(knex.fn.now());
                    table.string('admin',50).nullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_satupeta_location_maplist_download has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_satupeta_location_maplist_visitors').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_satupeta_location_maplist_visitors', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.integer('id_maplist',20).notNullable;
                    table.string('ip_address',50).nullable();
                    table.text('user_agent', 'longtext').nullable();
                    table.date('visited_at').defaultTo(knex.fn.now());
                    table.string('admin',50).nullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_satupeta_location_maplist_visitors has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_satupeta_location_points').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_satupeta_location_points', (table) => {

                    table.increments('id_location_point').primary().notNullable();
                    table.string('nama_location_point', 255).notNullable();
                    table.text('coordinat').nullable();
                    table.integer('location_id', 10).notNullable();
                    table.integer('kecamatan_id', 6).unsigned().notNullable();
                    table.bigInteger('desa_id').notNullable();

                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table
                        .timestamp('updated_at')
                        .notNullable()
                        .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

                    // Index
                    table.index('kecamatan_id', 'idx_location_points_kecamatan');
                    table.index('desa_id', 'idx_location_points_desa');

                    // Foreign keys
                    table
                        .foreign('kecamatan_id')
                        .references('id_kecamatan')
                        .inTable('tb_kecamatan')
                        .onDelete('NO ACTION')
                        .onUpdate('NO ACTION');

                    table
                        .foreign('desa_id')
                        .references('id_desa')
                        .inTable('tb_desa')
                        .onDelete('NO ACTION')
                        .onUpdate('NO ACTION');
                })
                    .then(() => console.info('\x1b[33m tb_satupeta_location_points has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_satupeta_menu').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_satupeta_menu', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.string('category',50).notNullable();
                    table.string('sub_menu',100).nullable();
                    table.string('linked',100).notNullable();
                    table.string('admin',50).nullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_satupeta_menu has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_satupeta_setting').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_satupeta_setting', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.string('bg_header',10).nullable();
                    table.string('bg_body',10).nullable();
                    table.string('bg_title',10).nullable();
                    table.string('bg_content',10).nullable();
                    table.string('bg_content2',10).nullable();
                    table.string('bg_content3',10).nullable();
                    table.string('bg_input',10).nullable();
                    table.string('bg_footer',10).nullable();
                    table.string('color_title',10).nullable();
                    table.string('color_date',10).nullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_satupeta_setting has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_satupeta_visitors').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_satupeta_visitors', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.string('ip_address',50).nullable();
                    table.text('user_agent', 'longtext').nullable();
                    table.date('visited_at').defaultTo(knex.fn.now());
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_satupeta_visitors has been created \x1b[0m'));
            }
        }),

        knex.schema.hasTable('tb_satuportal_bio').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_satuportal_bio', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.string('email',50).nullable();
                    table.string('telpon',20).nullable();
                    table.string('fax',20).nullable();
                    table.text('alamat','longtext').nullable();
                    table.string('luas',20).nullable();
                    table.string('populasi',50).nullable();
                    table.string('kepadatan',50).nullable();
                    table.string('zona',50).nullable();
                    table.string('kode_pos',50).nullable();
                    table.string('instagram',100).nullable();
                    table.string('linkedin',100).nullable();
                    table.string('facebook',100).nullable();
                    table.string('whatapp',50).nullable();
                    table.string('twitter',100).nullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_satuportal_bio has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_satuportal_iklan').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_satuportal_iklan', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.string('title',100).notNullable();
                    table.string('images',100).nullable();
                    table.string('visibilitas',10).nullable();
                    table.string('linked',100).nullable();
                    table.string('admin',50).nullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_satuportal_iklan has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_satuportal_menu').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_satuportal_menu', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.string('category',50).notNullable();
                    table.string('sub_menu',100).nullable();
                    table.string('linked',100).notNullable();
                    table.string('admin',50).nullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_satuportal_menu has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_satuportal_pengumuman').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_satuportal_pengumuman', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.string('title',100).notNullable();
                    table.text('content','longtext').nullable();
                    table.string('linked',100).notNullable();
                    table.string('visibilitas',10).nullable();
                    table.string('admin',50).nullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_satuportal_pengumuman has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_satuportal_setting').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_satuportal_setting', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.string('bg_header',10).nullable();
                    table.string('bg_body',10).nullable();
                    table.string('bg_title',10).nullable();
                    table.string('bg_content',10).nullable();
                    table.string('bg_content2',10).nullable();
                    table.string('bg_content3',10).nullable();
                    table.string('bg_input',10).nullable();
                    table.string('bg_footer',10).nullable();
                    table.string('color_title',10).nullable();
                    table.string('color_date',10).nullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_satuportal_setting has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_satuportal_visitors').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_satuportal_visitors', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.string('ip_address',50).nullable();
                    table.text('user_agent', 'longtext').nullable();
                    table.date('visited_at').defaultTo(knex.fn.now());
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_satuportal_visitors has been created \x1b[0m'));
            }
        }),

        knex.schema.hasTable('tb_users').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_users', (table) => {

                    table.increments('id').unsigned().primary().notNullable();
                    table.string('uuid', 255).nullable();
                    table.string('name', 100).nullable();
                    table.string('nick', 50).nullable();
                    table.string('email', 50).nullable();
                    table.string('password', 255).nullable(); // 🔑 biasanya password perlu lebih panjang (hash bcrypt bisa sampai 60+)
                    table.string('role', 50).nullable();
                    table.string('opd_id', 10).nullable();
                    table.string('jabatan', 50).nullable();
                    table.string('admin', 50).nullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table
                        .timestamp('updated_at')
                        .notNullable()
                        .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m tb_users has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_kecamatan').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_kecamatan', (table) => {

                    table.integer('id_kecamatan', 6).unsigned().primary().notNullable();
                    table.string('nama_kecamatan', 50).notNullable();
                    table.text('geojson', 'mediumtext').nullable();
                    table.string('map_color', 20).notNullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table
                        .timestamp('updated_at')
                        .notNullable()
                        .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

                    // Index
                    table.index('nama_kecamatan', 'kecamatan_nama_kecamatan_index');
                })
                    .then(() =>
                        console.info('\x1b[33m tb_kecamatan has been created \x1b[0m')
                    );
            }
        }),
        knex.schema.hasTable('tb_kecamatan_profil').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_kecamatan_profil', (table) => {

                    table.increments('id_profil_kecamatan').unsigned().primary().notNullable();
                    table.string('nama_camat', 255);
                    table.string('nohp_camat', 255);
                    table.string('kategori_kecamatan', 255);
                    table.string('luas_kecamatan', 255);
                    table.integer('kecamatan_id', 6).unsigned().notNullable()
                        .references('id_kecamatan')
                        .inTable('tb_kecamatan')
                        .onUpdate('RESTRICT')
                        .onDelete('RESTRICT');
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m profil_kecamatan has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_desa_profil').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_desa_profil', (table) => {

                    table.increments('id_profil_desa').unsigned().primary().notNullable();
                    table.string('nama_kades', 255);
                    table.string('nohp_kades', 255);
                    table.string('kategori_desa', 255);
                    table.string('luas_desa', 255);
                    table.integer('kecamatan_id', 6).unsigned().notNullable()
                        .references('id_kecamatan')
                        .inTable('tb_kecamatan')
                        .onUpdate('RESTRICT')
                        .onDelete('RESTRICT');
                    table.bigInteger('desa_id').notNullable()
                        .references('id_desa')
                        .inTable('tb_desa')
                        .onUpdate('RESTRICT')
                        .onDelete('RESTRICT');
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m profil_desa has been created \x1b[0m'));
            }
        }),
        knex.schema.hasTable('tb_desa').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_desa', (table) => {

                    table.bigInteger('id_desa').primary().notNullable();
                    table.integer('kecamatan_id', 6).unsigned().notNullable();
                    table.string('nama_desa', 50).notNullable();
                    table.text('geojson', 'mediumtext').nullable();
                    table.string('map_color', 20).notNullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table
                        .timestamp('updated_at')
                        .notNullable()
                        .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

                    // Index
                    table.index('kecamatan_id', 'desa_kecamatan_id_foreign');

                    // Foreign key
                    table
                        .foreign('kecamatan_id')
                        .references('id_kecamatan')
                        .inTable('tb_kecamatan')
                        .onDelete('NO ACTION')
                        .onUpdate('NO ACTION');
                })
                    .then(() =>
                        console.info('\x1b[33m tb_desa has been created \x1b[0m')
                    );
            }
        }),
        knex.schema.hasTable('tb_opd').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_opd', (table) => {

                    table.increments('id_opd').unsigned().primary().notNullable();
                    table.string('nama_opd', 255).notNullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table
                        .timestamp('updated_at')
                        .notNullable()
                        .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

                    // Index
                    table.index('nama_opd', 'satker_nama_satker_index');
                })
                    .then(() =>
                        console.info('\x1b[33m tb_opd has been created \x1b[0m')
                    );
            }
        }),
        knex.schema.hasTable('tb_sektor').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('tb_sektor', (table) => {

                    table.increments('id_sektor').unsigned().primary().notNullable();
                    table.string('nama_sektor', 50).notNullable();
                    table.string('color_code', 50).notNullable();
                    table.string('icon', 50).notNullable();
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table
                        .timestamp('updated_at')
                        .notNullable()
                        .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

                    // Index
                    table.index('nama_sektor', 'bidang_urusan_nama_bidang_urusan_index');
                })
                    .then(() =>
                        console.info('\x1b[33m tb_sektor has been created \x1b[0m')
                    );
            }
        }),
        knex.schema.hasTable('jabatan').then((exists) => {

            if (!exists) {
                return knex.schema.createTable('jabatan', (table) => {

                    table.increments('id_jabatan').unsigned().primary().notNullable();
                    table.string('nama_jabatan', 255);
                    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
                })
                    .then(() => console.info('\x1b[33m jabatan has been created \x1b[0m'));
            }
        })
    ]);

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {

    return Promise.all([
        knex.schema.dropTableIfExists('error_report'),
        knex.schema.dropTableIfExists('tb_komponen'),
        knex.schema.dropTableIfExists('tb_opendata_artikel'),
        knex.schema.dropTableIfExists('tb_opendata_bantuan'),
        knex.schema.dropTableIfExists('tb_opendata_dataset_download'),
        knex.schema.dropTableIfExists('tb_opendata_dataset_visitors'),
        knex.schema.dropTableIfExists('tb_opendata_feedback'),
        knex.schema.dropTableIfExists('tb_opendata_iklan'),
        knex.schema.dropTableIfExists('tb_opendata_menu'),
        knex.schema.dropTableIfExists('tb_opendata_setting'),
        knex.schema.dropTableIfExists('tb_opendata_visitors'),
        knex.schema.dropTableIfExists('tb_satupeta_artikel'),
        knex.schema.dropTableIfExists('tb_satupeta_feedback'),
        knex.schema.dropTableIfExists('tb_satupeta_iklan'),
        knex.schema.dropTableIfExists('tb_satupeta_locations'),
        knex.schema.dropTableIfExists('tb_satupeta_location_maplist'),
        knex.schema.dropTableIfExists('tb_satupeta_location_maplist_download'),
        knex.schema.dropTableIfExists('tb_satupeta_location_maplist_visitors'),
        knex.schema.dropTableIfExists('tb_satupeta_location_points'),
        knex.schema.dropTableIfExists('tb_satupeta_menu'),
        knex.schema.dropTableIfExists('tb_satupeta_setting'),
        knex.schema.dropTableIfExists('tb_satupeta_visitors'),
        knex.schema.dropTableIfExists('tb_satuportal_bio'),
        knex.schema.dropTableIfExists('tb_satuportal_iklan'),
        knex.schema.dropTableIfExists('tb_satuportal_menu'),
        knex.schema.dropTableIfExists('tb_satuportal_pengumuman'),
        knex.schema.dropTableIfExists('tb_satuportal_setting'),
        knex.schema.dropTableIfExists('tb_satuportal_visitors'),
        knex.schema.dropTableIfExists('tb_kecamatan'),
        knex.schema.dropTableIfExists('tb_kecamatan_profil'),
        knex.schema.dropTableIfExists('tb_desa'),
        knex.schema.dropTableIfExists('tb_desa_profil'),
        knex.schema.dropTableIfExists('tb_opd'),
        knex.schema.dropTableIfExists('tb_sektor'),
        knex.schema.dropTableIfExists('jabatan')
    ]);
};
