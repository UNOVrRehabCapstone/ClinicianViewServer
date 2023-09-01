"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.validateToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const database_1 = require("./database/database");
const SECRET = process.env.SECRET || "secret";
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({
        data: {
            id: id.toString(),
        },
    }, SECRET, { expiresIn: "1d" });
};
exports.generateToken = generateToken;
const validateToken = (token, cb) => {
    jsonwebtoken_1.default.verify(token, SECRET, { ignoreExpiration: false }, (err, payload) => {
        if (!payload) {
            const dec = jsonwebtoken_1.default.decode(token);
            const oId = new mongoose_1.default.Types.ObjectId(dec.data.id);
            (0, database_1.clearToken)(oId).then(() => {
                cb(false);
            });
        }
        else {
            const id = payload;
            const oId = new mongoose_1.default.Types.ObjectId(id.data.id); //
            if (err) {
                (0, database_1.clearToken)(oId).then(() => {
                    cb(false);
                });
            }
            else {
                getUserByToken(token, oId).then((res) => {
                    if (res) {
                        cb(true, res);
                    }
                    else {
                        (0, database_1.clearToken)(oId).then(() => {
                            cb(false);
                        });
                    }
                });
            }
        }
    });
};
exports.validateToken = validateToken;
const logout = (token, cb) => {
    const dec = jsonwebtoken_1.default.decode(token);
    if (dec) {
        const oId = new mongoose_1.default.Types.ObjectId(dec.data.id);
        (0, database_1.setClinicianOnlineStatusWithId)(oId, false);
        (0, database_1.clearToken)(oId).then(() => {
            cb();
        });
    }
    else {
        cb();
    }
};
exports.logout = logout;
const getUserByToken = (token, id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, database_1.getUserByTokenInDatabase)(token, id);
    return user;
});
//# sourceMappingURL=auth.js.map