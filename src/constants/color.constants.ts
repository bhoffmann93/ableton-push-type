import { HexPair, HslaColor } from '../types/color.types';
import { hexToHsla } from '../utils/color.utils';

export const DARK_GREY_LIGHT_GREY: HexPair = ['#4E444A', '#EFEDEF'];
export const DARK_GREY_BLUE: HexPair = ['#0F5AEC', '#312926'];
//calm
export const SAN_JUAN_POLO_BLUE: HexPair = ['#2C4C76', '#96BCE2'];
export const SHAKESPEARE_WHITE: HexPair = ['#7DCBF2', '#F5F0E9'];
export const CUREULEAN_QUILL: HexPair = ['#3D54C7', '#D2CFCD'];
export const TORY_SHAKESPEARE: HexPair = ['#204FA7', '#60A2CA'];
export const EMERALD_TIBER_DARK: HexPair = ['#058C4E', '#0D3135'];
export const HIPPIE_PLANTATION: HexPair = ['#539BA6', '#284C4E'];
export const TROPICAL_ROCK_DARK: HexPair = ['#05563A', '#687798'];
export const ZUCCINI_EMERALD_DARK: HexPair = ['#023A1D', '#0D821B'];
//expressive
export const YELLOW_BUNKER: HexPair = ['#F4F516', '#0A0F14'];
export const FLUSH_ORANGE_NERO: HexPair = ['#FE8610', '#120600'];
export const LAS_PALAMAS_MOON_MIST: HexPair = ['#D4EE22', '#DDDBCD'];
export const MERCURY_RED_ORANGE: HexPair = ['#E3E2DE', '#FE4532'];
export const BLUE_RIBBON_VULCAN: HexPair = ['#0856FC', '#121622'];

//https://pigment.shapefactory.co/
export const COLOR_PAIRS: Readonly<Record<string, HexPair>> = {
  DARK_GREY_LIGHT_GREY,
  DARK_GREY_BLUE,
  //calm
  SAN_JUAN_POLO_BLUE,
  SHAKESPEARE_WHITE,
  CUREULEAN_QUILL,
  TORY_SHAKESPEARE,
  EMERALD_TIBER_DARK,
  HIPPIE_PLANTATION,
  TROPICAL_ROCK_DARK,
  ZUCCINI_EMERALD_DARK,
  //neon
  YELLOW_BUNKER,
  FLUSH_ORANGE_NERO,
  LAS_PALAMAS_MOON_MIST,
  MERCURY_RED_ORANGE,
  BLUE_RIBBON_VULCAN,
};

// export const HSLA_COLORS: Readonly<Record<string, HslaColor>> = {
//   RED: [0, 100, 50, 1],
//   BLUE: [240, 100, 50, 1],
//   GREEN: [120, 100, 50, 1],
//   GREEN_DIM: [150, 30, 50, 1],
//   PURPLE: [300, 100, 50, 1],
//   YELLOW: [60, 100, 50, 1],
//   ORANGE: [30, 100, 50, 1],
//   ORANGE_DIM: [30, 75, 75, 1],
//   WHITE: [0, 0, 100, 1],
//   BLACK: [0, 0, 0, 1],
//   GRAY: [0, 0, 50, 1],
//   PINK: [300, 100, 75, 1],
//   TRANSPARENT: [0, 0, 0, 0],
//   LAVENDEL: [280, 50, 80, 1.0],
//   CYAN: [183, 50, 50, 1.0],
//   GREY: [0, 0, 50, 1],
//   LIGHT_GREY: [0, 0, 75, 1],
// };

// //UI Colors
// export const UI_COLORS: Readonly<Record<string, HslaColor>> = {
//   POINTER_ACTIVE: [150, 100, 50, 1],
//   POINTER_HOVER: HSLA_COLORS.ORANGE_DIM,
//   POINTER_IDLE: HSLA_COLORS.LIGHT_GREY,
//   POINTER_NOT_DRAGGALBE: [150, 0, 50, 0.5],
//   POINTER_ANIMATING: [150, 100, 50, 1],
//   POINTER_PREVIOUS_POSITION: [150, 1, 50, 0.25],
//   RADIO_FIELD: HSLA_COLORS.GREY,
//   RADIO_FIELD_ACTIVE: [150, 100, 50, 1],
//   GESTURE_LOADING: [120, 100, 75, 1],
//   LANDMARK_POINT_COLOR: HSLA_COLORS.ORANGE,
//   CURSOR_LEFT: HSLA_COLORS.ORANGE,
//   CURSOR_RIGHT: HSLA_COLORS.ORANGE,
// };
