"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cart_controller_1 = require("../controllers/cart.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_1 = require("zod");
const router = express_1.default.Router();
const addToCartSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().int().positive(),
});
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ status: 'fail', errors: error.issues });
        }
        else {
            next(error);
        }
    }
};
router.use(auth_middleware_1.protect);
router.post('/', validate(addToCartSchema), cart_controller_1.addItem);
router.get('/', cart_controller_1.getCartItems);
router.delete('/:itemId', cart_controller_1.removeItem);
exports.default = router;
//# sourceMappingURL=cart.routes.js.map