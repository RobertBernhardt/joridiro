"use strict";
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
const contest_model_1 = __importDefault(require("../models/contest.model"));
const cron_model_1 = __importDefault(require("../models/cron.model"));
const node_schedule_1 = __importDefault(require("node-schedule"));
const endDeadlineMilestone = (contestID, milestoneID) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const contest = yield contest_model_1.default.findById(contestID);
        contest.milestones = [...(_a = contest === null || contest === void 0 ? void 0 : contest.milestones) === null || _a === void 0 ? void 0 : _a.map((milestone) => {
                if (milestone.participants_reached.length > 0)
                    return milestone;
                if (milestone._id.toString() == milestoneID.toString()) {
                    milestone.participants_reached = contest.participants.map((participant) => participant._id);
                    return milestone;
                }
                return milestone;
            })];
        // > Delete the milestone from the cron
        const cron = yield cron_model_1.default.findById(new Date().setHours(0, 0, 0, 0));
        yield contest.save();
        if (cron) {
            cron.contests = cron.contests.filter((contest) => contest.milestone_id ? contest.milestone_id.toString() != milestoneID : true);
        }
        // If cron.contests is empty delete the cron
        if (cron.contests.length === 0) {
            console.log("HERE");
            yield cron_model_1.default.findByIdAndDelete(new Date().setHours(0, 0, 0, 0));
            console.log("HERE 2");
        }
        else {
            yield cron.save();
        }
    }
    catch (err) {
        console.log(err);
    }
});
const endDeadlineContest = (contestID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contest = yield contest_model_1.default.findById(contestID);
        contest.grandPrize.participants_reached = contest.participants.map((participant) => participant._id);
        contest.open = false;
        const cron = yield cron_model_1.default.findById(new Date().setHours(0, 0, 0, 0));
        console.log(cron.contests);
        cron.contests = cron.contests.filter((contest) => contest.contest_id.toString() != contestID);
        console.log(cron.contests);
        yield contest.save();
        if (cron.contests.length === 0) {
            yield cron_model_1.default.findByIdAndDelete(new Date().setHours(0, 0, 0, 0));
        }
        else {
            yield cron.save();
        }
    }
    catch (err) {
        console.log(err);
    }
});
const contestCronJobs = () => __awaiter(void 0, void 0, void 0, function* () {
    // > Check if cron jobs need to be run for 100 days in advance
    const today = new Date();
    let key = [];
    for (let i = 0; i < 30; i++) {
        key.push(new Date(today.getFullYear(), today.getMonth(), today.getDate() - i).setHours(0, 0, 0, 0));
    }
    const cron = yield cron_model_1.default.find({
        _id: {
            $in: key
        }
    });
    if (cron.length > 0) {
        cron.forEach((cron) => {
            // > If the cron is of a previous day, run it
            cron.contests.forEach((contest) => {
                if (contest.date < new Date()) {
                    if (contest.milestone_id) {
                        endDeadlineMilestone(contest.contest_id, contest.milestone_id);
                    }
                    else {
                        endDeadlineContest(contest.contest_id);
                    }
                }
                else {
                    // > If the cron is of a future day, schedule it
                    if (contest.milestone_id) {
                        node_schedule_1.default.scheduleJob(contest.date, () => {
                            endDeadlineMilestone(contest.contest_id, contest.milestone_id);
                        });
                    }
                    else {
                        node_schedule_1.default.scheduleJob(contest.date, () => {
                            endDeadlineContest(contest.contest_id);
                        });
                    }
                }
            });
        });
    }
});
exports.default = contestCronJobs;
