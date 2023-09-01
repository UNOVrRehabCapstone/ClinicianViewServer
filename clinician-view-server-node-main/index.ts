import express, { json } from "express";
import cors from "cors";
import http from "http";
import { Server, Socket } from "socket.io";
import "./database/database";

import { generateUniqueId } from "./utils";
import ClinicianModel, {
  IClinician,
} from "./database/clinician/clinician.schema";
import PatientModel from "./database/patient/patient.schema";
import SessionModel, { ISession } from "./database/session/session.schema";
import GameModel from "./database/game/game.schema";
import {
  addPatientToClinician,
  addPatientToSession,
  addSessionToPatient,
  checkClinicianWithPassword,
  createGame,
  deleteAllGames,
  deleteSession,
  getAllSessions,
  getClinicianWithName,
  getPatientOrCreate,
  insertSession,
  removePatientFromSession,
  setClinicianOnlineStatusWithName,
  updatePatientFirstName,
  updatePatientLastName,
  updatePatientUserName,
} from "./database/database";
import { logout, validateToken } from "./auth";
import mongoose from "mongoose";
import IPatientSocket from "./interfaces/IPatientSocket.interface";

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
const unitySockets: any = {};

interface IUnitySocket {
  name: string;
  socket: Socket;
  clinicianSocketId?: string;
}

interface IStartGame {
  sessionKey: string;
  game: string;
}

app.use(cors());
app.use(express.json());
app.use("/patient", require("./routes/Patient"));
app.use("/session", require("./routes/Session"));

const io: any = new Server(httpServer, {
  cors: {
    origin: [
      "https://52.11.199.188/socket.io/?EIO=4&transport=polling&t=OMKLIpd",
      "ws://52.11.199.188/socket.io/?EIO=4&transport=websocket",
      "http://localhost:1212",
    ],
    methods: ["GET,HEAD,PUT,PATCH,POST,DELETE"],
  },
});

const addUnitySocket = (
  name: string,
  socket: Socket,
  clinicianSocketId?: string
) => {
  unitySockets[socket.id] = {
    name,
    clinicianSocketId,
    socket,
  };
};

io.use(async (socket: any, next: any) => {
  const token = socket.handshake.headers.authorization;
  next();
});

export const validate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization as string;
  validateToken(token, (success: boolean, user: IClinician) => {
    if (success) {
      req.body.user = user;
      next();
      return;
    } else {
      res.sendStatus(403);
    }
  });
};

app.patch("/api/removeAllAdminGames", async (req, res) => {
  const params = req.body;
  deleteAllGames(params.userName).then((res) => {
    console.log("Game deleted successfully:\n" + JSON.stringify(res));
  });
});

app.patch("/api/removeAllGames", async (req, res) => {
  deleteAllGames().then((res) => {
    console.log("Game deleted successfully:\n" + JSON.stringify(res));
  });
});

app.post("/login", async (req, res) => {
  const params = req.body;
  checkClinicianWithPassword(params.username, params.shaPassword).then(
    (token) => {
      if (token) {
        setClinicianOnlineStatusWithName(
          params.username,
          params.shaPassword,
          true
        );
        res.send({ success: true, token });
      } else {
        console.log("Login error");
      }
    }
  );
});

app.post("/loginWithToken", (req, res) => {
  const token = req.headers.authorization as string;
  validateToken(token, (success: boolean, user: IClinician) => {
    if (success) {
      setClinicianOnlineStatusWithName(user.userName, user.shaPassword, true);
      res.send({ success: true, user });
    } else {
      res.send({ success: false });
    }
  });
});

app.post("/logout", async (req, res) => {
  const token = req.headers.authorization as string;
  const user = req.body.currentUser;
  const clinician = await getClinicianWithName(user.userName);
  logout(token, () => {
    setClinicianOnlineStatusWithName(
      clinician?.userName as string,
      clinician?.shaPassword as string,
      false
    );
    res.sendStatus(200);
  });
});

