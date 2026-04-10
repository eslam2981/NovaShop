"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeItem = exports.getCartItems = exports.addItem = void 0;
const cart_service_1 = require("../services/cart.service");
const safeParam_1 = require("../utils/safeParam");
const getUserId = (req) => {
    const user = req.user;
    if (!user || !user.id) {
        throw new Error('User not authenticated');
    }
    return user.id;
};
const addItem = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { productId, quantity } = req.body;
        const cart = await (0, cart_service_1.addToCart)(userId, productId, quantity);
        res.status(200).json({ status: 'success', data: { cart } });
    }
    catch (error) {
        next(error);
    }
};
exports.addItem = addItem;
const getCartItems = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const cart = await (0, cart_service_1.getCart)(userId);
        res.status(200).json({ status: 'success', data: { cart } });
    }
    catch (error) {
        next(error);
    }
};
exports.getCartItems = getCartItems;
const removeItem = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const cart = await (0, cart_service_1.removeFromCart)(userId, (0, safeParam_1.safeParam)(req.params.itemId));
        res.status(200).json({ status: 'success', data: { cart } });
    }
    catch (error) {
        next(error);
    }
};
exports.removeItem = removeItem;
//# sourceMappingURL=cart.controller.js.map