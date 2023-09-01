import mongoose, { ObjectId } from "mongoose";
import { generateToken } from "../auth";
import ClinicianModel, { IClinician } from "./clinician/clinician.schema";
import PatientModel, { IPatient } from "./patient/patient.schema";
import SessionModel, { ISession } from "./session/session.schema";
import GameModel from "./game/game.schema";

export const deleteAllGames = async (clinician: string = "ALL") => {
  if (clinician === "ALL") {
    try {
      const res = await GameModel.deleteMany();
      return res;
    } catch (error) {
      console.log(error);
      return false;
    }
  } else {
    try {
      const clinicianDoc = await ClinicianModel.findOne({
        userName: clinician,
      });
      const res = await GameModel.deleteMany({ createdBy: clinicianDoc?._id });
      return res;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
};

export const checkClinicianWithPassword = async (
  username: string,
  shaPassword: string
) => {
  const res = await ClinicianModel.findOne({
    userName: username,
    shaPassword: shaPassword,
  });
  if (res) {
    const token = generateToken(res._id);
    if (await updateToken(res._id, token)) {
      return token;
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
};

const updateToken = async (id: mongoose.Types.ObjectId, token: string) => {
  try {
    await ClinicianModel.findOneAndUpdate({ _id: id }, { $set: { token } });
    return true;
  } catch (error) {
    return false;
  }
};

export const clearToken = async (id: mongoose.Types.ObjectId) => {
  return await updateToken(id, "");
};

export const getUserByTokenInDatabase = async (
  token: string,
  id: mongoose.Types.ObjectId
): Promise<IClinician> => {
  return (await ClinicianModel.findOne({ _id: id, token })) as IClinician;
};

export const getAllSessions = async (): Promise<ISession[]> => {
  return await SessionModel.find();
};

export const insertSession = async (
  sessionName: string,
  sessionId: string,
  userName: String
) => {
  try {
    const clinician = await ClinicianModel.findOne({ userName: userName });
    await SessionModel.create({
      sessionKey: sessionId,
      sessionName: sessionName,
      createdBy: clinician?._id,
      createdByName: clinician?.userName,
    });
    return true;
  } catch {
    return false;
  }
};

export const addPatientToSession = async (
  patient: IPatient,
  sessionKey: string
) => {
  try {
    const res = await SessionModel.findOneAndUpdate(
      { sessionKey: sessionKey },
      { $addToSet: { patients: patient._id } }
    );
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const addSessionToPatient = async (
  patient: IPatient,
  roomKey: string
) => {
  try {
    const session = await SessionModel.findOne({ sessionKey: roomKey });
    const res = await PatientModel.findOneAndUpdate(
      { userName: patient.userName },
      { $set: { currentSession: session?._id } }
    );
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const deleteSession = async (sessionKey: string) => {
  return await SessionModel.deleteOne({ sessionKey: sessionKey });
};

export const removePatientFromSession = async (
  sessionKey: string,
  patientId: string
) => {
  try {
    const patientToRemove = await PatientModel.findOneAndUpdate(
      { userName: patientId },
      { $set: { currentSession: null } }
    );
    const res = await SessionModel.findOneAndUpdate(
      { sessionkey: sessionKey },
      {
        $pull: { patients: patientToRemove?._id },
      }
    );
    return res;
  } catch {
    return false;
  }
};

export const updatePatientFirstName = async (
  firstName: string,
  sessionKey: string
) => {
  try {
    const session = await SessionModel.findOne({ sessionKey: sessionKey });
    const res = await PatientModel.updateOne(
      { currentSession: session?._id },
      {
        $set: { firstName: firstName },
      }
    );
    return res;
  } catch (error) {
    return false;
  }
};

export const updatePatientLastName = async (
  lastName: string,
  sessionKey: string
) => {
  try {
    const session = await SessionModel.findOne({ sessionKey: sessionKey });
    const res = await PatientModel.updateOne(
      { currentSession: session?._id },
      {
        $set: { lastName: lastName },
      }
    );
    return res;
  } catch (error) {
    return false;
  }
};

export const updatePatientUserName = async (
  userName: string,
  sessionKey: string
) => {
  try {
    const session = await SessionModel.findOne({ sessionKey: sessionKey });
    const res = await PatientModel.updateOne(
      { currentSession: session?._id },
      {
        $set: { lastName: userName },
      }
    );
    return res;
  } catch (error) {
    return false;
  }
};

export const getPatientOrCreate = async (
  patientName: string,
  clinicianName: string,
  patientId: string
) => {
  const clinicain = await ClinicianModel.findOne({ userName: clinicianName });
  let patient = await PatientModel.findOneAndUpdate(
    { userName: patientName },
    { patientId: patientId }
  );
  if (!patient) {
    patient = await PatientModel.create({
      userName: patientName,
      patientId: patientId,
      createdBy: clinicain?._id,
    });
  }
  return patient;
};

export const addPatientToClinician = async (
  patient: IPatient,
  clinicianName: string
) => {
  try {
    const res = await ClinicianModel.findOneAndUpdate(
      { userName: clinicianName },
      { $addToSet: { patients: patient._id } }
    );
    return true;
  } catch (error) {
    console.log(error);
  }
};

export const setClinicianOnlineStatusWithId = async (
  id: mongoose.Types.ObjectId,
  status: boolean
) => {
  return await ClinicianModel.findOneAndUpdate(
    { _id: id },
    { $set: { isOnline: status } }
  );
};

export const setClinicianOnlineStatusWithName = async (
  userName: string,
  shaPassword: string,
  status: boolean
) => {
  return await ClinicianModel.findOneAndUpdate(
    { userName: userName, shaPassword: shaPassword },
    { $set: { isOnline: status } }
  );
};

export const getClinicianWithName = async (userName: string) => {
  return await ClinicianModel.findOne({ userName: userName });
};

export const createGame = async (
  sessionKey: string,
  clinicianName: string,
  gameName: string,
  patientId: string
) => {
  try {
    const clinician = await ClinicianModel.findOne({ userName: clinicianName });
    const session = await SessionModel.findOne({ sessionKey: sessionKey });
    const game = await GameModel.create({
      createdBy: clinician?._id,
      gameName: gameName,
      patient: null,
    });
    await PatientModel.updateMany(
      { currentSession: session?._id },
      { $set: { currentGame: game._id } }
    );
    await SessionModel.updateMany(
      //
      { sessionKey: session?.sessionKey },
      { $set: { currentGame: game._id } }
    );
  } catch (error) {
    console.log(error);
  }
};
