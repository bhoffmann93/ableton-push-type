// @ts-nocheck
import p5 from 'p5';
import './style.css';
import { getDateAndTimeString } from './utils/utils';
import { factory } from './factory';
import { EASE_TYPE, EASE_MIRROR_TYPE } from './types/types';
import { easing } from 'ts-easing';
import CubicBezier from '@thednp/bezier-easing';
import { PushController, PushLEDColor } from './midi';
import { GRID_CONFIG } from './config/grid.config';
import { Grid, METHOD } from './grid';

//configs
let debug = false;
let gridMethod = METHOD.EQUAL as METHOD;
let easeType = EASE_TYPE.parabola as EASE_TYPE;
const mirrorInput = EASE_MIRROR_TYPE.none as EASE_MIRROR_TYPE;
const selectedShape = 6;
//a4 1.41
const waveSpeed = 0.025;
const speed = 0.0125;

const bezierValues = [0.5, 0, 0.5, 1];
const easeCubicBezierX = new CubicBezier(...bezierValues);
const easeCubicBezierY = new CubicBezier(...bezierValues);

const primaryColor = GRID_CONFIG.swapColors ? GRID_CONFIG.colorPair[0] : GRID_CONFIG.colorPair[1];
const secondaryColor = GRID_CONFIG.swapColors ? GRID_CONFIG.colorPair[1] : GRID_CONFIG.colorPair[0];

// Initialize grid
const grid = new Grid(GRID_CONFIG.tilesX, GRID_CONFIG.tilesY);
let shouldSetButtonsToInitialShapeindex = false;

// Initialize MIDI controller
const pushController = new PushController(
  {
    knob1: GRID_CONFIG.alleyX,
    knob2: GRID_CONFIG.alleyY,
  },
  {
    onKnobChange: (knobIndex, value, allData) => {
      if (knobIndex === 0) GRID_CONFIG.alleyX = allData.knob1;
      if (knobIndex === 1) GRID_CONFIG.alleyY = allData.knob2;
    },
    onGridMethodChange: () => {
      const methods = Object.values(METHOD).filter((method) => typeof method === 'number');
      const currentIndex = methods.indexOf(gridMethod);
      const nextIndex = (currentIndex + 1) % methods.length;
      gridMethod = methods[nextIndex];
      console.log(METHOD[nextIndex]);
    },
    onShapingFunctionChange: () => {
      const ease = Object.values(EASE_TYPE).filter((ease) => typeof ease === 'number');
      const currentIndex = ease.indexOf(easeType);
      const nextIndex = (currentIndex + 1) % ease.length;
      easeType = ease[nextIndex];
      console.log('easeType: ', EASE_TYPE[nextIndex]);
    },
    onDeleteToggle: () => {
      shouldSetButtonsToInitialShapeindex = !shouldSetButtonsToInitialShapeindex;
    },
    onDebugToggle: () => {
      debug = !debug;
    },
    onReset: () => {
      grid.resetAllShapes();
    },
    onButtonPress: (row, col) => {
      const module = grid.getModule(row, col);
      if (!module) return;

      // Cycle through shapes
      if (shouldSetButtonsToInitialShapeindex) {
        grid.setModuleShapeIndex(row, col, grid.INITIAL_SHAPE_INDEX);
      } else {
        grid.cycleShapeIndex(row, col);
      }

      // Update LED
      const buttonId = 36 + (7 - row) * 8 + col;
      const updatedModule = grid.getModule(row, col);
      if (updatedModule && updatedModule.shapeIndex !== grid.INITIAL_SHAPE_INDEX) {
        pushController.setButtonLED(buttonId, PushLEDColor.BLUE_HI, true);
      } else {
        pushController.setButtonLED(buttonId, PushLEDColor.BLACK, false);
      }
    },
  }
);

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
      method: gridMethod,
      easeType,
      mirrorInput,
      easeCubicBezierX,
      easeCubicBezierY,
    });
  };

  p.draw = () => {
    let time = Math.sin(p.frameCount * waveSpeed) * 0.5 + 0.5;
    time = easing.outSine(time);

    grid.calculate(p, time, {
      tilesX: grid.getTilesX(),
      tilesY: grid.getTilesY(),
      alleyX: GRID_CONFIG.alleyX,
      alleyY: GRID_CONFIG.alleyY,
      method: gridMethod,
      easeType,
      mirrorInput,
      easeCubicBezierX,
      easeCubicBezierY,
    });

    grid.draw(p, primaryColor, secondaryColor, selectedShape, speed, debug);
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