io.on("connection", (socket: any) => {
  console.log("A Client Has Connected");

  socket.on("join", (room: string) => {
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

  socket.on("unityConnect", (name: string) => {
    console.log(name + " has joined unity");
    socket.join("waiting");
    addUnitySocket(name, socket);
  });

  socket.on("unityChangeName", (name: string) => {
    if (unitySockets[socket.id]) {
      unitySockets[socket.id].name = name;
    } else {
      addUnitySocket(name, socket);
    }
  });

  socket.on("positionalDataServer", (payload: string) => {
    const data = payload.split(":");
    console.log(`Positional Data:\n${data}`);
    socket.to(data[0]).emit("positionalDataClinician", data.slice(1).join(" "));
  });

  socket.on("repTrackingDataServer", (payload: string) => {
    const data = payload.split(":");
    console.log(`Rep Tracking Data:\n${data}`);
    socket
      .to(data[0])
      .emit("repTrackingDataClinician", data.slice(1).join(":"));
  });

  socket.on("pauseGame", (payload: IPatientSocket) => {
    socket.to(payload.socketId).emit("resumeGame");
  });

  socket.on("resumeGame", (payload: IPatientSocket) => {
    socket.to(payload.socketId).emit("pauseGame");
  });

  socket.on("updatePatientPosition", (payload: IPatientSocket) => {
    socket.to(payload.socketId).emit("updatePatientPosition", payload.position);
  });

  socket.on("handMirror", (payload: IPatientSocket) => {
    socket.to(payload.socketId).emit("handMirror", payload.handMirrored);
  });

  socket.on("IKRig", (payload: IPatientSocket) => {
    socket.to(payload.socketId).emit("IKRig", payload.IKRigMeasurements);
  });

  socket.on("toggleSkeleton", (payload: IPatientSocket) => {
    socket.to(payload.socketId).emit("toggleSkeleton");
  });

  socket.on("handScale", (payload: IPatientSocket) => {
    const scale = {
      handToScale: payload.handToScale,
      scaleAmount: payload.scaleAmount,
    };
    socket.to(payload.socketId).emit("handScale", scale);
  });

  app.post("/startGame", validate, (req, res) => {
    const params = req.body;
    for (const id in unitySockets) {
      if (params.sessionKey == unitySockets[id].sessionKey) {
        socket.to(id).emit("startGame", { game: params.game });
        createGame(params.sessionKey, params.userName, params.game, id);
      }
    }
    res.sendStatus(200);
  });

  app.patch("/updatePatientInfo", (req, res) => {
    const params = req.body.values;
    const token = req.headers.authorization;
    validateToken(token as string, (success: boolean) => {
      if (success) {
        if (params.firstname) {
          updatePatientFirstName(params.firstname, req.body.sessionKey);
        }
        if (params.lastname) {
          updatePatientLastName(params.lastname, req.body.sessionKey);
        }
        if (params.username) {
          updatePatientUserName(params.username, req.body.sessionKey);
          socket
            .to(req.body.sessionKey)
            .emit("changePatientName", params.username);
        }
        return res.status(200);
      } else {
        return res.status(500);
      }
    });
  });

  app.delete("/removePatientFromSession", validate, (req, res) => {
    const params = req.body;
    removePatientFromSession(params.sessionKey, params.patientId);
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

  app.post("/join", validate, (req, res) => {
    const params = req.body;
    socket.join(params.sessionKey);
    res.send({ success: true });
  });

  app.get("/getWaitingClients", (req, res) => {
    const waitingSet = io.sockets.adapter.rooms.get("waiting");
    const retList: any = [];
    if (!waitingSet) {
      res.send({ waitingList: [] });
    } else {
      const waiting = Array.from(waitingSet);
      waiting.forEach((val: any) => {
        const unitySocket: IUnitySocket = unitySockets[val];
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

  app.get("/getPatientsInSession", (req: any, res) => {
    const roomKey = req.query.roomKey.toString();
    const roomSet = io.sockets.adapter.rooms.get(roomKey);
    if (roomSet) {
      const patients = Array.from(roomSet);
      const retList: any = [];
      patients.forEach((id: any) => {
        if (unitySockets[id]) {
          unitySockets[id].socket.join(id);
          retList.push({
            name: unitySockets[id].name,
            socketId: id,
          });
        }
      });
      res.send({ patientList: retList });
    } else {
      res.send({ patientList: [] });
    }
  });

  app.post("/addClientsToSession", (req, res) => {
    const clientList = req.body.clientList;
    const roomKey = req.body.roomKey;
    const clinicianName = req.body.clinician;
    const clinicianSocketId = req.body.clinicianSocketId;
    clientList.forEach((id: any) => {
      if (unitySockets[id].socket) {
        unitySockets[id].socket.leave("waiting");
        unitySockets[id].socket.join(roomKey); //Join patients id for room?
        unitySockets[id].socket.emit("setClinicianID", clinicianSocketId);
        unitySockets[id].socket.emit("userJoined", { clinicianName });
        unitySockets[id].clinicianSocketId = clinicianSocketId;
        unitySockets[id].sessionKey = roomKey;
        getPatientOrCreate(unitySockets[id].name, clinicianName, id).then(
          (patient) => {
            addPatientToClinician(patient, clinicianName).then(() => {
              addPatientToSession(patient, roomKey).then(() => {
                addSessionToPatient(patient, roomKey);
              });
            });
          }
        );
      }
    });
    //addPatient(clientList, roomKey);
    res.sendStatus(200);
  });

  app.post("/leave", (req, res) => {
    const params = req.body as ISession;
    socket.leave(params.sessionKey);
    socket.to(params.sessionKey).emit("userLeft");
    socket.emit("userLeft");
    res.send({ success: true });
  });
});

mongoose.connect(
  "mongodb+srv://student:372@cluster0.mhv6x.mongodb.net/clinician-view?retryWrites=true&w=majority",
  () => {
    console.log("Database running");
    httpServer.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  }
);
