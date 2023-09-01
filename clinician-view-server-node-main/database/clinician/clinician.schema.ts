import mongoose, { Schema, model } from "mongoose";
import { PatientSchema } from "../patient/patient.schema";

export interface IClinician {
  userName: string;
  token: string;
  shaPassword: string;
  patients: [];
  createdAt: Date;
  isOnline: boolean;
  socketId: string;
}

const ClinicianSchema = new Schema<IClinician>({
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
      type: Schema.Types.ObjectId,
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

const ClinicianModel = model(
  "Clinician",
  ClinicianSchema,
  "Clinician-Collection"
);
export default ClinicianModel;
