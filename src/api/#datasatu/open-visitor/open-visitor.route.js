'use strict';

const OpenVisitorHandler = require('./open-visitor.handler');
const OpenVisitorValidation = require('./open-visitor.validation');

/*** WHAT DO HERE
 * - saving error report (>=500) via  onPreResponse
 */
exports.plugin = {
    name: 'OpenVisitorRoute',
    register: (server, options) => {

        server.route({

            method: 'POST',
            path: '/satuportal_visitor/visitor',
            handler: OpenVisitorHandler.logSatuportalVisitor
        });

        server.route({

            method: 'GET',
            path: '/satuportal_visitor/count',
            handler: OpenVisitorHandler.getSatuportalCountVisitor
        });

        server.route({

            method: 'POST',
            path: '/opendata_visitor/visitor',
            handler: OpenVisitorHandler.logOpendataVisitor
        });

        server.route({

            method: 'GET',
            path: '/opendata_visitor/count',
            handler: OpenVisitorHandler.getOpendataCountVisitor
        });

        server.route({

            method: 'POST',
            path: '/satupeta_visitor/visitor',
            handler: OpenVisitorHandler.logSatupetaVisitor
        });

        server.route({

            method: 'GET',
            path: '/satupeta_visitor/count',
            handler: OpenVisitorHandler.getSatupetaCountVisitor
        });

        
    }
};
