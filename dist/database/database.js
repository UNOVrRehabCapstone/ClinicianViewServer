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
exports.createGame = exports.getClinicianWithName = exports.setClinicianOnlineStatusWithName = exports.setClinicianOnlineStatusWithId = exports.addPatientToClinician = exports.updatePatientBalloonProgress = exports.retrievePatientBalloonProgress = exports.getPatientOrCreate = exports.updatePatientUserName = exports.updatePatientLastName = exports.updatePatientFirstName = exports.removePatientFromSession = exports.deleteSession = exports.addSessionToPatient = exports.addPatientToSession = exports.insertSession = exports.getAllSessions = exports.getUserByTokenInDatabase = exports.clearToken = exports.checkClinicianWithPassword = exports.deleteAllGames = void 0;
const auth_1 = require("../auth");
const clinician_schema_1 = __importDefault(require("./clinician/clinician.schema"));
const patient_schema_1 = __importDefault(require("./patient/patient.schema"));
const session_schema_1 = __importDefault(require("./session/session.schema"));
const game_schema_1 = __importDefault(require("./game/game.schema"));
const deleteAllGames = (clinician = "ALL") => __awaiter(void 0, void 0, void 0, function* () {
    if (clinician === "ALL") {
        try {
            const res = yield game_schema_1.default.deleteMany();
            return res;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }
    else {
        try {
            const clinicianDoc = yield clinician_schema_1.default.findOne({
                userName: clinician,
            });
            const res = yield game_schema_1.default.deleteMany({ createdBy: clinicianDoc === null || clinicianDoc === void 0 ? void 0 : clinicianDoc._id });
            return res;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }
});
exports.deleteAllGames = deleteAllGames;
const checkClinicianWithPassword = (username, shaPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield clinician_schema_1.default.findOne({
            userName: username,
            shaPassword: shaPassword,
        });
        if (res) {
            const token = (0, auth_1.generateToken)(res._id);
            if (yield updateToken(res._id, token)) {
                return token;
            }
            else {
                return undefined;
            }
        }
        else {
            return undefined;
        }
    }
    catch (error) {
        console.log("ERROR: ", error);
    }
});
exports.checkClinicianWithPassword = checkClinicianWithPassword;
const updateToken = (id, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield clinician_schema_1.default.findOneAndUpdate({ _id: id }, { $set: { token } });
        return true;
    }
    catch (error) {
        return false;
    }
});
const clearToken = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield updateToken(id, "");
});
exports.clearToken = clearToken;
const getUserByTokenInDatabase = (token, id) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield clinician_schema_1.default.findOne({ _id: id, token }));
});
exports.getUserByTokenInDatabase = getUserByTokenInDatabase;
const getAllSessions = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield session_schema_1.default.find();
});
exports.getAllSessions = getAllSessions;
const insertSession = (sessionName, sessionId, userName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clinician = yield clinician_schema_1.default.findOne({ userName: userName });
        yield session_schema_1.default.create({
            sessionKey: sessionId,
            sessionName: sessionName,
            createdBy: clinician === null || clinician === void 0 ? void 0 : clinician._id,
            createdByName: clinician === null || clinician === void 0 ? void 0 : clinician.userName,
        });
        return true;
    }
    catch (_a) {
        return false;
    }
});
exports.insertSession = insertSession;
const addPatientToSession = (patient, sessionKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield session_schema_1.default.findOneAndUpdate({ sessionKey: sessionKey }, { $addToSet: { patients: patient._id } });
        return res;
    }
    catch (error) {
        console.log(error);
    }
});
exports.addPatientToSession = addPatientToSession;
const addSessionToPatient = (patient, roomKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const session = yield session_schema_1.default.findOne({ sessionKey: roomKey });
        const res = yield patient_schema_1.default.findOneAndUpdate({ userName: patient.userName }, { $set: { currentSession: session === null || session === void 0 ? void 0 : session._id } });
        return res;
    }
    catch (error) {
        console.log(error);
    }
});
exports.addSessionToPatient = addSessionToPatient;
const deleteSession = (sessionKey) => __awaiter(void 0, void 0, void 0, function* () {
    return yield session_schema_1.default.deleteOne({ sessionKey: sessionKey });
});
exports.deleteSession = deleteSession;
const removePatientFromSession = (sessionKey, patientId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const patientToRemove = yield patient_schema_1.default.findOneAndUpdate({ userName: patientId }, { $set: { currentSession: null } });
        const res = yield session_schema_1.default.findOneAndUpdate({ sessionkey: sessionKey }, {
            $pull: { patients: patientToRemove === null || patientToRemove === void 0 ? void 0 : patientToRemove._id },
        });
        return res;
    }
    catch (_b) {
        return false;
    }
});
exports.removePatientFromSession = removePatientFromSession;
const updatePatientFirstName = (firstName, sessionKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const session = yield session_schema_1.default.findOne({ sessionKey: sessionKey });
        const res = yield patient_schema_1.default.updateOne({ currentSession: session === null || session === void 0 ? void 0 : session._id }, {
            $set: { firstName: firstName },
        });
        return res;
    }
    catch (error) {
        return false;
    }
});
exports.updatePatientFirstName = updatePatientFirstName;
const updatePatientLastName = (lastName, sessionKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const session = yield session_schema_1.default.findOne({ sessionKey: sessionKey });
        const res = yield patient_schema_1.default.updateOne({ currentSession: session === null || session === void 0 ? void 0 : session._id }, {
            $set: { lastName: lastName },
        });
        return res;
    }
    catch (error) {
        return false;
    }
});
exports.updatePatientLastName = updatePatientLastName;
const updatePatientUserName = (userName, sessionKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const session = yield session_schema_1.default.findOne({ sessionKey: sessionKey });
        const res = yield patient_schema_1.default.updateOne({ currentSession: session === null || session === void 0 ? void 0 : session._id }, {
            $set: { lastName: userName },
        });
        return res;
    }
    catch (error) {
        return false;
    }
});
exports.updatePatientUserName = updatePatientUserName;
const getPatientOrCreate = (patientName, clinicianName, patientId) => __awaiter(void 0, void 0, void 0, function* () {
    const clinicain = yield clinician_schema_1.default.findOne({ userName: clinicianName });
    let patient = yield patient_schema_1.default.findOneAndUpdate({ userName: patientName }, { patientId: patientId });
    if (!patient) {
        patient = yield patient_schema_1.default.create({
            userName: patientName,
            patientId: patientId,
            createdBy: clinicain === null || clinicain === void 0 ? void 0 : clinicain._id,
        });
    }
    return patient;
});
exports.getPatientOrCreate = getPatientOrCreate;
//    retrievePatientBalloonProgress finds a patient via their username in the database, then returns that patient's balloon game progress
//    or returns null if the patient isn't found
const retrievePatientBalloonProgress = (userName) => __awaiter(void 0, void 0, void 0, function* () {
    let patient = yield patient_schema_1.default.findOne({ userName: userName });
    if (patient) {
        return patient.balloonProgress;
    }
    else {
        patient_schema_1.default.create({
            userName: userName,
            patientId: "000",
        });
    }
    ;
});
exports.retrievePatientBalloonProgress = retrievePatientBalloonProgress;
const updatePatientBalloonProgress = (userName, achievementProgress, careerProgress, levelOneScore, levelTwoScore, levelThreeScore, levelFourScore, levelFiveScore, ach0, ach1, ach2, ach3, ach4, ach5, ach6, ach7, ach8, ach9) => __awaiter(void 0, void 0, void 0, function* () {
    //Check that everything is valid (achieveProgress length must equal 10, careerProgress must be between 0-5, level Scores must be between 0-3)
    //I know it's ugly.
    if (achievementProgress.length != 10) {
        return null;
    }
    if (parseInt(careerProgress) > 5 || parseInt(careerProgress) < 0) {
        return null;
    }
    if (parseInt(levelOneScore) > 3 || parseInt(levelOneScore) < 0) {
        return null;
    }
    if (parseInt(levelTwoScore) > 3 || parseInt(levelTwoScore) < 0) {
        return null;
    }
    if (parseInt(levelThreeScore) > 3 || parseInt(levelThreeScore) < 0) {
        return null;
    }
    if (parseInt(levelFourScore) > 3 || parseInt(levelFourScore) < 0) {
        return null;
    }
    if (parseInt(levelFiveScore) > 3 || parseInt(levelFiveScore) < 0) {
        return null;
    }
    let doc = yield patient_schema_1.default.findOneAndUpdate({ userName: userName }, {
        balloonProgress: {
            careerProgress: careerProgress,
            achievementProgress: achievementProgress,
            levelOneScore: levelOneScore,
            levelTwoScore: levelTwoScore,
            levelThreeScore: levelThreeScore,
            levelFourScore: levelFourScore,
            levelFiveScore: levelFiveScore,
            ach0: ach0,
            ach1: ach1,
            ach2: ach2,
            ach3: ach3,
            ach4: ach4,
            ach5: ach5,
            ach6: ach6,
            ach7: ach7,
            ach8: ach8,
            ach9: ach9,
        },
    }, { new: true });
    console.log(doc);
});
exports.updatePatientBalloonProgress = updatePatientBalloonProgress;
const addPatientToClinician = (patient, clinicianName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield clinician_schema_1.default.findOneAndUpdate({ userName: clinicianName }, { $addToSet: { patients: patient._id } });
        return true;
    }
    catch (error) {
        console.log(error);
    }
});
exports.addPatientToClinician = addPatientToClinician;
const setClinicianOnlineStatusWithId = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    return yield clinician_schema_1.default.findOneAndUpdate({ _id: id }, { $set: { isOnline: status } });
});
exports.setClinicianOnlineStatusWithId = setClinicianOnlineStatusWithId;
const setClinicianOnlineStatusWithName = (userName, shaPassword, status) => __awaiter(void 0, void 0, void 0, function* () {
    return yield clinician_schema_1.default.findOneAndUpdate({ userName: userName, shaPassword: shaPassword }, { $set: { isOnline: status } });
});
exports.setClinicianOnlineStatusWithName = setClinicianOnlineStatusWithName;
const getClinicianWithName = (userName) => __awaiter(void 0, void 0, void 0, function* () {
    return yield clinician_schema_1.default.findOne({ userName: userName });
});
exports.getClinicianWithName = getClinicianWithName;
const createGame = (sessionKey, clinicianName, gameName, patientId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clinician = yield clinician_schema_1.default.findOne({ userName: clinicianName });
        const session = yield session_schema_1.default.findOne({ sessionKey: sessionKey });
        const game = yield game_schema_1.default.create({
            createdBy: clinician === null || clinician === void 0 ? void 0 : clinician._id,
            gameName: gameName,
            patient: null,
        });
        yield patient_schema_1.default.updateMany({ currentSession: session === null || session === void 0 ? void 0 : session._id }, { $set: { currentGame: game._id } });
        yield session_schema_1.default.updateMany(
        //
        { sessionKey: session === null || session === void 0 ? void 0 : session.sessionKey }, { $set: { currentGame: game._id } });
    }
    catch (error) {
        console.log(error);
    }
});
exports.createGame = createGame;
//# sourceMappingURL=database.js.map