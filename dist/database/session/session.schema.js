"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SessionSchema = new mongoose_1.Schema({
    createdAt: {
        type: Date,
        default: Date.now(),
        immutable: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Clinician",
        required: true,
    },
    createdByName: {
        type: String,
        required: true,
    },
    patients: {
        type: [
            {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Patient",
            },
        ],
        default: [],
    },
    sessionKey: {
        type: String,
        required: true,
    },
    sessionName: {
        type: String,
        required: true,
    },
    currentGame: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Game",
        default: null,
    },
});
const SessionModel = (0, mongoose_1.model)("Session", SessionSchema, "Session-Collection");
exports.default = SessionModel;
//# sourceMappingURL=session.schema.js.map