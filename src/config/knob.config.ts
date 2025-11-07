import { COLOR_PAIRS } from '../constants/color.constants';
import { GRID_CONFIG } from './grid.config';
import { KnobConfig } from '../midi';

export const KNOB_CONFIGS: KnobConfig[] = [
  {
    label: 'Colors',
    increment: 0.125 / 2.0,
    min: 0,
    max: Object.keys(COLOR_PAIRS).length - 1,
    initialValue: Object.keys(COLOR_PAIRS).findIndex((key) => COLOR_PAIRS[key] === GRID_CONFIG.colorPair),
    shouldRound: true,
  },
  {
    label: 'Alley X',
    increment: 0.01,
    min: 0,
    max: 1,
    initialValue: GRID_CONFIG.alleyX,
  },
  {
    label: 'Alley Y',
    increment: 0.01,
    min: 0,
    max: 1,
    initialValue: GRID_CONFIG.alleyY,
  },
  {
    label: 'Knob 4',
    increment: 1,
    min: 1,
    max: 20,
    initialValue: 0,
  },
  {
    label: 'Knob 5',
    increment: 0.1,
    min: 0,
    max: 10,
    initialValue: 1,
  },
  {
    label: 'Knob 6',
    increment: 0.1,
    min: 0,
    max: 10,
    initialValue: 1,
  },
  {
    label: 'Knob 7',
    increment: 0.1,
    min: 0,
    max: 10,
    initialValue: 1,
  },
  {
    label: 'Knob 8',
    increment: 0.1,
    min: 0,
    max: 10,
    initialValue: 1,
  },
];
