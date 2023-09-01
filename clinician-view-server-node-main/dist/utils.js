"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueId = void 0;
const generateId = (length) => {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
const generateUniqueId = (length, sessionKeyList) => {
    let id = generateId(length);
    while (sessionKeyList.includes(id)) {
        id = generateId(length);
    }
    return id;
};
exports.generateUniqueId = generateUniqueId;
//# sourceMappingURL=utils.js.map