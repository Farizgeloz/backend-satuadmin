'use strict';

module.exports = {
    HOST: '0.0.0.0',                // bisa diisi dengan 0.0.0.0 agar bisa diakses di dalam satu jaringan
    PORT: 3000,
    PREFIX_ROUTE: '/api',               // bisa juga diisi semisal '/api/v1' untuk versioning
    DIRECTORY: {
        CWD: process.cwd(),
        SRC: __dirname,
        BASE_APP: process.cwd(),
        BASE_UPLOAD: require('path').join(__dirname, '/uploads')
    },
    MINIO_URL: 'https://s3.probolinggokab.go.id',
    MINIO_BUCKET: 'frontend-portal',
    MINIO_ACCESS_KEY: 'minioadmin',
    MINIO_SECRET_KEY: 'd3vmataprabulinggih',
    /* MINIO_URL: 'http://127.0.0.1:9000',
    MINIO_BUCKET: 'minio-sumberrezeki',
    MINIO_ACCESS_KEY: 'minioadmin',
    MINIO_SECRET_KEY: 'minioadmin', */
    JWT_SECRET: 'supersecret123',
    GITHUB_WEBHOOK_SECRET: 'webhooksecret456',
    hcaptchaSecret: process.env.HCAPTCHA_SECRET

};