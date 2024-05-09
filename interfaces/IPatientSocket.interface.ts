interface IPatientSocket {
  name: string;
  socketId: string;
  position?: object;
  handMirrored?: string;
  IKRigMeasurements?: object;
  handToScale?: string;
  scaleAmount?: number;
  balloonSettings? : BalloonSettings;
  planeSettings? : PlaneSettings;
  

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

interface PlaneSettings{
  rightSideSpawnOnly: boolean,
  leftSideSpawnOnly: boolean,
  griplessGrabbing: boolean,
  useDistanceFromHeadThrow: boolean,
  useAutoReleaseTimerThrow: boolean,
  useButtonPressForThrow: boolean,
  throwThreshold: number,
  requiredAimTime: number,
  useAutoAim: boolean,
  releaseButton: String,
  targets: number,
}

export default IPatientSocket;
