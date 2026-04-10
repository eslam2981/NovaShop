"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_1 = require("zod");
const router = express_1.default.Router();
const productSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    description: zod_1.z.string(),
    price: zod_1.z.number().positive(),
    stock: zod_1.z.number().int().nonnegative(),
    categoryId: zod_1.z.string().uuid(),
    images: zod_1.z.array(zod_1.z.string().url()).optional(),
});
const updateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    description: zod_1.z.string().optional(),
    price: zod_1.z.number().positive().optional(),
    stock: zod_1.z.number().int().nonnegative().optional(),
    categoryId: zod_1.z.string().uuid().optional(),
    images: zod_1.z.array(zod_1.z.string().url()).optional(),
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
router.get('/', product_controller_1.getAll);
router.get('/:id', product_controller_1.getOne);
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), validate(productSchema), product_controller_1.create);
router.patch('/:id', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), validate(updateProductSchema), product_controller_1.update);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), product_controller_1.remove);
exports.default = router;
//# sourceMappingURL=product.routes.js.map