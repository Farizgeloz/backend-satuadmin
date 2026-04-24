'use strict';

const { IANAZone } = require('luxon');

module.exports = (joi) => ({
    type: 'timezone',
    base: joi.string(),
    validate(value, helpers) {
        /********************************************************************************
         * return disini harus berupa object { value } or { value, errors }
         * Jika hanya return spt ini :
         * `return value`
         *          => Pada handler, value ini menjadi tidak exist.
         * `return helpers.error('timezone.invalid')`
         *          => Maka tidak akan terjadi pembatalan validasi & tidak keluar error.
         ********************************************************************************/

        if (IANAZone.isValidZone(value)) {
            return { value };
        }

        return { value, errors: helpers.error('timezone.invalid') };
    },
    messages: {
        'timezone.invalid': '{{#label}} harus sesuai format IANA timezone'
    }
});
