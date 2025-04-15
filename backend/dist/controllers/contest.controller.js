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
const user_model_1 = __importDefault(require("../models/user.model"));
const cron_model_1 = __importDefault(require("../models/cron.model"));
const contestTypes_1 = __importDefault(require("../utils/contestTypes"));
const storage_1 = require("@google-cloud/storage");
const googleapis_1 = require("googleapis");
const cron_model_2 = __importDefault(require("../models/cron.model"));
const editContest_model_1 = __importDefault(require("../models/editContest.model"));
const cloudScheduler = googleapis_1.google.cloudscheduler('v1beta1');
const schedule = require('node-schedule');
const convertToCron = (date) => {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    return `${second} ${minute} ${hour} ${day} ${month} *`;
};
const storage = new storage_1.Storage({
    projectId: 'joridiro',
    keyFilename: 'src/joridirokey.json'
});
const uploadImage = (file, id, name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //  > Upload the image to google cloud storage
        const bucket = storage.bucket('joridiro_contest');
        //The extension of the file is extracted from the base64 string and the file is saved with the same extension from data:image/png
        const extension = file.split(';')[0].split('/')[1];
        // Find the avatarUrl of the user and delete the image from the bucket
        const blob = bucket.file(`${id}/${name}.${extension}`);
        const blobStream = blob.createWriteStream({
            resumable: false
        });
        let commaIndex = file.indexOf(",");
        const base64 = file.substring(commaIndex + 1);
        const buffer = Buffer.from(base64, 'base64');
        blobStream.on('error', (err) => {
            console.log(err);
        });
        blobStream.on('finish', () => {
            console.log('Image uploaded successfully');
        });
        blobStream.end(buffer);
        //  > Get the image url
        const publicUrl = `https://storage.googleapis.com/joridiro_contest/${id}/${name}.${extension}`;
        return publicUrl;
    }
    catch (err) {
        console.log(err);
        return '';
    }
});
const pickLotteryWinner = (contestID) => __awaiter(void 0, void 0, void 0, function* () {
    // > Get the contest
    const contest = yield contest_model_1.default.findById(contestID);
    if (!contest)
        return;
    // > Check if the contest is open
    if (contest.open)
        return;
    // > Get the participants
    const participants = contest.participants;
    // > Weighted random selection using cumulative sum and 10000 iterations
    let cumulativeSum = 0;
    let cumulativeSumArray = [];
    if (participants.length === 0) {
        contest.lotteryPrize.winner = null;
        return yield contest.save();
    }
    participants.forEach((participant) => {
        cumulativeSum += participant.lottery_tickets;
        cumulativeSumArray.push(cumulativeSum);
    });
    let winnerIndex = 0;
    for (let i = 0; i < 10; i++) {
        let random = Math.floor(Math.random() * cumulativeSum);
        for (let j = 0; j < cumulativeSumArray.length; j++) {
            console.log(winnerIndex);
            if (random < cumulativeSumArray[j]) {
                winnerIndex = j;
                break;
            }
        }
    }
    contest.lotteryPrize.winner = participants[winnerIndex]._id;
    yield contest.save();
});
const endDeadlineMilestone = (contestID, milestoneID) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
    if (cron.contests.length === 0) {
        yield cron_model_1.default.findByIdAndDelete(new Date().setHours(0, 0, 0, 0));
    }
    else {
        yield cron.save();
    }
});
const endDeadlineContest = (contestID) => __awaiter(void 0, void 0, void 0, function* () {
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
});
const contestController = {
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(401).json({ message: 'UNAUTHORIZED' });
        try {
            // > The endDate is set to 100 days after the startDate if the targetScore is present and above 0 else it is set to current date plus contestTypes[req.body.type].date
            let startDate = new Date();
            // > Get the number of days the contest will last
            const totalDays = contestTypes_1.default.get(req.body.size).days;
            // > Add totalDays to the startDate
            let endDate = new Date(startDate.getTime() + totalDays * 24 * 60 * 60 * 1000);
            const contestObject = contestTypes_1.default.get(req.body.size);
            console.log(contestObject);
            if (!req.body.about_company.name) {
                req.body.about_company.name = req.user.fullName;
            }
            // > Get a milestone object. If it is a score contest, remove the days field and if it is a DEADLINE contest, remove the points field
            const milestones = contestObject.milestones.map((milestone) => {
                if (req.body.type == 'SCORE') {
                    delete milestone.days;
                    return milestone;
                }
                else {
                    delete milestone.points;
                    milestone.date = new Date(startDate.getTime() + milestone.days * 24 * 60 * 60 * 1000);
                    return milestone;
                }
            });
            let index = 0;
            // > Use title as the id
            let id = req.body.title;
            // > If id exists, add a number to the end of it
            while (yield contest_model_1.default.findById(id)) {
                index++;
                id = req.body.title + index;
            }
            // > Create the contest
            const contest = yield contest_model_1.default.create({
                _id: id,
                title: req.body.title,
                startDate: startDate,
                endDate: endDate,
                type: req.body.type,
                size: req.body.size,
                organizer: req.user._id,
                organizer_platform: req.body.organizer_platform,
                banner: '',
                open: true,
                scoreContest: req.body.type,
                requirements: req.body.requirements,
                about_contest: req.body.about_contest,
                about_company: req.body.about_company,
                score: req.body.score,
                rules: req.body.rules,
                questions: req.body.questions,
                grandPrize: {
                    amount: contestTypes_1.default.get(req.body.size).grand_prize,
                    winner: null
                },
                lotteryPrize: {
                    amount: contestTypes_1.default.get(req.body.size).lottery_prize,
                    winner: null
                },
                participants: [],
                milestones: milestones,
                payment_status: "UNPAID"
            });
            // > Upload the banner to the bucket
            if (req.body.banner[0]) {
                contest.banner = yield uploadImage(req.body.banner[0].src, contest._id, 'banner');
            }
            // > Upload the logo
            if (req.body.about_company.logo) {
                contest.about_company.logo = yield uploadImage(req.body.about_company.logo, contest._id, 'logo');
            }
            const result = yield contest.save();
            // > If it is a DEADLINE contest, get the endDate and the milestoneDates
            if (req.body.type === "DEADLINE") {
                const endDateWithoutTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                let dates = [];
                for (let milestone of contest.milestones) {
                    const dateWithoutTime = new Date(milestone.date.getFullYear(), milestone.date.getMonth(), milestone.date.getDate());
                    const cronForDate = yield cron_model_1.default.findById(dateWithoutTime);
                    if (cronForDate) {
                        cronForDate.contests.push({
                            date: milestone.date,
                            contest_id: contest._id,
                            type: "MILESTONE",
                            milestone_id: milestone._id
                        });
                        Promise.all([cronForDate.save()]);
                    }
                    else {
                        const newCron = yield cron_model_1.default.create({
                            _id: dateWithoutTime,
                            contests: [
                                {
                                    date: milestone.date,
                                    contest_id: contest._id,
                                    type: "MILESTONE",
                                    milestone_id: milestone._id
                                }
                            ]
                        });
                        Promise.all([newCron.save()]);
                    }
                    console.log(convertToCron(milestone.date));
                    schedule.scheduleJob(convertToCron(milestone.date), () => __awaiter(void 0, void 0, void 0, function* () {
                        yield endDeadlineMilestone(contest._id, milestone._id);
                    }));
                }
                const cronForEndDate = yield cron_model_1.default.findById(endDateWithoutTime);
                if (cronForEndDate) {
                    console.log("HERE");
                    cronForEndDate.contests.push({
                        date: endDate,
                        contest_id: contest._id,
                        type: "CONTEST_END"
                    });
                    dates.push({
                        type: "CONTEST_END",
                        date: convertToCron(endDate),
                    });
                    Promise.all([cronForEndDate.save()]);
                }
                else {
                    const newCron = yield cron_model_1.default.create({
                        _id: endDateWithoutTime,
                        contests: [
                            {
                                date: endDate,
                                contest_id: contest._id,
                                type: "CONTEST_END"
                            }
                        ]
                    });
                    dates.push({
                        type: "CONTEST_END",
                        date: convertToCron(endDate),
                    });
                    Promise.all([newCron.save()]);
                }
                schedule.scheduleJob(convertToCron(endDate), () => __awaiter(void 0, void 0, void 0, function* () {
                    yield endDeadlineContest(contest._id);
                }));
            }
            return res.status(201).json({ type: "SUCCESS", message: 'Your contest has been created successfully. It will go live as soon as you make a successful payment', contest });
        }
        catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err.message });
        }
    }),
    getSignedUrl: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const storage = new storage_1.Storage({
                projectId: 'joridiro',
                keyFilename: 'src/joridirokey.json'
            });
            const bucket = storage.bucket('joridiro_contest');
            const file = bucket.file(req.body.filename);
            const signedUrl = yield file.getSignedUrl({
                action: 'write',
                // > Expires in 15 minutes
                expires: Date.now() + 15 * 60 * 1000
            });
            return res.status(200).json({ message: "SIGNED_URL OBTAINED", signedUrl });
        }
        catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err.message });
        }
    }),
    edit: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        try {
            const contest = yield contest_model_1.default.findById(req.params.id);
            if (!contest)
                return res.status(404).json({ type: "ERROR", message: "Contest not found" });
            // > Check if the user is an organizer of the contest or his sys_permissions include ADMIN or CONTEST_ADMIN
            if (contest.organizer.toString() !== req.user._id.toString() && !((_b = req.user.sys_permissions) === null || _b === void 0 ? void 0 : _b.some((permission) => ['ADMIN'].includes(permission))))
                return res.status(401).json({ message: 'UNAUTHORIZED' });
            // > Check if the contest is open
            if (!contest.open)
                return res.status(400).json({ type: "ERROR", message: "You can't edit a contest that is not open" });
            // > Make sure only one request for a contest is being processed at a time
            const contestExists = yield editContest_model_1.default.findById(contest._id);
            if (contestExists)
                return res.status(400).json({ type: "ERROR", message: "You can't edit a contest that is already being edited" });
            // > Add the edited contest to edited_contests
            yield editContest_model_1.default.create({
                _id: contest._id,
                title: req.body.title,
                startDate: contest.startDate,
                endDate: contest.endDate,
                type: contest.type,
                size: contest.size,
                organizer: contest.organizer,
                organizer_platform: req.body.organizer_platform,
                banner: req.body.banner,
                open: contest.open,
                scoreContest: contest.type,
                requirements: req.body.requirements,
                about_contest: req.body.about_contest,
                about_company: req.body.about_company,
                score: req.body.score,
                rules: req.body.rules,
                questions: req.body.questions,
                grandPrize: contest.grandPrize,
                lotteryPrize: contest.lotteryPrize,
                participants: contest.participants,
                milestones: contest.milestones,
                payment_status: contest.payment_status,
            });
            return res.status(201).json({ type: "SUCCESS", message: "A contest edit request has been submitted. It will be approved after a manual review", contest });
        }
        catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err.message });
        }
    }),
    announce: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        // > Check if the user is an organizer of the contest
        if (!req.user)
            return res.status(401).json({ message: 'UNAUTHORIZED' });
        try {
            const contest = yield contest_model_1.default.findById(req.params.id);
            if (!contest)
                return res.status(404).json({ message: 'INVALID_CONTEST_ID' });
            // > Check if the user is an organizer of the contest or his sys_permissions include ADMIN or CONTEST_ADMIN
            if (contest.organizer.toString() !== req.user._id.toString() && !((_c = req.user.sys_permissions) === null || _c === void 0 ? void 0 : _c.some((permission) => ['ADMIN'].includes(permission))))
                return res.status(401).json({ message: 'UNAUTHORIZED' });
            // > Check if the contest is over
            if (!contest.open)
                return res.status(400).json({ message: 'CONTEST_IS_OVER' });
            // > Add announcement to the contest
            contest.announcements = [...contest.announcements, {
                    announcement: req.body.announcement,
                    date: new Date()
                }];
            const result = yield contest.save();
            return res.status(200).json({ message: 'SUCCESS', data: result });
        }
        catch (err) {
            return res.status(500).json({ type: "ERROR", message: 'Something went wrong', error: err.message });
        }
    }),
    announceEdit: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // > Check if the user is an organizer of the contest
        if (!req.user)
            return res.status(401).json({ message: 'UNAUTHORIZED' });
        try {
            const contest = yield contest_model_1.default.findById(req.params.id);
            if (!contest)
                return res.status(404).json({ message: 'INVALID_CONTEST_ID' });
            // > Check if the user is an organizer of the contest or his sys_permissions include ADMIN or CONTEST_ADMIN
            if (contest.organizer.toString() !== req.user._id.toString() && !req.user.sys_permissions.some((permission) => ['ADMIN'].includes(permission)))
                return res.status(401).json({ message: 'UNAUTHORIZED' });
            // > Check if the contest is over
            if (!contest.open)
                return res.status(400).json({ message: 'CONTEST_IS_OVER' });
            // > Get announcement with the given id
            const announcement = contest.announcements.find((announcement) => announcement._id.toString() === req.params.announcementId);
            if (!announcement)
                return res.status(404).json({ message: 'INVALID_ANNOUNCEMENT_ID' });
            // > Edit announcement
            announcement.announcement = req.body.announcement;
            const result = yield contest.save();
            return res.status(200).json({ message: 'SUCCESS', data: result });
        }
        catch (err) {
            return res.status(500).json({ type: "ERROR", message: 'Something went wrong', error: err.message });
        }
    }),
    announcementDelete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // > Check if the user is an organizer of the contest
        if (!req.user)
            return res.status(401).json({ message: 'UNAUTHORIZED' });
        try {
            const contest = yield contest_model_1.default.findById(req.params.id);
            if (!contest)
                return res.status(404).json({ message: 'INVALID_CONTEST_ID' });
            // > Check if the user is an organizer of the contest or his sys_permissions include ADMIN or CONTEST_ADMIN
            if (contest.organizer.toString() !== req.user._id.toString() && !req.user.sys_permissions.some((permission) => ['ADMIN'].includes(permission)))
                return res.status(401).json({ message: 'UNAUTHORIZED' });
            // > Check if the contest is over
            if (!contest.open)
                return res.status(400).json({ message: 'CONTEST_IS_OVER' });
            // > Get announcement with the given id
            const announcement = contest.announcements.find((announcement) => announcement._id.toString() === req.params.announcementId);
            if (!announcement)
                return res.status(404).json({ message: 'INVALID_ANNOUNCEMENT_ID' });
            // > Delete announcement
            contest.announcements = contest.announcements.filter((announcement) => announcement._id.toString() !== req.params.announcementId);
            const result = yield contest.save();
            return res.status(200).json({ message: 'SUCCESS', data: result });
        }
        catch (err) {
            return res.status(500).json({ type: "ERROR", message: 'Something went wrong', error: err.message });
        }
    }),
    pickDeadlineContestMilestoneWinner: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
        }
        catch (err) {
        }
    }),
    join: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        //For future me: Let me explain why I made this endpoint the way I did.
        // 1. I made a seperate participant collection which stores the participant id, contest id, score updates, questions they answered, and a shit ton of other details
        // 2. Theres an array in the contest itself which stores the participant ids and the scores. The reason I did this is because it makes it easier to query the contest collection to get all the participants of a contest without all the additional data that comes with it. When a participant wants to see the leaderboard, he doesnt see any details of the participant anyways so whats the point of sending all questions, name and all the other  data. This data is only shown to contest organizers and admins and only if they click on the participant's name so we can just query the participant collection for that specific participant and send the data. This would be extremely performant
        // 3. We store the contest a participant creates or joins in the user collection. This is so that we can easily query the user collection to get all the contests a user has created or joined
        // > Check if the user is an organizer of the contest
        if (!req.user)
            return res.status(401).json({ type: "ERROR", message: 'You are not authorized to join this contest' });
        try {
            const contest = yield contest_model_1.default.findById(req.params.id);
            if (!contest)
                return res.status(404).json({ type: "ERROR", message: "Invalid contest" });
            // > Get the user
            const user = yield user_model_1.default.findById(req.user._id);
            if (!user)
                return res.status(404).json({ type: "ERROR", message: "You are not logged in" });
            // > Check if the user is an organizer of the contest or his sys_permissions include ADMIN
            if (contest.organizer.toString() === req.user._id.toString())
                return res.status(400).json({ type: "ERROR", message: "You can not join your own contest" });
            // > Check if the contest is over
            if (!contest.open)
                return res.status(400).json({ type: "ERROR", message: "This contest is over" });
            // > Check if the user has already joined the contest
            if (user.contests.includes(contest._id))
                return res.status(400).json({ type: "ERROR", message: 'You have already joined the contest' });
            const scoreObj = contest.score.map((score) => {
                return {
                    category: score._id,
                    value: 0,
                    points: 0
                };
            });
            contest.participants.push({
                _id: user._id,
                score: scoreObj,
                lottery_tickets: 0,
                last_updated: null,
                alias: req.body.alias,
                profile: req.body.profile,
            });
            yield contest.save();
            user.contests.push(contest._id);
            req.user.contests.push(contest._id);
            yield user.save();
            return res.status(200).json({ type: "SUCCESS", message: 'Contest joined', data: req.user });
        }
        catch (err) {
            return res.status(500).json({ type: "ERROR", message: err.message });
        }
    }),
    search: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.body.query)
                return res.status(400).json({ type: "ERROR", message: 'Please provide a query' });
            const contests = yield contest_model_1.default.find({ title: { $regex: req.body.query, $options: 'i' } });
            return res.status(200).json({ type: "SUCCESS", message: 'Contests found', data: contests });
        }
        catch (err) {
            return res.status(500).json({ type: "ERROR", message: err.message });
        }
    }),
    validAlias: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const contest = yield contest_model_1.default.findById(req.params.id);
            if (!contest)
                return res.status(404).json({ type: "ERROR", message: 'Invalid contest id' });
            const participant = contest.participants.find((participant) => participant.alias === req.body.alias);
            if (participant)
                return res.status(400).json({ type: "ERROR", message: 'This alias is already taken' });
            return res.status(200).json({ type: "SUCCESS", message: 'This alias is available' });
        }
        catch (err) {
            return res.status(500).json({ type: "ERROR", message: err.message });
        }
    }),
    updateScore: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // > Check if the user is an organizer of the contest or his sys_permissions include ADMIN or CONTEST_ADMIN or if the user is the participant
            if (!req.user)
                return res.status(401).json({ message: 'UNAUTHORIZED' });
            const contest = yield contest_model_1.default.findById(req.params.id);
            if (!contest)
                return res.status(404).json({ message: 'INVALID_CONTEST_ID' });
            const user = yield user_model_1.default.findById(req.user._id);
            if (!user)
                return res.status(404).json({ message: 'INVALID_USER_ID' });
            // > Check if the user is an organizer of the contest or his sys_permissions include ADMIN or CONTEST_ADMIN or if the user is the participant of the contest
            if (contest.organizer.toString() !== req.user._id.toString() && !req.user.sys_permissions.some((permission) => ['ADMIN', 'CONTEST_ADMIN'].includes(permission)) && !user.contests.includes(contest._id))
                return res.status(401).json({ message: 'UNAUTHORIZED' });
            // > Make sure that the contest is not over. While using new Date make sure to take hrs, mins, secs and ms as 0
            // > Check if the contest is over
            if (!contest.open)
                return res.status(400).json({ message: 'CONTEST_IS_OVER' });
            // > Req.body has a score id and a score. Score id is the id of the score object in the contest.score array
            // > Check if the score id is valid
            if (!contest.score.some((score) => score._id.toString() === req.body.score_id))
                return res.status(400).json({ message: 'INVALID_SCORE_ID' });
            // > Update the score of the participant for the score id
            contest.participants = contest.participants.map((participant) => {
                if (participant._id.toString() === req.user._id.toString()) {
                    participant.score = participant.score.map((score) => {
                        console.log(score._id.toString(), req.body.score_id);
                        if (score.category.toString() === req.body.score_id) {
                            score.value = req.body.score;
                            const scoreData = contest.score.find((score) => score._id.toString() === req.body.score_id);
                            score.points = Math.floor(scoreData.points / scoreData.number * req.body.score);
                        }
                        return score;
                    });
                }
                return participant;
            });
            // > If it is a milestone contest then check if the milestone has been reached and if it is add it to participant_reached array in milestones
            const participant = contest.participants.find((participant) => participant._id.toString() === req.user._id.toString());
            if (contest.type === "SCORE") {
                contest.milestones = contest.milestones.map((milestone) => {
                    const totalScore = participant.score.reduce((total, score) => {
                        return total + score.points;
                    }, 0);
                    if (milestone.points <= totalScore) {
                        if (!milestone.participants_reached.includes(req.user._id)) {
                            milestone.participants_reached.push(req.user._id);
                        }
                    }
                    else {
                        if (milestone.participants_reached.includes(req.user._id)) {
                            milestone.participants_reached = milestone.participants_reached.filter((participant) => participant.toString() !== req.user._id.toString());
                        }
                    }
                    return milestone;
                });
                // > Check if the participant has reached the target
                const totalScore = participant.score.reduce((total, score) => {
                    return total + score.points;
                }, 0);
                if (totalScore >= contestTypes_1.default.get(contest.size).max_score) {
                    // Add it to the participants_reached array of the grandPrize
                    if (!contest.grandPrize.participants_reached.includes(req.user._id)) {
                        contest.grandPrize.participants_reached.push(req.user._id);
                    }
                    // > Lottery 
                    yield pickLotteryWinner(contest._id);
                }
                else {
                    if (contest.grandPrize.participants_reached.includes(req.user._id)) {
                        contest.grandPrize.participants_reached = contest.grandPrize.participants_reached.filter((participant) => participant.toString() !== req.user._id.toString());
                    }
                }
            }
            // > Check if the participant has been updated on that day month and year
            let ticketAdded = false;
            if (!participant.last_updated || participant.last_updated.getDate() !== new Date().getDate() || participant.last_updated.getMonth() !== new Date().getMonth() || participant.last_updated.getFullYear() !== new Date().getFullYear()) {
                // > Increase the lottery tickets by 1
                contest.participants = contest.participants.map((participant) => {
                    if (participant._id.toString() === req.user._id.toString()) {
                        participant.lottery_tickets += 1;
                        participant.last_updated = new Date();
                    }
                    ticketAdded = true;
                    return participant;
                });
            }
            // > Sort the participants array based on the score which is the sum of all the scores
            contest.participants = contest.participants.sort((a, b) => {
                let aScore = a.score.reduce((acc, score) => acc + score.points, 0);
                let bScore = b.score.reduce((acc, score) => acc + score.points, 0);
                return bScore - aScore;
            });
            yield contest.save();
            return res.status(200).json({ type: "SUCCESS", message: "Your score has been successfully updated", ticketAdded, contest });
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({ type: "ERROR", message: 'Something went wrong', data: err });
        }
    }),
    get: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _d, _e;
        try {
            // > Get the contest
            let contest = yield contest_model_1.default.findById(req.params.id);
            if (!contest)
                return res.status(404).json({ message: 'INVALID_CONTEST_ID' });
            // > Score for the current user
            if (contest.payment_status != "PAID" && contest.organizer.toString() != ((_e = (_d = req.user) === null || _d === void 0 ? void 0 : _d._id) === null || _e === void 0 ? void 0 : _e.toString())) {
                return res.status(200).json({
                    type: 'ERROR', message: "Contest does not exist", data: {
                        payment_status: contest.payment_status,
                    }
                });
            }
            let userScore = null;
            if (req.user) {
                userScore = contest.participants.find((participant) => {
                    return participant._id.toString() === req.user._id.toString();
                });
            }
            // > Fix the above code
            let rank = null;
            if (req.user) {
                if (req.user._id.toString() != contest.organizer.toString()) {
                    contest.participants = contest.participants.map((participant, index) => {
                        if (participant._id.toString() === req.user._id.toString()) {
                            rank = index + 1;
                        }
                        return participant;
                    });
                }
            }
            return res.status(200).json({ message: 'SUCCESS', data: contest, score: userScore, rank });
        }
        catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: err });
        }
    }),
    confirmWinner: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // > Get the contest
            let contest = yield contest_model_1.default.findById(req.params.id);
            if (!contest)
                return res.status(404).json({ message: 'INVALID_CONTEST_ID' });
            // > Check if the user is the organizer of the contest
            if (contest.organizer.toString() !== req.user._id.toString())
                return res.status(403).json({ message: 'NOT_AUTHORIZED' });
            // > Assign the winner. 3 types of winners can be assigned: Milestone, Grand Prize and Lottery
            const winnerType = req.body.winnerType;
            if (['MILESTONE', 'GRAND_PRIZE', 'LOTTERY'].indexOf(winnerType) === -1)
                return res.status(400).json({ message: 'INVALID_WINNER_TYPE' });
            if (winnerType === "MILESTONE") {
                const milestoneId = req.body.milestoneId;
                const milestone = contest.milestones.find((milestone) => milestone._id.toString() === milestoneId.toString());
                if (!milestone)
                    return res.status(404).json({ type: 'ERROR', message: 'Milestone not found' });
                // > Check that the score of the winner is greater than the score for the milestone
                const participant = contest.participants.find((participant) => participant._id.toString() === req.body.winner.toString());
                const winnerScore = participant.score.reduce((acc, score) => acc + score.points, 0);
                if (winnerScore < milestone.points)
                    return res.status(400).json({ type: 'ERROR', message: 'The winner does not have the required score to win the milestone. It might be the case that the participant updated their score. Please refresh the page to see the updates' });
                contest.milestones = contest.milestones.map((milestone) => {
                    if (milestone._id.toString() === milestoneId.toString()) {
                        console.log(req.body.winner);
                        milestone.winner = req.body.winner;
                    }
                    return milestone;
                });
                yield contest.save();
                // > Return the real names for participants if it is an organizer or else return the alias
                if (req.user._id.toString() === contest.organizer.toString()) {
                    contest.participants.map((participant) => __awaiter(void 0, void 0, void 0, function* () {
                        const participantName = yield user_model_1.default.findById(participant._id).select('fullName');
                        console.log(participantName.fullName);
                        participant.alias = participantName.fullName;
                        return participant;
                    }));
                }
                return res.status(200).json({ type: 'SUCCESS', message: "Prize has been awarded to the winner", data: contest });
            }
            else if (winnerType === "GRAND_PRIZE") {
                contest.grandPrize.winner = req.body.winner;
                yield contest.save();
                pickLotteryWinner(contest._id);
                return res.status(200).json({ type: 'SUCCESS', message: "Prize has been awarded to the winner", data: contest });
            }
        }
        catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: err });
        }
    }),
    getParticipantInfo: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const users = yield user_model_1.default.find({ _id: { $in: req.body.ids } }, { fullName: 1, _id: 1 });
            return res.status(200).json({ message: 'SUCCESS', data: users });
        }
        catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: err });
        }
    }),
    getAll: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // > Get a paginated list of all the contests in the database only if the due field is 0 in the order they were created
            if (!req.query.page)
                return res.status(400).json({ message: 'INVALID_PAGE' });
            // Get only banner field from the contest collection. Make sure payment_status is PAID
            const contests = yield contest_model_1.default.find({
                payment_status: 'PAID',
                open: true,
            }, {
                title: 1,
                organizer: 1,
                about_company: {
                    name: 1,
                    logo: 1,
                },
                type: 1,
                grandPrize: {
                    amount: 1,
                },
                size: 1,
                _id: 1,
                banner: 1,
                endDate: 1,
                about_contest: {
                    short_description: 1,
                },
                participants: 1,
                requirements: 1
            }).sort({ createdAt: -1 });
            return res.status(200).json({ message: 'SUCCESS', data: contests });
        }
        catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: err });
        }
    }),
    faq: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // > Get the contest
            const contest = yield contest_model_1.default.findById(req.params.id);
            if (!contest)
                return res.status(404).json({ message: 'INVALID_CONTEST_ID' });
            // > Check if the contest is open
            if (!contest.open)
                return res.status(400).json({ type: "ERROR", message: 'Contest is over', data: contest });
            // > Check if the user is the participant
            const participant = contest.participants.find((participant) => participant._id.toString() === req.user._id.toString());
            if (!participant && contest.organizer.toString() !== req.user._id)
                return res.status(404).json({ type: "ERROR", message: 'You are not a participant of this contest', data: contest });
            // > Add the question to the faq array
            contest.faq.push({
                questioner: req.user._id,
                question: req.body.question,
                answer: ""
            });
            yield contest.save();
            return res.status(200).json({ type: 'SUCCESS', message: "Question has been submitted", data: contest });
        }
        catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: err });
        }
    }),
    answerfaq: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // > Get the contest
            const contest = yield contest_model_1.default.findById(req.params.id);
            if (!contest)
                return res.status(404).json({ message: 'INVALID_CONTEST_ID' });
            //  > Check if the contest is open
            if (!contest.open)
                return res.status(400).json({ message: 'CONTEST_IS_OVER' });
            // > Check if the user is the organiser or if his sys_permission has either of the two values CONTEST OR ADMIN
            if (req.user._id.toString() !== contest.organizer.toString() && !req.user.sys_permission.includes('CONTEST') && !req.user.sys_permission.includes('ADMIN'))
                return res.status(401).json({ message: 'UNAUTHORIZED' });
            // > Check if the question exists
            const question = contest.faq.find((question) => question._id.toString() === req.params.faqid.toString());
            if (!question)
                return res.status(404).json({ message: 'INVALID_QUESTION_ID' });
            // > Check if the question has already been answered
            question.answer = req.body.answer;
            yield contest.save();
            return res.status(200).json({ type: 'SUCCESS', message: "Question has been answered", data: contest });
        }
        catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: err });
        }
    }),
    deletefaq: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // > Get the contest
            const contest = yield contest_model_1.default.findById(req.params.id);
            if (!contest)
                return res.status(404).json({ type: "ERROR", message: "Invalid contest" });
            //  > Check if the contest is open
            if (!contest.open)
                return res.status(400).json({ type: "ERROR", message: 'Contest is over' });
            // > Check if the user is the organiser or if his sys_permission has either of the two values CONTEST OR ADMIN
            if (req.user._id.toString() !== contest.organizer.toString() && !req.user.sys_permission.includes('CONTEST') && !req.user.sys_permission.includes('ADMIN'))
                return res.status(401).json({ type: "ERROR", message: 'You are not authorized to perform this action' });
            // > Check if the question exists
            const question = contest.faq.find((question) => question._id.toString() === req.params.faqid.toString());
            if (!question)
                return res.status(404).json({ type: "ERROR", message: 'Invalid question id' });
            // > Delete the question
            contest.faq = contest.faq.filter((question) => question._id.toString() !== req.params.faqid.toString());
            yield contest.save();
            return res.status(200).json({ type: 'SUCCESS', message: "Question has been deleted", data: contest });
        }
        catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: err });
        }
    }),
    deadlinecontestcron: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const todayDateWithoutTime = new Date().setHours(0, 0, 0, 0);
        const todaysCron = yield cron_model_2.default.findById(todayDateWithoutTime);
        if (!todaysCron)
            return;
        // > Convert the date to the cron format
        // > Schedule the cron for the day
        todaysCron.contests.forEach((task) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(convertToCron(task.date));
            schedule.scheduleJob(convertToCron(task.date), () => __awaiter(void 0, void 0, void 0, function* () {
                // > If it is a milestone task
                if (task.type === 'MILESTONE') {
                    endDeadlineMilestone(task.contest_id, task._id);
                }
                else if (task.type === 'CONTEST_END') {
                    const contest = yield contest_model_1.default.findById(task.contest_id);
                    if (!contest)
                        return;
                    contest.open = false;
                    yield contest.save();
                }
            }));
        }));
        return res.status(200).json({ message: 'SUCCESS' });
    }),
};
exports.default = contestController;
