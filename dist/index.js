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
exports.validate = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
require("./database/database");
const database_1 = require("./database/database");
const auth_1 = require("./auth");
const mongoose_1 = __importDefault(require("mongoose"));
// Start environment setup
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// End environment setup
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
const PORT = process.env.PORT;
const unitySockets = {};
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/patient", require("./routes/Patient"));
app.use("/session", require("./routes/Session"));
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: [
            "https://52.11.199.188/socket.io/?EIO=4&transport=polling&t=OMKLIpd",
            "https://137.48.186.67/socket.io/?EIO=4&transport=polling&t=OMKLIpd",
            "ws://52.11.199.188/socket.io/?EIO=4&transport=websocket",
            "ws://137.48.186.67/socket.io/?EIO=4&transport=websocket",
            "http://localhost:5000/",
        ],
        methods: ["GET,HEAD,PUT,PATCH,POST,DELETE"],
    },
});
mongoose_1.default.set('strictQuery', true);
httpServer.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
    connect1();
});
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
const addUnitySocket = (name, socket, clinicianSocketId) => {
    unitySockets[socket.id] = {
        name,
        clinicianSocketId,
        socket,
    };
};
io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = socket.handshake.headers.authorization;
    next();
}));
const validate = (req, res, next) => {
    const token = req.headers.authorization;
    (0, auth_1.validateToken)(token, (success, user) => {
        if (success) {
            req.body.user = user;
            next();
            return;
        }
        else {
            res.sendStatus(403);
        }
    });
};
exports.validate = validate;
app.patch("/api/removeAllAdminGames", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const params = req.body;
    (0, database_1.deleteAllGames)(params.userName).then((res) => {
        console.log("Game deleted successfully:\n" + JSON.stringify(res));
    });
}));
app.patch("/api/removeAllGames", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, database_1.deleteAllGames)().then((res) => {
        console.log("Game deleted successfully:\n" + JSON.stringify(res));
    });
}));
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const params = req.body;
    (0, database_1.checkClinicianWithPassword)(params.username, params.shaPassword).then((token) => {
        if (token) {
            (0, database_1.setClinicianOnlineStatusWithName)(params.username, params.shaPassword, true);
            res.send({ success: true, token });
        }
        else {
            console.log("Login error");
        }
    });
}));
app.post("/loginWithToken", (req, res) => {
    const token = req.headers.authorization;
    (0, auth_1.validateToken)(token, (success, user) => {
        if (success) {
            (0, database_1.setClinicianOnlineStatusWithName)(user.userName, user.shaPassword, true);
            res.send({ success: true, user });
        }
        else {
            res.send({ success: false });
        }
    });
});
app.post("/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("logging out");
    const token = req.headers.authorization;
    const user = req.body.currentUser;
    const clinician = yield (0, database_1.getClinicianWithName)(user.userName);
    (0, auth_1.logout)(token, () => {
        (0, database_1.setClinicianOnlineStatusWithName)(clinician === null || clinician === void 0 ? void 0 : clinician.userName, clinician === null || clinician === void 0 ? void 0 : clinician.shaPassword, false);
        res.sendStatus(200);
    });
}));
io.on("connection", (socket) => {
    console.log("A Client Has Connected");
    socket.on("join", (room) => {
        console.log(`A Client Has Joined ${room}`);
        socket.join(room);
    });
    socket.on("disconnect", () => {
        if (unitySockets[socket.id]) {
            unitySockets[socket.id].socket.disconnect();
            delete unitySockets[socket.id];
        }
        console.log("A Client Has Disconnected");
    });
    socket.on("unityConnect", (name) => {
        console.log(name + " has joined unity");
        socket.join("waiting");
        addUnitySocket(name, socket);
    });
    socket.on("unityChangeName", (name) => {
        if (unitySockets[socket.id]) {
            unitySockets[socket.id].name = name;
        }
        else {
            addUnitySocket(name, socket);
        }
    });
    socket.on("balloonDataServerUpdate", () => {
        console.log("recieved balloon data server update");
        //socket.emit("balloonDataClientUpdate")
    });
    socket.on("positionalDataServer", (payload) => {
        const data = payload.split(":");
        console.log(`Positional Data:\n${data}`);
        socket.to(data[0]).emit("positionalDataClinician", data.slice(1).join(" "));
    });
    socket.on("repTrackingDataServer", (payload) => {
        const data = payload.split(":");
        console.log(`Rep Tracking Data:\n${data}`);
        socket
            .to(data[0])
            .emit("repTrackingDataClinician", data.slice(1).join(":"));
    });
    socket.on("pauseGame", (payload) => {
        socket.to(payload.socketId).emit("resumeGame");
    });
    socket.on("resumeGame", (payload) => {
        socket.to(payload.socketId).emit("pauseGame");
    });
    socket.on("updatePatientPosition", (payload) => {
        socket.to(payload.socketId).emit("updatePatientPosition", payload.position);
    });
    socket.on("handMirror", (payload) => {
        socket.to(payload.socketId).emit("handMirror", payload.handMirrored);
    });
    socket.on("IKRig", (payload) => {
        socket.to(payload.socketId).emit("IKRig", payload.IKRigMeasurements);
    });
    socket.on("toggleSkeleton", (payload) => {
        socket.to(payload.socketId).emit("toggleSkeleton");
    });
    socket.on("handScale", (payload) => {
        const scale = {
            handToScale: payload.handToScale,
            scaleAmount: payload.scaleAmount,
        };
        socket.to(payload.socketId).emit("handScale", scale);
    });
    app.post("/startGame", exports.validate, (req, res) => {
        const params = req.body;
        for (const id in unitySockets) {
            if (params.sessionKey == unitySockets[id].sessionKey) {
                socket.to(id).emit("startGame", { game: params.game });
                (0, database_1.createGame)(params.sessionKey, params.userName, params.game, id);
            }
        }
        res.sendStatus(200);
    });
    app.post("/updateBalloonSettings", exports.validate, (req, res) => {
        const params = req.body;
        for (const id in unitySockets) {
            if (params.sessionKey == unitySockets[id].sessionKey) {
                socket.to(id).emit("balloonSettings", { mode: params.mode, target: params.target, freq: params.freq, pattern: params.pattern, ratio: params.ratio, lives: params.lives, hand: params.hand });
            }
        }
        res.sendStatus(200);
    });
    app.post("/manuallySpawnBalloon", exports.validate, (req, res) => {
        const params = req.body;
        for (const id in unitySockets) {
            if (params.sessionKey == unitySockets[id].sessionKey) {
                socket.to(id).emit("balloonSpawn");
            }
        }
    });
    app.post("/loadPatientBalloonData", exports.validate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const params = req.body;
        let progress;
        console.log(params.userName);
        if (params.userName) {
            progress = yield (0, database_1.retrievePatientBalloonProgress)(params.userName);
        }
        if (progress) {
            for (const id in unitySockets) {
                socket.to(id).emit("balloonData", { userName: params.userName, achievementProgress: progress.achievementProgress, careerProgress: progress.careerProgress, levelOneScore: progress.levelOneScore,
                    levelTwoScore: progress.levelTwoScore,
                    levelThreeScore: progress.levelThreeScore,
                    levelFourScore: progress.levelFourScore,
                    levelFiveScore: progress.levelFiveScore });
            }
        }
        console.log(progress);
        res.send(progress);
    }));
    app.patch("/updatePatientInfo", (req, res) => {
        const params = req.body.values;
        const token = req.headers.authorization;
        (0, auth_1.validateToken)(token, (success) => {
            if (success) {
                if (params.firstname) {
                    (0, database_1.updatePatientFirstName)(params.firstname, req.body.sessionKey);
                }
                if (params.lastname) {
                    (0, database_1.updatePatientLastName)(params.lastname, req.body.sessionKey);
                }
                if (params.username) {
                    (0, database_1.updatePatientUserName)(params.username, req.body.sessionKey);
                    socket
                        .to(req.body.sessionKey)
                        .emit("changePatientName", params.username);
                }
                return res.status(200);
            }
            else {
                return res.status(500);
            }
        });
    });
    app.delete("/removePatientFromSession", exports.validate, (req, res) => {
        const params = req.body;
        (0, database_1.removePatientFromSession)(params.sessionKey, params.patientId);
        socket.to(params.sessionKey).emit("kickPatient", params.patientId);
        res.sendStatus(200);
    });
    app.post("/leaveAllRooms", (req, res) => {
        const rooms = io.sockets.adapter.sids[socket.id];
        for (const r in rooms) {
            socket.leave(r);
        }
        res.sendStatus(200);
    });
    app.post("/join", exports.validate, (req, res) => {
        console.log("attempting session join");
        const params = req.body;
        socket.join(params.sessionKey);
        res.send({ success: true });
    });
    app.get("/getWaitingClients", (req, res) => {
        const waitingSet = io.sockets.adapter.rooms.get("waiting");
        const retList = [];
        if (!waitingSet) {
            res.send({ waitingList: [] });
        }
        else {
            const waiting = Array.from(waitingSet);
            waiting.forEach((val) => {
                const unitySocket = unitySockets[val];
                if (unitySocket) {
                    retList.push({
                        name: unitySocket.name,
                        socketId: val,
                    });
                }
            });
            res.send({ waitingList: retList });
        }
    });
    app.get("/getPatientsInSession", (req, res) => {
        const roomKey = req.query.roomKey.toString();
        const roomSet = io.sockets.adapter.rooms.get(roomKey);
        if (roomSet) {
            const patients = Array.from(roomSet);
            const retList = [];
            patients.forEach((id) => {
                if (unitySockets[id]) {
                    unitySockets[id].socket.join(id);
                    retList.push({
                        name: unitySockets[id].name,
                        socketId: id,
                    });
                }
            });
            res.send({ patientList: retList });
        }
        else {
            res.send({ patientList: [] });
        }
    });
    app.post("/addClientsToSession", (req, res) => {
        const clientList = req.body.clientList;
        const roomKey = req.body.roomKey;
        const clinicianName = req.body.clinician;
        const clinicianSocketId = req.body.clinicianSocketId;
        clientList.forEach((id) => {
            if (unitySockets[id].socket) {
                unitySockets[id].socket.leave("waiting");
                unitySockets[id].socket.join(roomKey); //Join patients id for room?
                unitySockets[id].socket.emit("setClinicianID", clinicianSocketId);
                unitySockets[id].socket.emit("userJoined", { clinicianName });
                unitySockets[id].clinicianSocketId = clinicianSocketId;
                unitySockets[id].sessionKey = roomKey;
                (0, database_1.getPatientOrCreate)(unitySockets[id].name, clinicianName, id).then((patient) => {
                    (0, database_1.addPatientToClinician)(patient, clinicianName).then(() => {
                        (0, database_1.addPatientToSession)(patient, roomKey).then(() => {
                            (0, database_1.addSessionToPatient)(patient, roomKey);
                        });
                    });
                });
            }
        });
        //addPatient(clientList, roomKey);
        res.sendStatus(200);
    });
    app.post("/leave", (req, res) => {
        const params = req.body;
        socket.leave(params.sessionKey);
        socket.to(params.sessionKey).emit("userLeft");
        socket.emit("userLeft");
        res.send({ success: true });
    });
});
//# sourceMappingURL=index.js.map