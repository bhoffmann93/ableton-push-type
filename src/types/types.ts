export enum METHOD {
  Shaping,
  Wave,
  Uniform,
  Alley,
  // Bezier,
  // Random,
}

export interface GridModule {
  w: number;
  h: number;
  shapeIndex: number;
}

export enum EASE_TYPE {
  none,
  linear,
  linearPeak,
  step,
  parabola,
  sinc,
  parabola2,
  // parabolaInvertY,
  quadratic,
  inQuart,
  // inQuartInvert,
  // inQuartAnimated,
  peak,
  peakInvert,
  peakQuart,
  peakEdge,
  sin,
}

export enum EASE_MIRROR_TYPE {
  none,
  horizontal,
  vertical,
  both,
}
