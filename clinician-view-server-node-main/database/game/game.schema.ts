import { Schema, model } from "mongoose";

interface IGame {
  createdAt: Date;
  createdBy: any;
  patient: any;
  gameName: string;
  patientRepCount: object;
  patientPositionalCoord: object;
}

export const GameSchema = new Schema<IGame>({
  createdAt: {
    type: Date,
    default: Date.now(),
    immutable: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "Clinician",
    immutable: true,
    default: null,
  },
  patient: {
    type: Schema.Types.ObjectId,
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

const GameModel = model("Game", GameSchema, "Game-Collection");
export default GameModel;
