import contestTypes from "../utils/contestTypes";
import contestModel from "../models/contest.model";
import userModel from "../models/user.model"

import { CloudSchedulerClient } from '@google-cloud/scheduler';
const client = new CloudSchedulerClient();

const paymentController = {
    payment: async (req, res) => {
        try {
            // Create checkout session
            // Convert the params with %20 to space
            const id = req.params.id.replace(/%20/g, " ")
            const contest = await contestModel.findById(req.params.id)
            if (!contest) return res.status(404).json({ type: "ERROR", message: "Contest not found" })
            console.log(contest.organizer.toString(), req.user)
            if (contest.organizer.toString() !== req.user?._id?.toString()) return res.status(401).json({ type: "ERROR", message: "UNAUTHORIZED" })
            const total = contestTypes.get(contest.size).grand_prize + contestTypes.get(contest.size).lottery_prize + contestTypes.get(contest.size).milestones.reduce((acc, milestone) => acc + milestone.prize, 0) + 1

            const lineItems = [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: "Grand Prize",
                        },
                        unit_amount: contestTypes.get(contest.size).grand_prize * 100,
                        tax_behavior: 'exclusive',
                    },
                    quantity: 1,
                }
            ]

            contestTypes.get(contest.size).milestones.forEach((milestone, index) => {
                lineItems.push({
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `Milestone ${index + 1}`,
                        },
                        unit_amount: milestone.prize * 100,
                        tax_behavior: 'exclusive',
                    },
                    quantity: 1,
                })
            })
            contestTypes.get(contest.size).lottery_prize ? lineItems.push({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Lottery',
                    },
                    unit_amount: contestTypes.get(contest.size).lottery_prize * 100,
                    tax_behavior: 'exclusive',
                },
                quantity: 1,
            }) : null

            lineItems.push({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Service Fee',
                    },
                    unit_amount: contestTypes.get(contest.size).platform_fees * 100,
                    tax_behavior: 'exclusive',
                },
                quantity: 1,
            })
            const session = await stripe.checkout.sessions.create({
                payment_method_types: contest.size === "SMALL" || contest.size === "MEDIUM" ? ['card', 'sofort', 'sepa_debit'] : ['card', 'sofort'],
                line_items: lineItems,
                mode: 'payment',
                automatic_tax: {
                    enabled: true,
                },
                payment_intent_data: {
                    metadata: {
                        contest_id: contest._id.toString(),
                    },
                },
                tax_id_collection: {
                    enabled: true,
                },
                success_url: `${process.env.CLIENT_URL}/contests/${contest._id}`
            });
            return res.status(200).json({ message: 'SUCCESS', data: session })
        } catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err })
        }
    },
    webhook: async (req, res) => {
        const endpointSecret = "whsec_bG9X4ld3ML2w1xyGd6VkaPbbaqE0ZIds"
        console.log("Webhook called")
        let event = req.body;
        const stripePayload = (req as any).rawBody || req.body;
        // Only verify the event if you have an endpoint secret defined.
        // Otherwise use the basic event deserialized with JSON.parse
        if (endpointSecret) {
            // Get the signature sent by Stripe
            const signature = req.headers['stripe-signature'];
            try {
                console.log(signature)
                event = stripe.webhooks.constructEvent(
                    stripePayload,
                    signature,
                    endpointSecret
                );
            } catch (err) {
                console.log(`⚠️  Webhook signature verification failed.`, err.message);
                return res.sendStatus(400);
            }
        }
        let paymentIntent = null
        let contest = null
        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                paymentIntent = event.data.object;
                contest = await contestModel.findById(paymentIntent.metadata.contest_id)
                if (!contest) return res.status(404).json({ type: "ERROR", message: "Contest not found" }).end()
                contest.payment_status = "PAID"
                await contest.save()
                res.status(200).json({ message: 'SUCCESS', data: contest }).end()
                break;
            case 'payment_intent.processing':
                paymentIntent = event.data.object;
                contest = await contestModel.findById(paymentIntent.metadata.contest_id)
                if (!contest) return res.status(404).json({ type: "ERROR", message: "Contest not found" }).end()
                contest.payment_status = "PENDING"
                await contest.save()
                res.status(200).json({ message: 'SUCCESS', contest }).end()
                break;
            case 'payment_intent.payment_failed':
                paymentIntent = event.data.object;
                contest = await contestModel.findById(paymentIntent.metadata.contest_id)
                if (!contest) return res.status(404).json({ type: "ERROR", message: "Contest not found" }).end()
                contest.payment_status = "UNPAID"
                await contest.save()
                res.status(200).json({ message: 'SUCCESS', contest }).end()
                break;
            case 'charge.dispute.funds_withdrawn':
                paymentIntent = event.data.object.payment_intent;
                let intent = await stripe.paymentIntents.retrieve(paymentIntent);
                contest = await contestModel.findById(intent.metadata.contest_id)
                if (!contest) return res.status(404).json({ type: "ERROR", message: "Contest not found" }).end()
                contest.payment_status = "UNPAID"
                await contest.save()
                res.status(200).json({ message: 'SUCCESS', contest }).end()
                break;
            case 'charge.dispute.funds_reinstated':
                paymentIntent = event.data.object.payment_intent;
                intent = await stripe.paymentIntents.retrieve(paymentIntent);
                contest = await contestModel.findById(intent.metadata.contest_id)
                if (!contest) return res.status(404).json({ type: "ERROR", message: "Contest not found" }).end()
                contest.payment_status = "PAID"
                await contest.save()
                res.status(200).json({ message: 'SUCCESS', contest }).end()
                break;
            case 'charge.dispute.created':
                break
            case 'charge.dispute.updated':
                break
            case 'charge.dispute.closed':
                break
            default:
                res.status(400).json({ message: 'BAD_REQUEST', error: event }).end()
        }
    },
}

export default paymentController    