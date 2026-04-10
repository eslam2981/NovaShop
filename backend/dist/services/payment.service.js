"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = exports.createPaymentIntent = void 0;
const stripe_1 = __importDefault(require("stripe"));
const env_1 = require("../config/env");
const prisma_1 = __importDefault(require("../utils/prisma"));
const error_middleware_1 = require("../middlewares/error.middleware");
let stripeClient = null;
function getStripe() {
    const key = env_1.env.STRIPE_SECRET_KEY?.trim();
    if (!key) {
        throw new error_middleware_1.AppError('Stripe is not configured (set STRIPE_SECRET_KEY)', 503);
    }
    if (!stripeClient) {
        stripeClient = new stripe_1.default(key, {
            apiVersion: '2025-11-17.clover',
        });
    }
    return stripeClient;
}
const createPaymentIntent = async (userId) => {
    const cart = await prisma_1.default.order.findFirst({
        where: { userId, status: 'PENDING' },
        include: { items: { include: { product: true } } },
    });
    if (!cart || cart.items.length === 0) {
        throw new error_middleware_1.AppError('Cart is empty', 400);
    }
    const amount = Math.round(Number(cart.total) * 100);
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: {
            orderId: cart.id,
            userId,
        },
    });
    return {
        clientSecret: paymentIntent.client_secret,
        amount,
        currency: 'usd',
    };
};
exports.createPaymentIntent = createPaymentIntent;
const handleWebhook = async (signature, payload) => {
    const stripe = getStripe();
    let event;
    try {
        event = stripe.webhooks.constructEvent(payload, signature, env_1.env.STRIPE_WEBHOOK_SECRET || '');
    }
    catch (err) {
        throw new error_middleware_1.AppError(`Webhook Error: ${err.message}`, 400);
    }
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;
        await prisma_1.default.order.update({
            where: { id: orderId },
            data: { status: 'PROCESSING' },
        });
        await prisma_1.default.payment.create({
            data: {
                orderId,
                amount: paymentIntent.amount / 100,
                method: 'stripe',
                status: 'succeeded',
                stripeId: paymentIntent.id,
            },
        });
    }
};
exports.handleWebhook = handleWebhook;
//# sourceMappingURL=payment.service.js.map