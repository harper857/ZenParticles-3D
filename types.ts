export enum ShapeType {
  HEART = 'Heart',
  FLOWER = 'Flower',
  SATURN = 'Saturn',
  BUDDHA = 'Buddha',
  FIREWORKS = 'Fireworks',
  SPHERE = 'Sphere'
}

export interface AppState {
  currentShape: ShapeType;
  particleColor: string;
  handDistance: number; // Normalized 0 to 1+
  isHandsDetected: boolean;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}