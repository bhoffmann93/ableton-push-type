// @ts-nocheck
import p5 from 'p5';
import './style.css';
import { getDateAndTimeString } from './utils/utils';
import { EASE_MIRROR_TYPE } from './types/types';
import { easing } from 'ts-easing';
import CubicBezier from '@thednp/bezier-easing';
import { PushController } from './midi';
import { GRID_CONFIG } from './config/grid.config';
import { Grid } from './grid';

// Constants
const mirrorInput = EASE_MIRROR_TYPE.none as EASE_MIRROR_TYPE;
const selectedShape = 6;
const waveSpeed = 0.025;
const speed = 0.0125;

const bezierValues = [0.5, 0, 0.5, 1];
const easeCubicBezierX = new CubicBezier(...bezierValues);
const easeCubicBezierY = new CubicBezier(...bezierValues);

const primaryColor = GRID_CONFIG.swapColors ? GRID_CONFIG.colorPair[0] : GRID_CONFIG.colorPair[1];
const secondaryColor = GRID_CONFIG.swapColors ? GRID_CONFIG.colorPair[1] : GRID_CONFIG.colorPair[0];

// Initialize grid and MIDI controller
const grid = new Grid(GRID_CONFIG.tilesX, GRID_CONFIG.tilesY);
const pushController = new PushController(grid, {
  knob1: GRID_CONFIG.alleyX,
  knob2: GRID_CONFIG.alleyY,
});

pushController.initialize().catch((err) => console.error('MIDI initialization failed:', err));

const sketch = new p5((p5Instance) => {
  const p = p5Instance as unknown as p5;

  p.setup = () => {
    p.createCanvas(GRID_CONFIG.canvasDimensions.width, GRID_CONFIG.canvasDimensions.height);
    grid.calculate(p, 1, {
      tilesX: grid.getTilesX(),
      tilesY: grid.getTilesY(),
      alleyX: GRID_CONFIG.alleyX,
      alleyY: GRID_CONFIG.alleyY,
      method: GRID_CONFIG.gridMethod,
      easeType: GRID_CONFIG.easeType,
      mirrorInput,
      easeCubicBezierX,
      easeCubicBezierY,
    });
  };

  p.draw = () => {
    let time = Math.sin(p.frameCount * waveSpeed) * 0.5 + 0.5;
    // time = easing.outSine(time);

    grid.calculate(p, time, {
      tilesX: grid.getTilesX(),
      tilesY: grid.getTilesY(),
      alleyX: GRID_CONFIG.alleyX,
      alleyY: GRID_CONFIG.alleyY,
      method: GRID_CONFIG.gridMethod,
      easeType: GRID_CONFIG.easeType,
      mirrorInput,
      easeCubicBezierX,
      easeCubicBezierY,
    });

    grid.draw(p, primaryColor, secondaryColor, selectedShape, speed, GRID_CONFIG.debug);
  };
}, document.getElementById('app') as HTMLElement);

document.addEventListener('keydown', (e) => {
  if (e.key === 's') {
    const date = getDateAndTimeString();
    sketch.saveCanvas((sketch as any).canvas, 'grid_' + date, 'png');
  }

  if (e.key === 'd') {
    // debug = !debug;
  }

  if (e.key === ' ') {
    sketch.noLoop();
  }
});
