import p5 from 'p5';
import { lerp, parabola, map } from './math.utils';
import floatHSL2RGB from 'float-hsl2rgb';
import floatRGB2HSL from 'float-rgb2hsl';
import { HslaPair, HslaColor, RgbVec3, Rgb, Rgba } from '../types/color.types';

//https://programmingdesignsystems.com/color/color-schemes/index.html
export const lightnessToLuminance = (l: number) => {
  if (l <= 8) {
    return (1.0 * l) / 903.2962962;
  } else {
    return 1.0 * Math.pow((l + 16) / 116, 3);
  }
};

//from hsvluv
//lower than 0.222 for bodytest
export const contrastRatio = (l1: number, l2: number) => {
  l1 = lightnessToLuminance(l1);
  l2 = lightnessToLuminance(l2);
  return (l1 + 0.05) / (l2 + 0.05);
};

//from https://www.npmjs.com/package/canvas-sketch-util
export const RGBAToHSLA = (rgba: Rgba): HslaColor => {
  const floatHSL = floatRGB2HSL([rgba[0] / 255, rgba[1] / 255, rgba[2] / 255]);
  return [
    Math.max(0, Math.min(360, Math.round(floatHSL[0] * 360))),
    Math.max(0, Math.min(100, Math.round(floatHSL[1] * 100))),
    Math.max(0, Math.min(100, Math.round(floatHSL[2] * 100))),
    rgba[3],
  ];
};

//rgb 0-255
export const HSLAToRGBA = (hsla: HslaColor) => {
  const hue = wrap(hsla[0], 0, 360);
  const floatRGB = floatHSL2RGB([hue / 360, hsla[1] / 100, hsla[2] / 100]);
  return [
    Math.max(0, Math.min(255, Math.round(floatRGB[0] * 255))),
    Math.max(0, Math.min(255, Math.round(floatRGB[1] * 255))),
    Math.max(0, Math.min(255, Math.round(floatRGB[2] * 255))),
    hsla[3],
  ];
};

export const hslaToNormalizedRGB = (hsla: HslaColor): RgbVec3 => {
  let [h, s, l] = hsla;
  h /= 360;
  s /= 100;
  l /= 100;

  function hueToRgb(p: number, q: number, t: number) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }

  return [r, g, b];
};

export const normalizedRGBToHSLA = (rgb: Rgb): HslaColor => {
  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  return [h, s * 100, l * 100, 1.0];
};

export const hexToRGB = (hex: string): Rgb | null => {
  if (hex.charAt(0) === '#') hex = hex.substring(1);
  if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) return null;

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return [r, g, b];
};

export const hexToHsla = (hex: string): HslaColor => {
  const rgb = hexToRGB(hex);
  if (rgb === null) throw new Error('Not a Hex String');

  return RGBAToHSLA([...rgb, 1.0]);
};

function wrap(value: number, from: number, to: number) {
  if (typeof from !== 'number' || typeof to !== 'number') {
    throw new TypeError('Must specify "to" and "from" arguments as numbers');
  }
  // algorithm from http://stackoverflow.com/a/5852628/599884
  if (from > to) [from, to] = [to, from];
  const cycle = to - from;
  if (cycle === 0) return to;

  return value - cycle * Math.floor((value - from) / cycle);
}

export const lerpHslColor = (p: p5, colorA: HslaColor, colorB: HslaColor, amt: number): HslaColor => {
  const hslA = colorA;
  const hslB = colorB;
  const h = lerp(hslA[0], hslB[0], amt);
  const s = lerp(hslA[1], hslB[1], amt);
  const l = lerp(hslA[2], hslB[2], amt);
  return [h, s, l, 1.0];
};

export const getHslaString = (hslaColor: HslaColor) => {
  const [h, s, l, a] = hslaColor;
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
};

export const setHsla = (colorToSet: HslaColor, h: number, s: number, l: number, a: number) => {
  colorToSet[0] = h;
  colorToSet[1] = s;
  colorToSet[2] = l;
  colorToSet[3] = a;
};

//https://iquilezles.org/articles/palettes/
//http://dev.thi.ng/gradients/
//t 0-1, returns [r,g,b] 0-1
//use smaller t values to only use a part of the palette, multiply repeats it

export const palette = (
  t: number,
  baseColor: RgbVec3,
  amplitudeOfColorVariation: RgbVec3,
  freqOfColorOscillation: RgbVec3,
  offsetForColorVariation: RgbVec3
): RgbVec3 => {
  return [
    baseColor[0] +
      amplitudeOfColorVariation[0] * Math.cos(6.28318 * (freqOfColorOscillation[0] * t + offsetForColorVariation[0])),
    baseColor[1] +
      amplitudeOfColorVariation[1] * Math.cos(6.28318 * (freqOfColorOscillation[1] * t + offsetForColorVariation[1])),
    baseColor[2] +
      amplitudeOfColorVariation[2] * Math.cos(6.28318 * (freqOfColorOscillation[2] * t + offsetForColorVariation[2])),
  ];
};

