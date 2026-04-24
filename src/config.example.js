'use strict';

module.exports = {
    HOST: '0.0.0.0',                // bisa diisi dengan 0.0.0.0 agar bisa diakses di dalam satu jaringan
    PORT: 3010,
    PREFIX_ROUTE: '',               // bisa juga diisi semisal '/api/v1' untuk versioning
    DIRECTORY: {
        CWD: process.cwd(),
        SRC: __dirname,
        BASE_APP: process.cwd(),
        BASE_UPLOAD: require('path').join(__dirname, '/uploads')
    },
    JWT_SECRET: 'GANTI-GANTI-VERY-VERY-SECRET'
};
