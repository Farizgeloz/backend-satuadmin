'use strict';

const Joi = require('joi');


module.exports = {

    view: {
        payload: Joi.object().keys({
            search_location: Joi.string().required(),
            search_kecamatan: Joi.string().required(),
            search_desa: Joi.string().required(),
            search_kunci: Joi.string().required()
        })

    },

    add: {
        payload: Joi.object().keys({
            email: Joi.string().required(),
            password: Joi.string().required(),
            confpassword: Joi.string().allow('', null),
            nick: Joi.string().required(),
            role: Joi.string().required(),
            name: Joi.string().allow('', null),
            opd_id: Joi.string().allow('', null),
            jabatan: Joi.string().allow('', null)
        })
    },

    edit: {
        payload: Joi.object().keys({
            password: Joi.string().allow('', null),
            confpassword: Joi.string().allow('', null),
            nick: Joi.string().required(),
            email: Joi.string().required(),
            role: Joi.string().required(),
            name: Joi.string().allow('', null),
            opd_id: Joi.string().allow('', null),
            jabatan: Joi.string().allow('', null)
        })


    },
    login: {
        payload: Joi.object().keys({
            email: Joi.string().required(),
            password: Joi.string().required()
        })
    }
};
