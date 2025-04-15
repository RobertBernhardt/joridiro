import express from 'express'
import cronModel from '../models/cron.model'
import contestController from '../controllers/contest.controller'
import { authGuard } from '../utils/guards/authGuard'
import contestValidator from '../validators/contest.validator'
import contestModel from '../models/contest.model'

const router = express.Router()


router.get('/:id', (req, res) => contestController.get(req, res))

router.post('/participant', (req, res) => contestController.getParticipantInfo(req, res))

router.get('/', (req, res) => contestController.getAll(req, res))

router.post('/create', authGuard, async (req, res) => contestValidator.create(req.body)
    .then((data) => {
        if (data.valid) {
            return contestController.create(req, res)
        } else {
            return res.status(400).json({ message: 'VALIDATION_ERROR', data: data })
        }
    })
)

router.post('/getSignedUrl', authGuard, async(req,res)=> contestController.getSignedUrl(req,res))


router.post('/:id/announce', authGuard, async (req, res) => contestValidator.announce(
    req.body
).then((data) => {
    if (data.valid) {
        return contestController.announce(req, res)
    } else {
        return res.status(400).json({ message: 'VALIDATION_ERROR', data: data.data })
    }
})
)


router.post('/:id/announce/:announcementId/edit', authGuard, async (req, res) => contestController.announceEdit(req,res))
router.post('/:id/announce/:announcementId/delete', authGuard, async (req, res) => contestController.announcementDelete(req,res))


router.post('/:id/join', authGuard, (req, res) => contestController.join(req,res))


router.post('/:id/score', authGuard, async (req, res) => contestController.updateScore(req, res))

router.post('/:id/confirmWinner', authGuard, async (req, res) => contestController.confirmWinner(req, res))




router.post('/:id/faq', authGuard, (req, res) => contestController.faq(req, res))

router.post('/:id/:faqid/answerfaq', authGuard, (req, res) => contestController.answerfaq(req, res))
router.post('/:id/:faqid/deletefaq', authGuard, (req, res) => contestController.deletefaq(req, res))
router.post('/:id/validAlias', authGuard, (req, res) => contestController.validAlias(req, res))
router.post('/deadlinecontestcron', (req, res) => contestController.deadlinecontestcron(req,res))
router.post('/search', (req, res) => contestController.search(req,res))

router.post('/:id/edit', authGuard, (req,res) => contestController.edit(req, res))

router.post('/testdates', async (req, res) => {
    let contest = await contestModel.find()
    console.log(contest[0])
    cronModel.create({
        _id: new Date().setHours(0,0,0,0),
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
    })
    return res.status(200).json({message: "OK"})
})


export default router