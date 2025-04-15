import contestModel, { IContest } from "../models/contest.model";
import contestCron, { IContestCron } from '../models/cron.model';
import schedule from 'node-schedule';

const endDeadlineMilestone = async (contestID: string, milestoneID: any) => {
    try {
        const contest = await contestModel.findById(contestID)
        contest.milestones = [...contest?.milestones?.map((milestone) => {
            if (milestone.participants_reached.length > 0) return milestone
            if (milestone._id.toString() == milestoneID.toString()) {
                milestone.participants_reached = contest.participants.map((participant) => participant._id)
                return milestone
            }
            return milestone
        })]
        // > Delete the milestone from the cron
        const cron = await contestCron.findById(new Date().setHours(0, 0, 0, 0))
        await contest.save()
        if (cron) {
            cron.contests = cron.contests.filter((contest) => contest.milestone_id ? contest.milestone_id.toString() != milestoneID : true)
        }
        // If cron.contests is empty delete the cron
        if (cron.contests.length === 0) {
            console.log("HERE")
            await contestCron.findByIdAndDelete(new Date().setHours(0, 0, 0, 0))
            console.log("HERE 2")
        } else {
            await cron.save()
        }
    } catch (err) {
        console.log(err)
    }
}

const endDeadlineContest = async (contestID: string) => {
    try {
        const contest = await contestModel.findById(contestID)
        contest.grandPrize.participants_reached = contest.participants.map((participant) => participant._id)
        contest.open = false
        const cron = await contestCron.findById(new Date().setHours(0, 0, 0, 0))
        console.log(cron.contests)
        cron.contests = cron.contests.filter((contest) => contest.contest_id.toString() != contestID)
        console.log(cron.contests)
        await contest.save()
        if (cron.contests.length === 0) {
            await contestCron.findByIdAndDelete(new Date().setHours(0, 0, 0, 0))
        } else {
            await cron.save()
        }
    } catch (err) {
        console.log(err)
    }
}


const contestCronJobs = async () => {
    // > Check if cron jobs need to be run for 100 days in advance
    const today = new Date()
    let key = []
    for (let i = 0; i < 30; i++) {
        key.push(new Date(today.getFullYear(), today.getMonth(), today.getDate() - i).setHours(0, 0, 0, 0))
    }
    const cron = await contestCron.find({
        _id: {
            $in: key
        }
    })
    if (cron.length > 0) {
        cron.forEach((cron) => {
            // > If the cron is of a previous day, run it
            cron.contests.forEach((contest) => {
                if (contest.date < new Date()) {
                    if (contest.milestone_id) {
                        endDeadlineMilestone(contest.contest_id, contest.milestone_id)
                    } else {
                        endDeadlineContest(contest.contest_id)
                    }
                } else {
                    // > If the cron is of a future day, schedule it
                    if (contest.milestone_id) {
                        schedule.scheduleJob(contest.date, () => {
                            endDeadlineMilestone(contest.contest_id, contest.milestone_id)
                        })
                    } else {
                        schedule.scheduleJob(contest.date, () => {
                            endDeadlineContest(contest.contest_id)
                        })
                    }
                }
            })
        })
    }
}

export default contestCronJobs