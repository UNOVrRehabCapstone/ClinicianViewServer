import mongoose, { Schema, model } from "mongoose";
import { GameSchema } from "../game/game.schema";
import { PatientSchema } from "../patient/patient.schema";

export interface ISession {
  createdAt: Date;
  createdBy: any;
  createdByName: string;
  patients: [];
  sessionKey: string;
  sessionName: string;
  currentGame: any;
}

const SessionSchema = new Schema<ISession>({
  createdAt: {
    type: Date,
    default: Date.now(),
    immutable: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
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
        type: Schema.Types.ObjectId,
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
    type: Schema.Types.ObjectId,
    ref: "Game",
    default: null,
  },
});

const SessionModel = model("Session", SessionSchema, "Session-Collection");
export default SessionModel;
