import express from "express";
import { validateToken } from "../auth";
import { IClinician } from "../database/clinician/clinician.schema";
import {
  deleteSession,
  getAllSessions,
  insertSession,
} from "../database/database";
import { ISession } from "../database/session/session.schema";
import { generateUniqueId } from "../utils";

const router = express.Router();

router.get("/", (req, res) => {
  const token = req.headers.authorization as string;
  validateToken(token, (success: boolean, user: IClinician) => {
    if (success) {
      getAllSessions()
        .then((sessions) => {
          res.send({ sessions });
        })
        .catch(() => {
          res.sendStatus(500);
        });
    } else {
      res.sendStatus(403);
    }
  });
});

router.post("/", (req, res) => {
  const params = req.body as ISession;
  const token = req.headers.authorization as string;
  validateToken(token, (success: boolean, user: IClinician) => {
    if (success) {
      getAllSessions().then((sessions) => {
        const id = generateUniqueId(
          5,
          sessions.map((s) => s.sessionKey)
        );
        insertSession(params.sessionName, id, user.userName).then((suc) => {
          if (suc) {
            res.send({ success: true });
          } else {
            res.sendStatus(500);
          }
        });
      });
    } else {
      res.sendStatus(403);
    }
  });
});

router.delete("/", (req, res) => {
  const params = req.body;
  const token = req.headers.authorization as string;
  validateToken(token, (success: boolean) => {
    if (success) {
      deleteSession(params.sessionKey);
      res.sendStatus(200);
    } else {
      res.sendStatus(403);
    }
  });
});

router.get(`/:sessionKey`, (req, res) => {
  console.log("Session Key: " + req.params.sessionKey);
});

module.exports = router;
