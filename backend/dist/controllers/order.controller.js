"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatus = exports.getAll = exports.getOrder = exports.getMyOrders = exports.createOrder = void 0;
const order_service_1 = require("../services/order.service");
const safeParam_1 = require("../utils/safeParam");
const getUserId = (req) => {
    const user = req.user;
    if (!user || !user.id) {
        throw new Error('User not authenticated');
    }
    return user.id;
};
const createOrder = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { items, shippingAddress, paymentMethod, discount, couponCode } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Cart is empty' });
        }
        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address) {
            return res.status(400).json({ status: 'error', message: 'Shipping address is required' });
        }
        const order = await (0, order_service_1.createOrder)(userId, items, shippingAddress, paymentMethod, discount, couponCode);
        return res.status(201).json({ status: 'success', data: { order } });
    }
    catch (error) {
        return next(error);
    }
};
exports.createOrder = createOrder;
const getMyOrders = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const orders = await (0, order_service_1.getOrders)(userId);
        res.status(200).json({ status: 'success', data: { orders } });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyOrders = getMyOrders;
const getOrder = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const order = await (0, order_service_1.getOrderById)(userId, (0, safeParam_1.safeParam)(req.params.id));
        res.status(200).json({ status: 'success', data: { order } });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrder = getOrder;
const getAll = async (_req, res, next) => {
    try {
        const orders = await (0, order_service_1.getAllOrders)();
        res.status(200).json({ status: 'success', data: { orders } });
    }
    catch (error) {
        next(error);
    }
};
exports.getAll = getAll;
const updateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const order = await (0, order_service_1.updateOrderStatus)((0, safeParam_1.safeParam)(req.params.id), status);
        res.status(200).json({ status: 'success', data: { order } });
    }
    catch (error) {
        next(error);
    }
};
exports.updateStatus = updateStatus;
//# sourceMappingURL=order.controller.js.map