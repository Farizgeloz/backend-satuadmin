'use strict';

const Knex = require('../database');
const Ip = require('ip');
const GeoipLite = require('geoip-lite');


/*** WHAT DO HERE
 * - check db by show info timezone of db
 * - request.app = { visitorInfo }
 * - in dev mode
 *   > reformat Boom 500
 *   > custom error mysql
 */
exports.plugin = {
    name: 'main-app',
    register: function (server, options) {

        server.ext('onPreStart', internals.onPreStart);

        server.ext('onRequest', internals.onRequest);
        server.ext('onCredentials', internals.onCredentials);
        server.ext('onPreHandler', internals.onPreHandler);
        server.ext('onPreResponse', internals.onPreResponse);
    }
};


const internals = {

    onPreStart: async () => {
        /*** DISINI BISA DIGUNAKAN UNTUK
         * - pengecekan dependency yang harus ada/running, ex: db enggine, image manipulation tool, dll
         * - inisialisasi
         */

        console.info();
        console.info('========================================================================');
        await Knex.select(Knex.raw('TIMEDIFF(NOW(), UTC_TIMESTAMP) as timezone')).first()
            .then(({ timezone }) => {

                console.info('\x1b[33m Database timezone: \x1b[92m', timezone, '\x1b[0m');
            });

    },

    onRequest: (request, h) => {

        request.app.visitorInfo = getVisitorInfo(request);

        return h.continue;
    },

    onCredentials: (request, h) => {

        return h.continue;
    },

    onPreHandler: (request, h) => {

        return h.continue;
    },

    onPreResponse: (request, h) => {


        if (request.response.isBoom) {

            /* KHUSUS DEV MODE */
            if (process.env.NODE_ENV === 'development') {

                /* request.response.isServer alias request.response.output.statusCode >= 500 */
                if (
                    request.response.output.statusCode === 500 &&
                    request.response.isServer
                ) {
                    // expose message statusCode 500 in dev mode
                    request.response?.reformat(true);
                }

            }



            /* custom msg "Insufficient scope" from hapijs */
            if (
                request.response.output.statusCode === 403 &&
                request.response.output.payload.message === 'Insufficient scope'
            ) {
                request.response.output.payload.message = 'Ops, Anda tidak memiliki hak untuk mengakses';
            }

        }


        return h.continue;
    }
};

const getVisitorInfo = function (request) {

    /*** BUILD VISITOR INFO FROM INTERNAL HAPI SOURCE */
    const userAgent = request.headers['user-agent'];
    const remoteAddress = request.info.remoteAddress;
    const xForwardedFor = request.headers['x-forwarded-for'];
    const referer = request.headers.referer;
    // const referrer = request.info.referrer ? request.info.referrer : undefined;

    let clientInfo;
    if (request.headers['x-client-info']) {
        try {
            clientInfo = JSON.parse(Buffer.from(request.headers['x-client-info'], 'base64').toString());
        }
        catch (e) {
            // empty
        }
    }


    /*** PERLU PENDEFINISIAN ULANG IP ADDRESS VISITOR, DIKARENAKAN
     * - Browser yg tertanam proxy, spt chrome dengan ext "Data Saver", dll yg menggunakan proxy dengan IP yang berubah-ubah.
     * - Konfigurasi Web Server (Apache / Nginx), yang mengaktifkan "reserve proxy" sehingga clientIp (remoteAddress) selalu 127.0.0.1.
    */
    let clientIp = remoteAddress;
    let proxiesIp = [];

    if (typeof xForwardedFor === 'string') {
        proxiesIp = xForwardedFor.split(',').map((i) => i.trim());
        clientIp = proxiesIp.shift();

        // jika clientIp masih 127.0.0.1 / seperti digunakan pada ppdb-admin
        if (Ip.isEqual(clientIp, '127.0.0.1') && proxiesIp.length > 0) {
            // ini agar tidak terjadi limiter memblokir localhost
            clientIp = proxiesIp.shift();
        }

        // jika tidak berada dibalik web server / load balancer
        if (!Ip.isEqual(remoteAddress, '127.0.0.1')) {
            proxiesIp.unshift(remoteAddress);
        }
    }

    if (proxiesIp.length < 1) {
        proxiesIp = undefined;
    }

    /*** GEO INFO FROM IP */
    let geoClientIp;
    if (!Ip.isPrivate(clientIp)) {
        // GeoipLite.lookup bisa return null => TypeError: Cannot destructure property. Perlu Nullish coalescing operator (??)
        const { country, region, city } = GeoipLite.lookup(clientIp) ?? {};
        geoClientIp = { country, region, city };
    }

    /*** BUILD VISITOR IDENTIFIER */
    const ipSubnet = Ip.cidrSubnet(`${clientIp}/16`);   //note: /16 => 255.255.0.0   ||   /24 => 255.255.255.0
    const visitorId = {
        clientNetwork: `${ipSubnet.networkAddress}/${ipSubnet.subnetMaskLength}`,
        clientIp,
        userAgent
    };
    const identifier = Buffer.from(JSON.stringify(visitorId)).toString('base64');

    return {
        clientIp,
        proxiesIp,
        remoteAddress,
        xForwardedFor,
        userAgent,
        referer,
        geoClientIp,
        identifier,
        ...clientInfo
    };

};
