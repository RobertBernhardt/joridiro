"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yup = __importStar(require("yup"));
const contest_model_1 = __importDefault(require("../models/contest.model"));
const contestValidator = {
    create: (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const schema = yup.object().shape({
                title: yup.string().required(),
                organizer_platform: yup.string().url("You must provide a valid url"),
                banner: yup.array().of(yup.object().shape({
                    name: yup.string().required(),
                    src: yup.string().required(),
                })),
                type: yup.string().required().oneOf(['SCORE', 'DEADLINE']),
                size: yup.string().required().oneOf(['SMALL', 'MEDIUM', 'LARGE', 'TEST']),
                score: yup.array().of(yup.object().shape({
                    name: yup.string().required(),
                    number: yup.number().required(),
                    points: yup.number().required(),
                    measuring_unit: yup.string().required(),
                    description: yup.string(),
                })).min(1, "You must provide at least 1 scoring criteria").max(3, "You can have a maximum of 3 scoring criterias").required("You must provide at least 1 scoring criteria"),
                questions: yup.array().of(yup.object().shape({
                    question: yup.string().required(),
                    answers: yup.array().of(yup.string().required()).min(2, "You must provide at least 2 answers").max(4, "You can have a maximum of 4 answers"),
                })),
                rules: yup.array().of(yup.string()),
                about_contest: yup.object().shape({
                    short_description: yup.string().required("Required"),
                    target_audience: yup.string(),
                    purpose: yup.string(),
                    how_to_win: yup.string(),
                    boost: yup.string(),
                    tags: yup.array().of(yup.string()).min(1, "Required"),
                }),
                requirements: yup.object().shape({
                    countriesFieldExists: yup.boolean().required("Required"),
                    roleFieldExists: yup.boolean().required("Required"),
                    roles: yup.array().of(yup.string()).when('roleFieldExists', {
                        is: true,
                        then: yup.array().of(yup.string()).required("Required").min(1, "Required")
                    }),
                    categoryFieldExists: yup.boolean().required("Required"),
                    categories: yup.array().of(yup.string()).when('categoryFieldExists', {
                        is: true,
                        then: yup.array().of(yup.string()).required("Required").min(1, "Required")
                    }),
                    countries: yup.array().of(yup.string()).when('countriesFieldExists', {
                        is: true,
                        then: yup.array().of(yup.string()).required("Required").min(1, "Required")
                    }),
                    additional: yup.array().of(yup.object().shape({
                        name: yup.string().required("Required"),
                        description: yup.string().required("Required"),
                    }))
                }),
                about_company: yup.object().shape({
                    name: yup.string(),
                    description: yup.string(),
                    logo: yup.string(),
                    link: yup.string().url("You must provide a valid url"),
                }),
            });
            yield schema.validate(data, { abortEarly: false });
            return { valid: true };
        }
        catch (err) {
            return { valid: false, data: err };
        }
    }),
    create_edit: (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const schema = yup.object().shape({
                banner: yup.string().required(),
                title: yup.string().required(),
                shortDescription: yup.string().required(),
                type: yup.string().required().oneOf(['SMALL', 'MEDIUM', 'LARGE', 'TEST']),
                scoreContest: yup.boolean().required(),
                company: yup.object().shape({
                    title: yup.string().required(),
                    link: yup.string().required(),
                    description: yup.string().required(),
                    logo: yup.string().required(),
                }),
                points: yup.array().of(yup.object().shape({
                    criteria_name: yup.string().required(),
                    criteria_conversion_factor: yup.number().required(),
                })).max(3).required(),
                about: yup.object().shape({
                    text: yup.array().of(yup.object().shape({
                        title: yup.string().required(),
                        description: yup.string().required(),
                    })),
                    media: yup.object().shape({
                        image: yup.string(),
                        video: yup.string(),
                    }),
                }),
                participantQuestions: yup.array().of(yup.object().shape({
                    question: yup.string(),
                    options: yup.array().of(yup.string().required()),
                })),
                requirements: yup.array().of(yup.string().required()),
                howToJoin: yup.array().of(yup.string().required()),
                rules: yup.array().of(yup.string().required()),
                boosts: yup.object().shape({
                    description: yup.string(),
                    list: yup.array().of(yup.string()),
                })
            });
            yield schema.validate(data, { abortEarly: false });
            return { valid: true };
        }
        catch (err) {
            return { valid: false, data: err.errors };
        }
    }),
    announce: (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const schema = yup.object().shape({
                announcement: yup.string().required(),
            });
            yield schema.validate(data, { abortEarly: false });
            return { valid: true };
        }
        catch (err) {
            return { valid: false, data: err.errors };
        }
    }),
    join: (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Yup validations for contestId and answers 
            const schema = yup.object().shape({
                contestId: yup.string().required(),
                answers: yup.array().of(yup.object().shape({
                    question: yup.string().required(),
                    answer: yup.string().required(),
                })).required()
            });
            // > Get the contest
            const contest = yield contest_model_1.default.findById(data.contestId);
            if (!contest) {
                return { valid: false, data: ['Contest not found'] };
            }
            // > Check if all the questions are answered using the contest's participantQuestions ids
            const contestQuestions = contest.questions.map((question) => question._id.toString());
            const answers = data.answers.map((answer) => answer.question);
            const difference = contestQuestions.filter((x) => !answers.includes(x));
            if (difference.length > 0) {
                return { valid: false, data: ['You must answer all the questions'] };
            }
            const res = yield schema.validate(data, { abortEarly: false });
            console.log(res);
            return { valid: true };
        }
        catch (err) {
            return { valid: false, data: err };
        }
    }),
    updatescore: (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const schema = yup.object().shape({
                id: yup.string().required(),
                score: yup.number().required()
            });
            yield schema.validate(data, { abortEarly: false });
            return { valid: true };
        }
        catch (err) {
            return { valid: false, data: err.errors };
        }
    })
};
exports.default = contestValidator;
