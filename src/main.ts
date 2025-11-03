// @ts-nocheck
import p5 from 'p5';
import './style.css';
import { getDateAndTimeString } from './utils/utils';
import { easing } from 'ts-easing';
import CubicBezier from '@thednp/bezier-easing';
import { PushController } from './midi';
import { GRID_CONFIG } from './config/grid.config';
import { Grid } from './grid';
import { EASE_TYPE } from './types/types';

// Constants
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

// Update UI knobs
function updateKnobUI() {
  const midiData = pushController.getMidiData();

  //TOP KNOBS
  // Update all 8 knobs
  for (let i = 1; i <= 8; i++) {
    const knobKey = `knob${i}` as keyof typeof midiData;
    const knobAngle = midiData[knobKey] * 270 - 135; // Map 0-1 to -135° to 135°
    document.getElementById(`knob${i}`)?.style.setProperty('--rotation', `${knobAngle}deg`);
    const knobValue = document.getElementById(`knob${i}-value`);
    if (knobValue) knobValue.textContent = midiData[knobKey].toFixed(2);
  }

  // Update Grid Method display
  const gridMethodValue = document.getElementById('grid-method-value');
  if (gridMethodValue) {
    const methodNames = ['SHAPING', 'BEZIER', 'WAVE', 'EQUAL', 'STATIC', 'RANDOM'];
    gridMethodValue.textContent = methodNames[GRID_CONFIG.gridMethod] || 'EQUAL';
  }

  const easeTypes = Object.values(EASE_TYPE).filter((ease) => typeof ease === 'string');
  const easeTypeElement = document.getElementById('ease-type-value');
  if (easeTypeElement) easeTypeElement.textContent = easeTypes[GRID_CONFIG.easeType] || 'parabola';
}

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
      mirrorInput: GRID_CONFIG.mirrorInput,
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
      method: GRID_CONFIG.gridMethod,
      easeType: GRID_CONFIG.easeType,
      mirrorInput: GRID_CONFIG.mirrorInput,
      easeCubicBezierX,
      easeCubicBezierY,
    });

    grid.draw(p, primaryColor, secondaryColor, speed, GRID_CONFIG.debug);

    // Update knob UI every frame
    updateKnobUI();
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
