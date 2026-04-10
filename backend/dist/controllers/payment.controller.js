"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhook = exports.createIntent = void 0;
const payment_service_1 = require("../services/payment.service");
const getUserId = (req) => {
    const user = req.user;
    if (!user || !user.id) {
        throw new Error('User not authenticated');
    }
    return user.id;
};
const createIntent = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const data = await (0, payment_service_1.createPaymentIntent)(userId);
        res.status(200).json({ status: 'success', data });
    }
    catch (error) {
        next(error);
    }
};
exports.createIntent = createIntent;
const webhook = async (req, res, next) => {
    try {
        const signature = req.headers['stripe-signature'];
        await (0, payment_service_1.handleWebhook)(signature, req.body);
        res.status(200).json({ received: true });
    }
    catch (error) {
        next(error);
    }
};
exports.webhook = webhook;
//# sourceMappingURL=payment.controller.js.map