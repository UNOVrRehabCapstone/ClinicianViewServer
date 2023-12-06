interface IPatientSocket {
  name: string;
  socketId: string;
  position?: object;
  handMirrored?: string;
  IKRigMeasurements?: object;
  handToScale?: string;
  scaleAmount?: number;
  balloonSettings? : BalloonSettings;
  

}

interface BalloonSettings{
  mode: string;
  target: string;
  freq: string;
  ratio: string;
  pattern: string;
  lives: string;
  hand: string;
  level: string;
  environment: string;
  modifier: string;
  numBalloonsSpawnedAtOnce: string;
  timeBetweenSpawns: string;
}

export default IPatientSocket;
