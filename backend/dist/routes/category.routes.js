"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("../controllers/category.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_1 = require("zod");
const router = express_1.default.Router();
const categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
});
const updateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
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
router.get('/', category_controller_1.getAllCategories);
router.get('/:id', category_controller_1.getCategoryById);
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), validate(categorySchema), category_controller_1.createCategory);
router.patch('/:id', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), validate(updateCategorySchema), category_controller_1.updateCategory);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), category_controller_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=category.routes.js.map