export const hslaPalette = (t: number, a: RgbVec3, b: RgbVec3, c: RgbVec3, d: RgbVec3): HslaColor => {
  const rgbColor = palette(t, a, b, c, d);
  return normalizedRGBToHSLA(rgbColor);
};

export const paletteDeepRed = (t: number): RgbVec3 => {
  const baseColor: RgbVec3 = [0.8, 0.1, 0.1]; // Base red color
  const amplitude: RgbVec3 = [0.4, 0.2, 0.2]; // Amplitude of color variation
  const frequency: RgbVec3 = [2.0, 1.0, 1.0]; // Frequency of color oscillation
  const offset: RgbVec3 = [0.0, 0.25, 0.25]; // Offset for color variation

  return palette(t, baseColor, amplitude, frequency, offset);
};

export const palettes = {
  rainbow: (t: number) => {
    return palette(t, [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [1.0, 1.0, 1.0], [0.0, 0.33, 0.67]);
  },
  heat: (t: number) => {
    return palette(t, [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [1.0, 1.0, 1.0], [0.0, 0.8, 0.67]);
  },
  blueBrown: (t: number) => {
    return palette(t, [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [1.0, 1.0, 1.0], [0.0, 0.1, 0.2]);
  },
  greenRed: (t: number) => {
    return palette(t, [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [1.0, 1.0, 1.0], [0.3, 0.2, 0.2]);
  },
  orangeBlue: (t: number) => {
    return palette(t, [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [1.0, 1.0, 0.5], [0.8, 0.9, 0.3]);
  },
  orangeViolette: (t: number) => {
    return palette(t, [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [1.0, 0.7, 0.4], [0.0, 0.15, 0.2]);
  },
  pinkGreen: (t: number) => {
    return palette(t, [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [2.0, 1.0, 0.0], [0.5, 0.2, 0.25]);
  },
  orangeGreen: (t: number) => {
    return palette(t, [0.8, 0.5, 0.4], [0.2, 0.4, 0.2], [2.0, 1.0, 1.0], [0.0, 0.25, 0.25]);
  },
  aquamarine: (t: number) => {
    return palette(t, [0.1, 0.7, 0.5], [0.3, 0.4, 0.6], [1.0, 1.0, 0.2], [0.2, 0.3, 0.8]);
  },
};

export const hslaPalettes: { [key: string]: (t: number) => HslaColor } = {
  rainbow: (t: number): HslaColor => {
    const rgbColor = palettes.rainbow(t);
    return normalizedRGBToHSLA(rgbColor);
  },
  heat: (t: number): HslaColor => {
    const rgbColor = palettes.heat(t);
    return normalizedRGBToHSLA(rgbColor);
  },
  blueBrown: (t: number): HslaColor => {
    const rgbColor = palettes.blueBrown(t);
    return normalizedRGBToHSLA(rgbColor);
  },
  greenRed: (t: number): HslaColor => {
    const rgbColor = palettes.greenRed(t);
    return normalizedRGBToHSLA(rgbColor);
  },
  orangeBlue: (t: number): HslaColor => {
    const rgbColor = palettes.orangeBlue(t);
    return normalizedRGBToHSLA(rgbColor);
  },
  orangeViolette: (t: number): HslaColor => {
    const rgbColor = palettes.orangeViolette(t);
    return normalizedRGBToHSLA(rgbColor);
  },
  pinkGreen: (t: number): HslaColor => {
    const rgbColor = palettes.pinkGreen(t);
    return normalizedRGBToHSLA(rgbColor);
  },
  orangeGreen: (t: number): HslaColor => {
    const rgbColor = palettes.orangeGreen(t);
    return normalizedRGBToHSLA(rgbColor);
  },
  aquamarine: (t: number): HslaColor => {
    const tN = t + 0.25;
    // const tN = parabola(t, 1.0);
    const rgbColor = palettes.aquamarine(tN);
    return normalizedRGBToHSLA(rgbColor);
  },
  deepRed: (t: number): HslaColor => {
    const tN = t * 0.5;
    const rgbColor = paletteDeepRed(tN);
    return normalizedRGBToHSLA(rgbColor);
  },
  silver: (t: number): HslaColor => {
    const parabolaFactor = parabola(t, 1);
    const lightness = map(parabolaFactor, 0, 1, 50, 100);
    return [0, 0, lightness, 1.0];
  },
};

export const swapColorPair = (pair: HslaPair) => {
  const [a, b] = pair;
  return [b, a] as HslaPair;
};
