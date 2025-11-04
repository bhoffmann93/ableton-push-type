import { COLOR_PAIRS } from '../constants/color.constants';
import { EASE_TYPE, EASE_MIRROR_TYPE } from '../types/types';
import { GRID_METHOD } from '../grid';
//!Contains State should be changed in the future
export const GRID_CONFIG = {
  canvasDimensions: { width: 800, height: 800 },
  tilesX: 8,
  tilesY: 8,
  alleyX: 0.1,
  alleyY: 0.1,
  colorPair: COLOR_PAIRS.MERCURY_RED_ORANGE,
  swapColors: false,
  debug: true,
  gridMethod: GRID_METHOD.Uniform as GRID_METHOD,
  easeType: EASE_TYPE.parabola as EASE_TYPE,
  shouldSetButtonsToInitialShapeindex: false,
  mirrorInput: EASE_MIRROR_TYPE.none as EASE_MIRROR_TYPE,
};
