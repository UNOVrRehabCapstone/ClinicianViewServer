"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ClinicianSchema = new mongoose_1.Schema({
    userName: {
        type: String,
        required: true,
        lowercase: true,
    },
    token: {
        type: String,
        default: "",
    },
    shaPassword: {
        type: String,
        required: true,
    },
    patients: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Patient",
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now(),
        immutable: true,
    },
    isOnline: {
        type: Boolean,
        required: true,
    },
    socketId: {
        type: String,
        default: "",
    },
});
const ClinicianModel = (0, mongoose_1.model)("Clinician", ClinicianSchema, "Clinician-Collection");
exports.default = ClinicianModel;
//# sourceMappingURL=clinician.schema.js.map