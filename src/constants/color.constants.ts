import { HexPair, HslaColor } from '../types/color.types';
import { hexToHsla } from '../utils/color.utils';
import { PushLEDColor } from '../midi';

export const BROWN_GREY_LIGHT_GREY: HexPair = ['#4E444A', '#EFEDEF'];
export const BROWN_GREY_BLUE: HexPair = ['#312926', '#0F5AEC'];
export const DARK_GREY_LIGHT_GREY: HexPair = ['#727272ff', '#d0ced0ff'];
//calm
export const SAN_JUAN_POLO_BLUE: HexPair = ['#2C4C76', '#96BCE2'];
export const CUREULEAN_QUILL: HexPair = ['#D2CFCD', '#3D54C7'];
export const TORY_SHAKESPEARE: HexPair = ['#204FA7', '#050606ff'];
export const EMERALD_TIBER_DARK: HexPair = ['#058C4E', '#0D3135'];
//expressive
export const YELLOW_BUNKER: HexPair = ['#0A0F14', '#F4F516'];
export const FLUSH_ORANGE_NERO: HexPair = ['#FE8610', '#120600'];
export const LAS_PALAMAS_MOON_MIST: HexPair = ['#DDDBCD', '#D4EE22'];
export const MERCURY_RED_ORANGE: HexPair = ['#E3E2DE', '#FE4532'];
export const BLUE_RIBBON_VULCAN: HexPair = ['#0856FC', '#121622'];

//https://pigment.shapefactory.co/
export const COLOR_PAIRS: Readonly<Record<string, HexPair>> = {
  DARK_GREY_LIGHT_GREY,
  BROWN_GREY_LIGHT_GREY,
  BROWN_GREY_BLUE,
  //calm
  SAN_JUAN_POLO_BLUE,
  CUREULEAN_QUILL,
  TORY_SHAKESPEARE,
  EMERALD_TIBER_DARK,
  //neon
  YELLOW_BUNKER,
  MERCURY_RED_ORANGE,
  FLUSH_ORANGE_NERO,
  LAS_PALAMAS_MOON_MIST,
  BLUE_RIBBON_VULCAN,
};

export const COLOR_PAIR_PUSH_LED_MAP: Record<string, PushLEDColor> = {
  DARK_GREY_LIGHT_GREY: PushLEDColor.WHITE_HI,
  BROWN_GREY_LIGHT_GREY: PushLEDColor.WHITE_HI,
  BROWN_GREY_BLUE: PushLEDColor.BLUE_HI,
  //calm
  SAN_JUAN_POLO_BLUE: PushLEDColor.BLUE_HI,
  CUREULEAN_QUILL: PushLEDColor.BLUE_HI,
  TORY_SHAKESPEARE: PushLEDColor.BLUE_HI,
  EMERALD_TIBER_DARK: PushLEDColor.GREEN_HI,
  //neon
  YELLOW_BUNKER: PushLEDColor.YELLOW_HI,
  MERCURY_RED_ORANGE: PushLEDColor.RED_HI,
  FLUSH_ORANGE_NERO: PushLEDColor.ORANGE_HI,
  LAS_PALAMAS_MOON_MIST: PushLEDColor.YELLOW_HI,
  BLUE_RIBBON_VULCAN: PushLEDColor.BLUE_HI,
};

export const HSLA_COLORS: Readonly<Record<string, HslaColor>> = {
  RED: [0, 100, 50, 1],
  BLUE: [240, 100, 50, 1],
  GREEN: [120, 100, 50, 1],
  GREEN_DIM: [150, 30, 50, 1],
  PURPLE: [300, 100, 50, 1],
  YELLOW: [60, 100, 50, 1],
  ORANGE: [30, 100, 50, 1],
  ORANGE_DIM: [30, 75, 75, 1],
  WHITE: [0, 0, 100, 1],
  BLACK: [0, 0, 0, 1],
  GRAY: [0, 0, 50, 1],
  PINK: [300, 100, 75, 1],
  TRANSPARENT: [0, 0, 0, 0],
  LAVENDEL: [280, 50, 80, 1.0],
  CYAN: [183, 50, 50, 1.0],
  GREY: [0, 0, 50, 1],
  LIGHT_GREY: [0, 0, 75, 1],
};
