interface IPatientSocket {
  name: string;
  socketId: string;
  position?: object;
  handMirrored?: string;
  IKRigMeasurements?: object;
  handToScale?: string;
  scaleAmount?: number;
}

export default IPatientSocket;
