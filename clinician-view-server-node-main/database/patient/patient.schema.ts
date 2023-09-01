import mongoose, { Schema, model, ObjectId } from "mongoose";

export interface IPatient {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  currentSession: ObjectId;
  createdBy: ObjectId;
  currentGame: ObjectId;
  pastGames: [];
  userName: string;
  createdAt: Date;
  patientId: string;
}

export const PatientSchema = new Schema<IPatient>({
  firstName: {
    type: String,
    default: "FirstNameDefault",
    lowercase: true,
  },
  lastName: {
    type: String,
    default: "LastNameDefault",
    lowercase: true,
  },
  currentSession: {
    type: Schema.Types.ObjectId,
    ref: "Session",
    default: null,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "Clinician",
    default: null,
  },
  currentGame: { type: Schema.Types.ObjectId, ref: "Game", default: null },
  pastGames: [{ type: Schema.Types.ObjectId, ref: "Game", default: null }],
  userName: {
    type: String,
    required: true,
    lowercase: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    immutable: true,
  },
  patientId: String,
});

const PatientModel = model("Patient", PatientSchema, "Patient-Collection");
export default PatientModel;
