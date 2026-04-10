"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = exports.createUser = void 0;
const userService = __importStar(require("../services/user.service"));
const error_middleware_1 = require("../middlewares/error.middleware");
const safeParam_1 = require("../utils/safeParam");
const createUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Name, email, and password are required',
            });
        }
        const user = await userService.createUser({ name, email, password, role });
        return res.status(201).json({
            status: 'success',
            data: { user },
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.createUser = createUser;
const getAllUsers = async (_req, res, next) => {
    try {
        const users = await userService.getUsers();
        res.status(200).json({
            status: 'success',
            data: { users },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res, next) => {
    try {
        const user = await userService.getUserById((0, safeParam_1.safeParam)(req.params.id));
        res.status(200).json({
            status: 'success',
            data: { user },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res, next) => {
    try {
        const currentUser = req.user;
        const targetId = (0, safeParam_1.safeParam)(req.params.id);
        if (targetId === currentUser.id && req.body.role && req.body.role !== currentUser.role) {
            return next(new error_middleware_1.AppError('You cannot change your own role', 400));
        }
        const user = await userService.updateUser(targetId, req.body);
        res.status(200).json({
            status: 'success',
            data: { user },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res, next) => {
    try {
        const currentUser = req.user;
        const targetId = (0, safeParam_1.safeParam)(req.params.id);
        if (targetId === currentUser.id) {
            return next(new error_middleware_1.AppError('You cannot delete your own account', 400));
        }
        await userService.deleteUser(targetId);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=user.controller.js.map