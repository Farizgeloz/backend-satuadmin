'use strict';

const { DateTime } = require('luxon');

module.exports = (joi) => ({
    type: 'date',
    base: joi.date(),
    // overrides: {
    //   min: undefined,
    //   max: undefined,
    //   less: undefined,
    //   greater: undefined
    // },
    rules: {
        compareFromNow: {
            method: false,
            validate(value, helpers, { amount, unit }, { name, operator, args }) {

                const to = amount && unit ? DateTime.now().plus({ [unit]: amount }) : DateTime.now();

                if (Compare(value.getTime(), operator, to.valueOf())) {
                    return value;
                }

                return helpers.error('date.' + name, { limit: to.toJSDate().toISOString() });
            }
        },
        compareToday: {
            method: false,
            validate(value, helpers, args, { name, operator }) {
                // ensure not include time
                const valueTobeValidate = new Date(value);
                const today = new Date();

                // set time to zero
                valueTobeValidate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);

                if (Compare(valueTobeValidate.getTime(), operator, today.getTime())) {

                    return value;
                }

                return helpers.error('date.' + name);
            }
        },
        minFromNow: {
            method(amount, unit) {

                return this.$_addRule({ name: 'minFromNow', method: 'compareFromNow', args: { amount, unit }, operator: '>=' });
            },
            args: [
                {
                    name: 'amount',
                    ref: false,
                    assert: joi
                        .number()
                        .negative()
                        .required()
                },
                {
                    name: 'unit',
                    ref: false,
                    assert: joi
                        .string()
                        .valid('years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds')
                        .required()
                }
            ]
        },
        maxFromNow: {
            method(amount, unit) {

                return this.$_addRule({ name: 'maxFromNow', method: 'compareFromNow', args: { amount, unit }, operator: '<=' });
            },
            args: [
                {
                    name: 'amount',
                    ref: false,
                    assert: joi
                        .number()
                        .positive()
                        .required()
                },
                {
                    name: 'unit',
                    ref: false,
                    assert: joi
                        .string()
                        .valid('years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds')
                        .required()
                }
            ]
        },
        lessFromNow: {
            method(amount, unit) {

                return this.$_addRule({ name: 'lessFromNow', method: 'compareFromNow', args: { amount, unit }, operator: '<' });
            },
            args: [
                {
                    name: 'amount',
                    ref: false,
                    assert: joi
                        .number()
                        .positive()
                        .required()
                },
                {
                    name: 'unit',
                    ref: false,
                    assert: joi
                        .string()
                        .valid('years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds')
                        .required()
                }
            ]
        },
        greaterFromNow: {
            method(amount, unit) {

                return this.$_addRule({ name: 'greaterFromNow', method: 'compareFromNow', args: { amount, unit }, operator: '>' });
            },
            args: [
                {
                    name: 'amount',
                    ref: false,
                    assert: joi
                        .number()
                        .negative()
                        .required()
                },
                {
                    name: 'unit',
                    ref: false,
                    assert: joi
                        .string()
                        .valid('years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds')
                        .required()
                }
            ]
        },
        minToday: {
            method() {

                return this.$_addRule({ name: 'minToday', method: 'compareToday', operator: '>=' });
            }
        },
        maxToday: {
            method() {

                return this.$_addRule({ name: 'maxToday', method: 'compareToday', operator: '<=' });
            }
        },
        lessToday: {
            method() {

                return this.$_addRule({ name: 'lessToday', method: 'compareToday', operator: '<' });
            }
        },
        greaterToday: {
            method() {

                return this.$_addRule({ name: 'greaterToday', method: 'compareToday', operator: '>' });
            }
        }
    },
    messages: {
        'date.minFromNow': '{{#label}} harus lebih besar dari atau sama dengan tanggal {{#limit}}',
        'date.maxFromNow': '{{#label}} harus kurang dari atau sama dengan tanggal {{#limit}}',
        'date.lessFromNow': '{{#label}} harus kurang dari tanggal {{#limit}}',
        'date.greaterFromNow': '{{#label}} harus lebih besar dari tanggal {{#limit}}',

        'date.minToday': '{{#label}} harus lebih besar dari atau sama dengan hari ini',
        'date.maxToday': '{{#label}} harus kurang dari atau sama dengan hari ini',
        'date.lessToday': '{{#label}} harus kurang dari hari ini',
        'date.greaterToday': '{{#label}} harus lebih besar dari hari ini'
    }
});

const Compare = function (a, operator, b) {

    switch (operator) {
        case '>':
            return a > b;
        case '<':
            return a < b;
        case '>=':
            return a >= b;
        case '<=':
            return a <= b;
    }
};
