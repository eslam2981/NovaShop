"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = void 0;
const admin_service_1 = require("../services/admin.service");
const getStats = async (_req, res, next) => {
    try {
        const stats = await (0, admin_service_1.getAdminStats)();
        res.status(200).json({
            status: 'success',
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStats = getStats;
//# sourceMappingURL=admin.controller.js.map