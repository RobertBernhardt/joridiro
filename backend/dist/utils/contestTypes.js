"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contestTypes = new Map();
contestTypes.set('TEST', {
    name: 'Test',
    max_score: 100,
    grand_prize: 5000,
    days: 0.00694444,
    milestones: [
        {
            same_type: true,
            days: 0.00138889,
            points: 10,
            prize: 500
        },
        {
            same_type: true,
            days: 0.00277778,
            points: 30,
            prize: 1000
        },
        {
            same_type: true,
            days: 0.00416667,
            points: 50,
            prize: 1500
        }
    ],
    lottery_prize: 666,
    platform_fees: 829
});
contestTypes.set('SMALL', {
    name: 'Small',
    max_score: 5,
    grand_prize: 250,
    days: 7,
    milestones: [],
    lottery_prize: 0,
    platform_fees: 45
});
contestTypes.set('MEDIUM', {
    name: 'Medium',
    max_score: 25,
    grand_prize: 1500,
    days: 25,
    milestones: [{
            same_type: true,
            days: 7,
            points: 5,
            prize: 300
        }],
    lottery_prize: 222,
    platform_fees: 273
});
contestTypes.set('LARGE', {
    name: 'Large',
    max_score: 100,
    grand_prize: 5000,
    days: 45,
    milestones: [{
            same_type: true,
            days: 7,
            points: 10,
            prize: 500
        }, {
            same_type: true,
            days: 15,
            points: 30,
            prize: 1000
        },
        {
            same_type: true,
            days: 30,
            points: 50,
            prize: 1500
        }
    ],
    lottery_prize: 666,
    platform_fees: 829
});
exports.default = contestTypes;
