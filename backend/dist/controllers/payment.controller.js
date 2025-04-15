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
const contestTypes_1 = __importDefault(require("../utils/contestTypes"));
const contest_model_1 = __importDefault(require("../models/contest.model"));
const stripe = require('stripe')('sk_test_51MQUsaBdYqC9TK50cqhgqIu3NAZfDvrX20rVvsNlTjO0IUCgbiDj7WCe7dxHJw7i01RlkFnKQu8fSDLq5QZBtbKU00wLa9dxob');
const scheduler_1 = require("@google-cloud/scheduler");
const client = new scheduler_1.CloudSchedulerClient();
const paymentController = {
    payment: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            // Create checkout session
            const contest = yield contest_model_1.default.findById(req.params.id);
            if (!contest)
                return res.status(404).json({ type: "ERROR", message: "Contest not found" });
            console.log(contest.organizer.toString(), req.user);
            if (contest.organizer.toString() !== ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()))
                return res.status(401).json({ type: "ERROR", message: "UNAUTHORIZED" });
            const total = contestTypes_1.default.get(contest.size).grand_prize + contestTypes_1.default.get(contest.size).lottery_prize + contestTypes_1.default.get(contest.size).milestones.reduce((acc, milestone) => acc + milestone.prize, 0) + 1;
            const lineItems = [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: "Grand Prize",
                        },
                        unit_amount: contestTypes_1.default.get(contest.size).grand_prize * 100,
                        tax_behavior: 'exclusive',
                    },
                    quantity: 1,
                }
            ];
            contestTypes_1.default.get(contest.size).milestones.forEach((milestone, index) => {
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
                });
            });
            contestTypes_1.default.get(contest.size).lottery_prize ? lineItems.push({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Lottery',
                    },
                    unit_amount: contestTypes_1.default.get(contest.size).lottery_prize * 100,
                    tax_behavior: 'exclusive',
                },
                quantity: 1,
            }) : null;
            lineItems.push({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Service Fee',
                    },
                    unit_amount: contestTypes_1.default.get(contest.size).platform_fees * 100,
                    tax_behavior: 'exclusive',
                },
                quantity: 1,
            });
            console.log(contest._id);
            const session = yield stripe.checkout.sessions.create({
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
            return res.status(200).json({ message: 'SUCCESS', data: session });
        }
        catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err });
        }
    }),
    webhook: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const endpointSecret = "whsec_bG9X4ld3ML2w1xyGd6VkaPbbaqE0ZIds";
        console.log("Webhook called");
        let event = req.body;
        const stripePayload = req.rawBody || req.body;
        // Only verify the event if you have an endpoint secret defined.
        // Otherwise use the basic event deserialized with JSON.parse
        if (endpointSecret) {
            // Get the signature sent by Stripe
            const signature = req.headers['stripe-signature'];
            try {
                console.log(signature);
                event = stripe.webhooks.constructEvent(stripePayload, signature, endpointSecret);
            }
            catch (err) {
                console.log(`⚠️  Webhook signature verification failed.`, err.message);
                return res.sendStatus(400);
            }
        }
        let paymentIntent = null;
        let contest = null;
        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                paymentIntent = event.data.object;
                contest = yield contest_model_1.default.findById(paymentIntent.metadata.contest_id);
                if (!contest)
                    return res.status(404).json({ type: "ERROR", message: "Contest not found" }).end();
                contest.payment_status = "PAID";
                yield contest.save();
                res.status(200).json({ message: 'SUCCESS', data: contest }).end();
                break;
            case 'payment_intent.processing':
                paymentIntent = event.data.object;
                contest = yield contest_model_1.default.findById(paymentIntent.metadata.contest_id);
                if (!contest)
                    return res.status(404).json({ type: "ERROR", message: "Contest not found" }).end();
                contest.payment_status = "PENDING";
                yield contest.save();
                res.status(200).json({ message: 'SUCCESS', contest }).end();
                break;
            case 'payment_intent.payment_failed':
                paymentIntent = event.data.object;
                contest = yield contest_model_1.default.findById(paymentIntent.metadata.contest_id);
                if (!contest)
                    return res.status(404).json({ type: "ERROR", message: "Contest not found" }).end();
                contest.payment_status = "UNPAID";
                yield contest.save();
                res.status(200).json({ message: 'SUCCESS', contest }).end();
                break;
            case 'charge.dispute.funds_withdrawn':
                paymentIntent = event.data.object.payment_intent;
                let intent = yield stripe.paymentIntents.retrieve(paymentIntent);
                contest = yield contest_model_1.default.findById(intent.metadata.contest_id);
                if (!contest)
                    return res.status(404).json({ type: "ERROR", message: "Contest not found" }).end();
                contest.payment_status = "UNPAID";
                yield contest.save();
                res.status(200).json({ message: 'SUCCESS', contest }).end();
                break;
            case 'charge.dispute.funds_reinstated':
                paymentIntent = event.data.object.payment_intent;
                intent = yield stripe.paymentIntents.retrieve(paymentIntent);
                contest = yield contest_model_1.default.findById(intent.metadata.contest_id);
                if (!contest)
                    return res.status(404).json({ type: "ERROR", message: "Contest not found" }).end();
                contest.payment_status = "PAID";
                yield contest.save();
                res.status(200).json({ message: 'SUCCESS', contest }).end();
                break;
            case 'charge.dispute.created':
                break;
            case 'charge.dispute.updated':
                break;
            case 'charge.dispute.closed':
                break;
            default:
                res.status(400).json({ message: 'BAD_REQUEST', error: event }).end();
        }
    }),
};
exports.default = paymentController;
