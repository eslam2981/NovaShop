"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeItem = exports.getItems = exports.addItem = void 0;
const wishlist_service_1 = require("../services/wishlist.service");
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
        const { productId } = req.body;
        const wishlist = await (0, wishlist_service_1.addToWishlist)(userId, productId);
        res.status(200).json({ status: 'success', data: { wishlist } });
    }
    catch (error) {
        next(error);
    }
};
exports.addItem = addItem;
const getItems = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const wishlist = await (0, wishlist_service_1.getWishlist)(userId);
        res.status(200).json({ status: 'success', data: { wishlist } });
    }
    catch (error) {
        next(error);
    }
};
exports.getItems = getItems;
const removeItem = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const wishlist = await (0, wishlist_service_1.removeFromWishlist)(userId, (0, safeParam_1.safeParam)(req.params.productId));
        res.status(200).json({ status: 'success', data: { wishlist } });
    }
    catch (error) {
        next(error);
    }
};
exports.removeItem = removeItem;
//# sourceMappingURL=wishlist.controller.js.map