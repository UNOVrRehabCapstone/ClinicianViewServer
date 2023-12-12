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
const database_1 = require("../database/database");
const globals_1 = require("@jest/globals");
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
function connect1() {
    return __awaiter(this, void 0, void 0, function* () {
        const uri = process.env.DBURI;
        if (uri) {
            mongoose_1.default.connect(uri);
        }
        else {
            console.log("Problem connecting to database. Environment variable not found.");
        }
    });
}
function disconnectFromDb() {
    mongoose_1.default.connection.close();
}
(0, globals_1.beforeAll)(() => {
    dotenv_1.default.config();
    connect1();
});
(0, globals_1.test)('retrievePatientBalloonProgress', () => __awaiter(void 0, void 0, void 0, function* () {
    let testUserName = 'edward';
    let testAchievementProgress = "1111111111";
    let testCareerProgress = "0";
    let testLevelOneScore = "3";
    let testLevelTwoScore = "3";
    let testLevelThreeScore = "0";
    let testLevelFourScore = "0";
    let testAch0 = true;
    let testAch1 = true;
    let testAch2 = true;
    let testAch3 = true;
    let testAch4 = true;
    let testAch5 = true;
    let testAch6 = true;
    let testAch7 = true;
    let testAch8 = true;
    let testAch9 = true;
    let testBalloonProgress = {
        testUserName,
        testAchievementProgress,
        testCareerProgress,
        testLevelOneScore,
        testLevelTwoScore,
        testLevelThreeScore,
        testLevelFourScore,
        testAch0,
        testAch1,
        testAch2,
        testAch3,
        testAch4,
        testAch5,
        testAch6,
        testAch7,
        testAch8,
        testAch9
    };
    let returnedData = yield (0, database_1.retrievePatientBalloonProgress)(testUserName);
    (0, globals_1.expect)(returnedData === null || returnedData === void 0 ? void 0 : returnedData.achievementProgress).toBe(testBalloonProgress.testAchievementProgress);
    (0, globals_1.expect)(returnedData === null || returnedData === void 0 ? void 0 : returnedData.ach0).toBe(testBalloonProgress.testAch0);
    (0, globals_1.expect)(returnedData === null || returnedData === void 0 ? void 0 : returnedData.careerProgress).toBe(testBalloonProgress.testCareerProgress);
    (0, globals_1.expect)(returnedData === null || returnedData === void 0 ? void 0 : returnedData.levelOneScore).toBe(testBalloonProgress.testLevelOneScore);
}));
(0, globals_1.test)('updatePatientBalloonProgress', () => __awaiter(void 0, void 0, void 0, function* () {
    let testUser = "edward";
    let progress = yield (0, database_1.retrievePatientBalloonProgress)(testUser);
    // get user data, change it, check if it's correct, then change it back
    if (progress) {
        (0, globals_1.expect)(progress.achievementProgress).toBe("1111111111");
        progress.achievementProgress = "0000000000";
        yield (0, database_1.updatePatientBalloonProgress)(testUser, progress.achievementProgress, progress.careerProgress, progress.levelOneScore, progress.levelTwoScore, progress.levelThreeScore, progress.levelFourScore, progress.levelFiveScore, progress.ach0, progress.ach1, progress.ach2, progress.ach3, progress.ach4, progress.ach5, progress.ach6, progress.ach7, progress.ach8, progress.ach9);
        let progress2 = yield (0, database_1.retrievePatientBalloonProgress)(testUser);
        if (progress2) {
            (0, globals_1.expect)(progress2.achievementProgress).toBe("0000000000");
            progress2.achievementProgress = "1111111111";
            yield (0, database_1.updatePatientBalloonProgress)(testUser, progress2.achievementProgress, progress2.careerProgress, progress2.levelOneScore, progress2.levelTwoScore, progress2.levelThreeScore, progress2.levelFourScore, progress2.levelFiveScore, progress2.ach0, progress2.ach1, progress2.ach2, progress2.ach3, progress2.ach4, progress2.ach5, progress2.ach6, progress2.ach7, progress2.ach8, progress2.ach9);
        }
        // attempt to bad info
        if (progress2) {
            progress2.levelFiveScore = "100";
            let retVal = yield (0, database_1.updatePatientBalloonProgress)(testUser, progress2.achievementProgress, progress2.careerProgress, progress2.levelOneScore, progress2.levelTwoScore, progress2.levelThreeScore, progress2.levelFourScore, progress2.levelFiveScore, progress2.ach0, progress2.ach1, progress2.ach2, progress2.ach3, progress2.ach4, progress2.ach5, progress2.ach6, progress2.ach7, progress2.ach8, progress2.ach9);
            (0, globals_1.expect)(retVal).toBeNull();
        }
    }
}));
(0, globals_1.afterAll)(() => {
    disconnectFromDb();
});
//# sourceMappingURL=database.tests.js.map