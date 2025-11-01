import { COLOR_PAIRS } from '../constants/color.constants';
import { METHOD, EASE_TYPE, EASE_MIRROR_TYPE } from '../types/types';

//!Contains State should be changed in the future
export const GRID_CONFIG = {
  canvasDimensions: { width: 800, height: 800 },
  tilesX: 8,
  tilesY: 8,
  alleyX: 0.1,
  alleyY: 0.1,
  colorPair: COLOR_PAIRS.DARK_GREY_LIGHT_GREY,
  swapColors: false,
  debug: true,
  gridMethod: METHOD.EQUAL as METHOD,
  easeType: EASE_TYPE.parabola as EASE_TYPE,
  shouldSetButtonsToInitialShapeindex: false,
  mirrorInput: EASE_MIRROR_TYPE.none as EASE_MIRROR_TYPE,
};
