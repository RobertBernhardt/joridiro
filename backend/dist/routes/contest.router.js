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
const express_1 = __importDefault(require("express"));
const cron_model_1 = __importDefault(require("../models/cron.model"));
const contest_controller_1 = __importDefault(require("../controllers/contest.controller"));
const authGuard_1 = require("../utils/guards/authGuard");
const contest_validator_1 = __importDefault(require("../validators/contest.validator"));
const contest_model_1 = __importDefault(require("../models/contest.model"));
const router = express_1.default.Router();
router.get('/:id', (req, res) => contest_controller_1.default.get(req, res));
router.post('/participant', (req, res) => contest_controller_1.default.getParticipantInfo(req, res));
router.get('/', (req, res) => contest_controller_1.default.getAll(req, res));
router.post('/create', authGuard_1.authGuard, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return contest_validator_1.default.create(req.body)
        .then((data) => {
        if (data.valid) {
            return contest_controller_1.default.create(req, res);
        }
        else {
            return res.status(400).json({ message: 'VALIDATION_ERROR', data: data });
        }
    });
}));
router.post('/getSignedUrl', authGuard_1.authGuard, (req, res) => __awaiter(void 0, void 0, void 0, function* () { return contest_controller_1.default.getSignedUrl(req, res); }));
router.post('/:id/announce', authGuard_1.authGuard, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return contest_validator_1.default.announce(req.body).then((data) => {
        if (data.valid) {
            return contest_controller_1.default.announce(req, res);
        }
        else {
            return res.status(400).json({ message: 'VALIDATION_ERROR', data: data.data });
        }
    });
}));
router.post('/:id/announce/:announcementId/edit', authGuard_1.authGuard, (req, res) => __awaiter(void 0, void 0, void 0, function* () { return contest_controller_1.default.announceEdit(req, res); }));
router.post('/:id/announce/:announcementId/delete', authGuard_1.authGuard, (req, res) => __awaiter(void 0, void 0, void 0, function* () { return contest_controller_1.default.announcementDelete(req, res); }));
router.post('/:id/join', authGuard_1.authGuard, (req, res) => contest_controller_1.default.join(req, res));
router.post('/:id/score', authGuard_1.authGuard, (req, res) => __awaiter(void 0, void 0, void 0, function* () { return contest_controller_1.default.updateScore(req, res); }));
router.post('/:id/confirmWinner', authGuard_1.authGuard, (req, res) => __awaiter(void 0, void 0, void 0, function* () { return contest_controller_1.default.confirmWinner(req, res); }));
router.post('/:id/faq', authGuard_1.authGuard, (req, res) => contest_controller_1.default.faq(req, res));
router.post('/:id/:faqid/answerfaq', authGuard_1.authGuard, (req, res) => contest_controller_1.default.answerfaq(req, res));
router.post('/:id/:faqid/deletefaq', authGuard_1.authGuard, (req, res) => contest_controller_1.default.deletefaq(req, res));
router.post('/:id/validAlias', authGuard_1.authGuard, (req, res) => contest_controller_1.default.validAlias(req, res));
router.post('/deadlinecontestcron', (req, res) => contest_controller_1.default.deadlinecontestcron(req, res));
router.post('/search', (req, res) => contest_controller_1.default.search(req, res));
router.post('/:id/edit', authGuard_1.authGuard, (req, res) => contest_controller_1.default.edit(req, res));
router.post('/testdates', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let contest = yield contest_model_1.default.find();
    console.log(contest[0]);
    cron_model_1.default.create({
        _id: new Date().setHours(0, 0, 0, 0),
        contests: [
            {
                contest_id: contest[0]._id,
                date: contest[0].milestones[0].date,
                milestone_id: contest[0].milestones[0]._id,
                type: "MILESTONE"
            },
            {
                contest_id: contest[0]._id,
                date: contest[0].milestones[1].date,
                milestone_id: contest[0].milestones[1]._id,
                type: "MILESTONE"
            },
            {
                contest_id: contest[0]._id,
                date: contest[0].milestones[2].date,
                milestone_id: contest[0].milestones[2]._id,
                type: "MILESTONE"
            },
            {
                contest_id: contest[0]._id,
                date: contest[0].endDate,
                type: "CONTEST_END"
            }
        ]
    });
    return res.status(200).json({ message: "OK" });
}));
exports.default = router;
