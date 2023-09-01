import express from "express";
import { validateToken } from "../auth";
import PatientModel from "../database/patient/patient.schema";

const router = express.Router();

router.get("/:name/:id", (req, res) => {
  const token = req.headers.authorization as string;
  validateToken(token, async (success: boolean) => {
    if (success) {
      const patient = await PatientModel.findOne({ userName: req.params.name });
      res.status(200).send(JSON.stringify(patient));
    } else {
      res.sendStatus(403);
    }
  });
});

module.exports = router;
