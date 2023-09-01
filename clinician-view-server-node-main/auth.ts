import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose, { mongo, ObjectId } from "mongoose";
import { IClinician } from "./database/clinician/clinician.schema";
import {
  clearToken,
  getUserByTokenInDatabase,
  setClinicianOnlineStatusWithId,
} from "./database/database";

const SECRET = process.env.SECRET || "secret";

export const generateToken = (id: mongoose.Types.ObjectId) => {
  return jwt.sign(
    {
      data: {
        id: id.toString(),
      },
    },
    SECRET,
    { expiresIn: "1d" }
  );
};

interface test {
  data: any;
  iat: number;
  exp: number;
}

export const validateToken = (
  token: string,
  cb: (success: boolean, user?: any) => void
) => {
  jwt.verify(token, SECRET, { ignoreExpiration: false }, (err, payload) => {
    if (!payload) {
      const dec = jwt.decode(token) as JwtPayload;
      const oId = new mongoose.Types.ObjectId(dec.data.id);
      clearToken(oId).then(() => {
        cb(false);
      });
    } else {
      const id = payload as test;
      const oId = new mongoose.Types.ObjectId(id.data.id); //
      if (err) {
        clearToken(oId).then(() => {
          cb(false);
        });
      } else {
        getUserByToken(token, oId).then((res) => {
          if (res) {
            cb(true, res);
          } else {
            clearToken(oId).then(() => {
              cb(false);
            });
          }
        });
      }
    }
  });
};

export const logout = (token: string, cb: () => void) => {
  const dec = jwt.decode(token) as JwtPayload;
  if (dec) {
    const oId = new mongoose.Types.ObjectId(dec.data.id);
    setClinicianOnlineStatusWithId(oId, false);
    clearToken(oId).then(() => {
      cb();
    });
  } else {
    cb();
  }
};

const getUserByToken = async (
  token: string,
  id: mongoose.Types.ObjectId
): Promise<IClinician> => {
  const user = await getUserByTokenInDatabase(token, id);
  return user;
};
