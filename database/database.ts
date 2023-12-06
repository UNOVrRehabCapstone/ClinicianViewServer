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
  try {
    const res = await ClinicianModel.findOne({
      userName: username,
      shaPassword: shaPassword,
    })
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
  }
  catch (error) {
    console.log("ERROR: ", error)
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

//    retrievePatientBalloonProgress finds a patient via their username in the database, then returns that patient's balloon game progress
//    or returns null if the patient isn't found
export const retrievePatientBalloonProgress = async (
  userName: string
) =>{
  let patient = await PatientModel.findOne({userName: userName});
  if(patient){
    return patient.balloonProgress;
  }
  else {
    PatientModel.create({
      userName:userName,
      patientId: "000",
    })
  };
  
}

export const updatePatientBalloonProgress = async(
  userName: string,
  achievementProgress: string,
  careerProgress:string,
  levelOneScore: string,
  levelTwoScore: string,
  levelThreeScore: string,
  levelFourScore:string,
  levelFiveScore:string,
  ach0: boolean,
  ach1: boolean,
  ach2: boolean,
  ach3: boolean,
  ach4: boolean,
  ach5: boolean,
  ach6: boolean,
  ach7: boolean,
  ach8: boolean,
  ach9: boolean,
) =>{
  //Check that everything is valid (achieveProgress length must equal 10, careerProgress must be between 0-5, level Scores must be between 0-3)
  //I know it's ugly.
  if(achievementProgress.length != 10){return null}
  if(parseInt(careerProgress) > 5 || parseInt(careerProgress) < 0){ return null}
  if(parseInt(levelOneScore)  > 3 || parseInt(levelOneScore)  < 0) {return null}
  if(parseInt(levelTwoScore) > 3 || parseInt(levelTwoScore)  < 0) {return null}
  if(parseInt(levelThreeScore)> 3 || parseInt(levelThreeScore)< 0) {return null}
  if(parseInt(levelFourScore) > 3 || parseInt(levelFourScore) < 0) {return null}
  if(parseInt(levelFiveScore) > 3 || parseInt(levelFiveScore) < 0) {return null}
  let doc = await PatientModel.findOneAndUpdate({userName: userName},{
     balloonProgress : {
        careerProgress : careerProgress,
        achievementProgress : achievementProgress,
        levelOneScore : levelOneScore,
        levelTwoScore : levelTwoScore,
        levelThreeScore : levelThreeScore,
        levelFourScore : levelFourScore,
        levelFiveScore : levelFiveScore,
        ach0: ach0,
        ach1: ach1,
        ach2: ach2,
        ach3: ach3,
        ach4: ach4,
        ach5: ach5,
        ach6: ach6,
        ach7: ach7,
        ach8: ach8,
        ach9: ach9,
      },
     },
     {new: true});

     console.log(doc)
}

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
