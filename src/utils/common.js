'use strict';

const { Buffer } = require('buffer');
const Bcrypt = require('bcrypt');
const Crypto = require('crypto');



const encodeBase64 = (data) => {
    // window.btoa('test')          => result: dGVzdA==
    return Buffer.from(data).toString('base64');

    // https://stackoverflow.com/a/70733727
    /*
        btoa(): accepts a string where each character represents an 8bit byte.
        If you pass a string containing characters that cannot be represented in 8 bits,
        it will probably break. Probably that's why btoa is deprecated.
     */
};

const decodeBase64 = (data) => {
    // window.atob('dGVzdA==')      => result: test
    return Buffer.from(data, 'base64').toString('ascii');

    // https://stackoverflow.com/a/70733727
    /*
        atob(): returns a string where each character represents an 8-bit byte.
     */
};

const encryptPassword = function (plain_password) {

    const saltRounds = 10;
    return Bcrypt.hashSync(plain_password, saltRounds);
};

const comparePassword = function (plain_password, hashed_password) {

    return Bcrypt.compareSync(plain_password, hashed_password);
};

const generateETag = function (data) {

    const hash = Crypto.createHash('sha256');
    hash.update(data.toString());
    return hash.digest('hex');
};


module.exports = {
    encodeBase64,
    decodeBase64,
    encryptPassword,
    comparePassword,
    generateETag
};
