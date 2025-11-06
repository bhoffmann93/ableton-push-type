import { EASE_TYPE, EASE_MIRROR_TYPE } from '../types/types';
import CubicBezier from '@thednp/bezier-easing';
import { HexColor, HexPair } from '../types/color.types';

export enum GRID_METHOD {
  Uniform,
  Bezier,
  Wave,
  StaticAlley,
  Shaping,
  // Random,
}

export interface GridModule {
  w: number;
  h: number;
  shapeIndex?: number;
}

export interface GridState {
  modules: GridModule[][];
  scaleFactor: { x: number; y: number };
  scaleFactors: { x: number; y: number }[];
  randomColumnWidths: number[];
  randomRowHeights: number[];
  randomColumnWidthsSum: number;
  randomRowHeightsSum: number;
}

export interface GridParams {
  tilesX: number;
  tilesY: number;
  alleyX: number;
  alleyY: number;
  method: GRID_METHOD;
  easeType: EASE_TYPE;
  mirrorInput: EASE_MIRROR_TYPE;
  easeCubicBezierX: CubicBezier;
  easeCubicBezierY: CubicBezier;
  randomColumnWidths: number[];
  randomRowHeights: number[];
  // colorPair: HexPair;
  primaryColor: HexColor;
  secondaryColor: HexColor;
  debug: boolean;
}
