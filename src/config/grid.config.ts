import { COLOR_PAIRS } from '../constants/color.constants';
import { METHOD, EASE_TYPE } from '../types/types';

export const GRID_CONFIG = {
  canvasDimensions: { width: 800, height: 800 },
  tilesX: 8,
  tilesY: 8,
  alleyX: 0.1,
  alleyY: 0.1,
  colorPair: COLOR_PAIRS.DARK_GREY_LIGHT_GREY,
  swapColors: false,
  // App state properties
  debug: true,
  gridMethod: METHOD.EQUAL as METHOD,
  easeType: EASE_TYPE.parabola as EASE_TYPE,
  shouldSetButtonsToInitialShapeindex: false,
};
