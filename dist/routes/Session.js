"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../auth");
const database_1 = require("../database/database");
const utils_1 = require("../utils");
const router = express_1.default.Router();
router.get("/", (req, res) => {
    const token = req.headers.authorization;
    (0, auth_1.validateToken)(token, (success, user) => {
        if (success) {
            (0, database_1.getAllSessions)()
                .then((sessions) => {
                res.send({ sessions });
            })
                .catch(() => {
                res.sendStatus(500);
            });
        }
        else {
            res.sendStatus(403);
        }
    });
});
router.post("/", (req, res) => {
    const params = req.body;
    const token = req.headers.authorization;
    (0, auth_1.validateToken)(token, (success, user) => {
        if (success) {
            (0, database_1.getAllSessions)().then((sessions) => {
                const id = (0, utils_1.generateUniqueId)(5, sessions.map((s) => s.sessionKey));
                (0, database_1.insertSession)(params.sessionName, id, user.userName).then((suc) => {
                    if (suc) {
                        res.send({ success: true });
                    }
                    else {
                        res.sendStatus(500);
                    }
                });
            });
        }
        else {
            res.sendStatus(403);
        }
    });
});
router.delete("/", (req, res) => {
    const params = req.body;
    const token = req.headers.authorization;
    (0, auth_1.validateToken)(token, (success) => {
        if (success) {
            (0, database_1.deleteSession)(params.sessionKey);
            res.sendStatus(200);
        }
        else {
            res.sendStatus(403);
        }
    });
});
router.get(`/:sessionKey`, (req, res) => {
    console.log("Session Key: " + req.params.sessionKey);
});
module.exports = router;
//# sourceMappingURL=Session.js.map