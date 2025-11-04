export enum GRID_METHOD {
  Shaping,
  Bezier,
  Wave,
  Uniform,
  StaticAlley,
  Random,
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
