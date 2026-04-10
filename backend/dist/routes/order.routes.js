"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.post('/', order_controller_1.createOrder);
router.get('/', order_controller_1.getMyOrders);
router.get('/admin/all', (0, auth_middleware_1.restrictTo)('ADMIN'), order_controller_1.getAll);
router.patch('/admin/:id/status', (0, auth_middleware_1.restrictTo)('ADMIN'), order_controller_1.updateStatus);
router.get('/:id', order_controller_1.getOrder);
exports.default = router;
//# sourceMappingURL=order.routes.js.map