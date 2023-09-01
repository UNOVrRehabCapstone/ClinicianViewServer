"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSchema = void 0;
const mongoose_1 = require("mongoose");
exports.GameSchema = new mongoose_1.Schema({
    createdAt: {
        type: Date,
        default: Date.now(),
        immutable: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Clinician",
        immutable: true,
        default: null,
    },
    patient: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Patient",
        immutable: true,
        default: null,
    },
    gameName: {
        type: String,
        default: "",
        required: true,
    },
    patientRepCount: Object,
    patientPositionalCoord: Object,
});
const GameModel = (0, mongoose_1.model)("Game", exports.GameSchema, "Game-Collection");
exports.default = GameModel;
//# sourceMappingURL=game.schema.js.map