"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post('/create-intent', auth_middleware_1.protect, payment_controller_1.createIntent);
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), payment_controller_1.webhook);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map