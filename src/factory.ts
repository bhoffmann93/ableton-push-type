import { parabola, sinc, clamp, step, linearPeak, peakify, peakifyInverted } from './utils/utils';
import { easing } from 'ts-easing';
import { EASE_TYPE, EASE_MIRROR_TYPE } from './types/types';
import { GridModule } from './grid/grid.types';

export const factory = (
  xN: number,
  yN: number,
  t: number,
  easeType: EASE_TYPE,
  mirrorInput: EASE_MIRROR_TYPE
): GridModule => {
  let eased: GridModule = {
    w: 1,
    h: 1,
  };
  let xInput = xN;
  let yInput = yN;

  switch (mirrorInput) {
    case EASE_MIRROR_TYPE.none:
      xInput = xN;
      yInput = yN;
      break;
    case EASE_MIRROR_TYPE.horizontal:
      xInput = 1 - xN;
      yInput = yN;
      break;
    case EASE_MIRROR_TYPE.vertical:
      xInput = xN;
      yInput = 1 - yN;
      break;
  }

  switch (easeType) {
    case EASE_TYPE.none:
      eased = {
        w: 1,
        h: 1,
      };
      break;
    case EASE_TYPE.linear:
      eased = {
        w: xInput,
        h: yInput,
      };
      break;
    case EASE_TYPE.linearPeak:
      eased = {
        w: linearPeak(xInput),
        h: linearPeak(yInput),
      };
      break;
    case EASE_TYPE.step:
      eased = {
        w: step(t, xInput),
        h: 1,
      };
      break;
    case EASE_TYPE.parabola:
      switch (mirrorInput) {
        case EASE_MIRROR_TYPE.none:
          eased = {
            w: parabola(xInput, 2 * t),
            h: parabola(yInput, 2 * t),
          };
          break;
        case EASE_MIRROR_TYPE.horizontal:
          eased = {
            w: 1 - parabola(xInput, 2 * t),
            h: parabola(yInput, 2 * t),
          };
          break;
        case EASE_MIRROR_TYPE.vertical:
          eased = {
            w: parabola(xInput, 2 * t),
            h: 1 - parabola(yInput, 2 * t),
          };
          break;
        case EASE_MIRROR_TYPE.both:
          eased = {
            w: 1 - parabola(xInput, 2 * t),
            h: 1 - parabola(yInput, 2 * t),
          };
          break;
      }
      break;
    case EASE_TYPE.sinc:
      eased = {
        w: Math.abs(sinc(xInput, 0.01 + t * 2)),
        h: Math.abs(sinc(yInput, 0.01 + t * 2)),
      };
      break;
    case EASE_TYPE.parabola2:
      eased = {
        w: Math.abs(parabola(xInput, 2)),
        h: Math.abs(parabola(yInput, 5)),
      };
      break;
    case EASE_TYPE.quadratic:
      eased = {
        w: easing.quadratic(xInput * t),
        h: easing.quadratic(yInput * t),
      };
      break;
    case EASE_TYPE.inQuart:
      eased = {
        w: easing.inQuart(xInput),
        h: easing.inQuart(yInput),
      };
      break;
    case EASE_TYPE.peak:
      eased = {
        w: 0.5 + t - peakify(xInput, easing.linear),
        h: 0.5 + t - peakify(yInput, easing.linear),
      };
      break;
    case EASE_TYPE.peakInvert:
      eased = {
        w: peakifyInverted(xInput, easing.linear),
        h: peakifyInverted(yInput, easing.linear),
      };
      break;
    case EASE_TYPE.peakQuart:
      eased = {
        w: peakify(xInput, easing.inQuart),
        h: peakify(yInput, easing.inQuart),
      };
      break;
    case EASE_TYPE.sin:
      eased = {
        w: Math.abs(Math.sin(xInput + t)),
        h: Math.sin(yInput + t) * 0.5 + 0.5,
      };
      break;
  }
  return {
    w: clamp(eased.w, 0, 1),
    h: clamp(eased.h, 0, 1),
  };
};
