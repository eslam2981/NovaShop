"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.getOne = exports.getAll = exports.create = void 0;
const product_service_1 = require("../services/product.service");
const safeParam_1 = require("../utils/safeParam");
const create = async (req, res, next) => {
    try {
        const product = await (0, product_service_1.createProduct)(req.body);
        res.status(201).json({
            status: 'success',
            data: { product },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.create = create;
const getAll = async (req, res, next) => {
    try {
        const result = await (0, product_service_1.getProducts)(req.query);
        res.status(200).json({
            status: 'success',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAll = getAll;
const getOne = async (req, res, next) => {
    try {
        const product = await (0, product_service_1.getProductById)((0, safeParam_1.safeParam)(req.params.id));
        res.status(200).json({
            status: 'success',
            data: { product },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOne = getOne;
const update = async (req, res, next) => {
    try {
        const product = await (0, product_service_1.updateProduct)((0, safeParam_1.safeParam)(req.params.id), req.body);
        res.status(200).json({
            status: 'success',
            data: { product },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.update = update;
const remove = async (req, res, next) => {
    try {
        await (0, product_service_1.deleteProduct)((0, safeParam_1.safeParam)(req.params.id));
        res.status(204).json({
            status: 'success',
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.remove = remove;
//# sourceMappingURL=product.controller.js.map