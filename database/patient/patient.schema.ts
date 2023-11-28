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

  //New Balloon game progression information
  //    CareerProgress stores the maximum level the player has unlocked
  //    achievementProgress is a 10 bit binary string that represents which acheivements the player has unlocked
  //    levelxScore variables store the star rating the player has achieved for each level
  balloonProgress: {
    achievementProgress: string;
    careerProgress: string;
    levelOneScore:  string;
    levelTwoScore:  string;
    levelThreeScore: string;
    levelFourScore: string;
    levelFiveScore: string;
  }
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

  balloonProgress: {
    achievementProgress: {
      type: String,
      default: "0000000000",
    },
    careerProgress: {
      type: String,
      default: "0",
    },
    levelOneScore: {
      type: String,
      default: "0",
    },
    levelTwoScore: {
      type: String,
      default: "0",
    },
    levelThreeScore: {
      type: String,
      default: "0",
    },
    levelFourScore: {
      type: String,
      default: "0",
    },
    levelFiveScore: {
      type: String,
      default: "0",
    },
  },

});

const PatientModel = model("Patient", PatientSchema, "Patient-Collection");
export default PatientModel;
