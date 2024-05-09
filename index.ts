import express, { json } from "express";
import cors from "cors";
import http from "http";
import { Server, Socket } from "socket.io";
import { MongoClient, ServerApiVersion } from "mongodb"
import "./database/database";
import { generateUniqueId } from "./utils";
import ClinicianModel, {
  IClinician,
} from "./database/clinician/clinician.schema";
import PatientModel from "./database/patient/patient.schema";
import SessionModel, { ISession } from "./database/session/session.schema";
import GameModel, { GameSchema } from "./database/game/game.schema";
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
  retrievePatientBalloonProgress,
  setClinicianOnlineStatusWithName,
  updatePatientBalloonProgress,
  updatePatientFirstName,
  updatePatientLastName,
  updatePatientUserName,
} from "./database/database";
import { logout, validateToken } from "./auth";
import mongoose from "mongoose";
import IPatientSocket from "./interfaces/IPatientSocket.interface";

// Start environment setup
import dotenv from 'dotenv';
dotenv.config();
// End environment setup

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT;
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
      "https://137.48.186.67/socket.io/?EIO=4&transport=polling&t=OMKLIpd",
      "ws://52.11.199.188/socket.io/?EIO=4&transport=websocket",
      "ws://137.48.186.67/socket.io/?EIO=4&transport=websocket",
      "http://localhost:5000/",
    ],
    methods: ["GET,HEAD,PUT,PATCH,POST,DELETE"],
  },
});

mongoose.set('strictQuery', true)
httpServer.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
  connect1();
})

async function connect1() {
  const uri = process.env.DBURI;
  if (uri) {
    mongoose.connect(uri);
  }
  else {
    console.log("Problem connecting to database. Environment variable not found.")
  }

}


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
  console.log("logging out")
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

  socket.on("balloonDataServerUpdate", () => {
    console.log("recieved balloon data server update")
    //socket.emit("balloonDataClientUpdate")


  })

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

  socket.on("test", (payload: IPatientSocket) => {
    socket.to(payload.socketId).emit("test");
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

  socket.on("balloonSettings", (payload: IPatientSocket) => {
    console.log(payload.balloonSettings);
    if(payload.balloonSettings){
      socket.to(payload.socketId).emit("balloonSettings", 
      {
        mode: payload.balloonSettings.mode,
        target: payload.balloonSettings.target,
        freq: payload.balloonSettings.freq,
        ratio: payload.balloonSettings.ratio,
        pattern: payload.balloonSettings.pattern,
        lives: payload.balloonSettings.lives,
        hand: payload.balloonSettings.hand, 
        careerModeLevelToPlay: payload.balloonSettings.level,
        modifier: payload.balloonSettings.modifier,
        numBalloonsSpawnedAtOnce: payload.balloonSettings.numBalloonsSpawnedAtOnce,
        timeBetweenSpawns: payload.balloonSettings.timeBetweenSpawns
      });
    }
  });

  socket.on("planeSettings", (payload: IPatientSocket) => {
    console.log(payload.planeSettings);
    if(payload.planeSettings){
      socket.to(payload.socketId).emit("planeSettings", 
      {
        rightSideSpawnOnly: payload.planeSettings.rightSideSpawnOnly,
        leftSideSpawnOnly: payload.planeSettings.leftSideSpawnOnly,
        griplessGrabbing: payload.planeSettings.griplessGrabbing,
        useDistanceFromHeadThrow: payload.planeSettings.useDistanceFromHeadThrow,
        useAutoReleaseTimerThrow: payload.planeSettings.useAutoReleaseTimerThrow,
        useButtonPressForThrow: payload.planeSettings.useButtonPressForThrow,
        throwThreshold: payload.planeSettings.throwThreshold,
        requiredAimTime: payload.planeSettings.requiredAimTime,
        useAutoAim: payload.planeSettings.useAutoAim,
        releaseButton: payload.planeSettings.releaseButton,
        targets: payload.planeSettings.targets,
      });
    }
  });

  socket.on("balloonSpawn", (payload: IPatientSocket) => {
    socket.to(payload.socketId).emit("balloonSpawn");
    console.log("spawned");

  });

  socket.on("gameEnded",(payload: any) =>{
    console.log(payload);
    socket.to(payload).emit("clientGameEnded") ;
  })

  socket.on("handScale", (payload: IPatientSocket) => {
    const scale = {
      handToScale: payload.handToScale,
      scaleAmount: payload.scaleAmount,
    };
    socket.to(payload.socketId).emit("handScale", scale);
  });



  socket.on("balloonProgressionUpdate",(payload: string) =>{
    const data = payload.split(":");
    let userName: string = data[0];
    updatePatientBalloonProgress(userName,data[1],
    data[2],
    data[3],
    data[4],
    data[5],
    (data[6] == "True"),
    (data[7] == "True"),
    (data[8] == "True"),
    (data[9] == "True"),
    (data[10] == "True"),
    (data[11] == "True"),
    (data[12] == "True"),
    (data[13] == "True"),
    (data[14] == "True"),
    (data[15] == "True"),
    )
    socket.to(data[16]).emit("balloonProgressionUpdate", userName);
  })

  socket.on("moveDartUp", (payload: IPatientSocket) =>{
    console.log("Up")
    socket.to(payload.socketId).emit("moveDartUp");
  });

  socket.on("moveDartDown", (payload: IPatientSocket) =>{
    console.log("Down")
    socket.to(payload.socketId).emit("moveDartDown");
  });


  app.post("/startGame", validate, (req, res) => {
    const params = req.body;
    for (const id in unitySockets) {
      if (params.sessionKey == unitySockets[id].sessionKey) {
        socket.to(id).emit("startGame", { game: params.game, environment: params.environment });
        createGame(params.sessionKey, params.userName, params.game, id);
      }
    }
    res.sendStatus(200);
  });


  app.post("/loadPatientBalloonData", validate, async (req,res) =>{
    const params = req.body;
    let progress;
    if(params.userName){
      progress = await retrievePatientBalloonProgress(params.userName);
    }
    console.log(progress?.ach9);
    if(progress){
      for( const id in unitySockets){
        socket.to(id).emit("balloonData",{userName: params.userName,
          levelOneScore : progress.levelOneScore,
          levelTwoScore : progress.levelTwoScore,
          levelThreeScore : progress.levelThreeScore,
          levelFourScore : progress.levelFourScore,
          levelFiveScore : progress.levelFiveScore,
          ach0: progress.ach0,
          ach1: progress.ach1,
          ach2: progress.ach2,
          ach3: progress.ach3,
          ach4: progress.ach4,
          ach5: progress.ach5,
          ach6: progress.ach6,
          ach7: progress.ach7,
          ach8: progress.ach8,
          ach9: progress.ach9,


        })
      }
    }
    res.send(progress);

  })

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
    console.log("attempting session join")
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


