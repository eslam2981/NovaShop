"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeParam = safeParam;
function safeParam(value) {
    if (value === undefined)
        return '';
    return Array.isArray(value) ? (value[0] ?? '') : value;
}
//# sourceMappingURL=safeParam.js.map