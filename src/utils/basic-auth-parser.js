'use strict';

/*
    Basic authentication is a simple authentication scheme built into the HTTP protocol.
    The client sends HTTP requests with the Authorization header that contains the word Basic word
    followed by a space and a base64-encoded string username:password.
    For example, to authorize as demo / p@55w0rd the client would send
    Authorization: Basic ZGVtbzpwQDU1dzByZA==
*/


module.exports = function (authorizationHeaderValue) {

    if (!authorizationHeaderValue) {
        throw new Error('No authorization value');
    }

    if (typeof authorizationHeaderValue !== 'string') {
        throw new Error('Authorization value must be string');
    }

    /*
        menjadikan 2 bagian:
            part1 => Basic
            part2 => cHJpdnVzZXI6cmFoYXNpYQ==
    */
    const parts = authorizationHeaderValue.split(/\s+/);

    if (parts.length !== 2 || parts[0].toLowerCase() !== 'basic') {
        throw new Error('Bad authentication format');
    }

    const credentialsPart = Buffer.from(parts[1], 'base64').toString();

    // berisi format dengan pemisah titik dua: username:password
    const separator = credentialsPart.indexOf(':');

    if (separator === -1) {
        throw new Error('Bad credentials format');
    }

    const username = credentialsPart.slice(0, separator).trim();
    const password = credentialsPart.slice(separator + 1);

    return { username, password };

};
