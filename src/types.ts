export interface Color {
  red: number;
  green: number;
  blue: number;
}

export type RubickFace = [RubickPixel, RubickPixel, RubickPixel, RubickPixel, RubickPixel, RubickPixel, RubickPixel, RubickPixel, RubickPixel];

export interface RubickPixel {
  x: number;
  y: number;
  color: string;
}