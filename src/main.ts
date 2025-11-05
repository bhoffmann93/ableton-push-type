// @ts-nocheck
import p5 from 'p5';
import * as Tone from 'tone';
import './style.css';
import { getDateAndTimeString } from './utils/utils';
import { easing } from 'ts-easing';
import CubicBezier from '@thednp/bezier-easing';
import { PushController } from './midi';
import { GRID_CONFIG } from './config/grid.config';
import { Grid } from './grid';
import UserInterface from './ui/ui';

// Constants
const waveSpeed = 0.025;
const speed = 0.0125;

const bezierValues = [0.5, 0, 0.5, 1];
const easeCubicBezierX = new CubicBezier(...bezierValues);
const easeCubicBezierY = new CubicBezier(...bezierValues);

const primaryColor = GRID_CONFIG.swapColors ? GRID_CONFIG.colorPair[1] : GRID_CONFIG.colorPair[0];
const secondaryColor = GRID_CONFIG.swapColors ? GRID_CONFIG.colorPair[0] : GRID_CONFIG.colorPair[1];

// Initialize grid and MIDI controller
const grid = new Grid(GRID_CONFIG.tilesX, GRID_CONFIG.tilesY);
const pushController = new PushController(grid, {
  knob1: GRID_CONFIG.alleyX,
  knob2: GRID_CONFIG.alleyY,
});

pushController.initialize().catch((err) => console.error('MIDI initialization failed:', err));

const ui = new UserInterface(pushController);

let ready = false;
let osc;
let osc2;
let lfo;
let filter;
let filter2;
let waveform;
let params = {
  wavePartFactor: 1.0,
};
const initializeAudio = () => {
  // osc = new Tone.Oscillator();
  // osc.type = 'sine'; //triangle, sine, square, sawtooth
  // osc.frequency.value = Tone.Frequency('C3');
  // osc.toDestination(); //connect osc to audio out
  // // osc.start();

  // osc2 = new Tone.Oscillator();
  // osc2.type = 'sine';
  // osc2.frequency.value = Tone.Frequency('C3');
  // osc2.toDestination();
  // // osc2.start();

  // // filter = new Tone.Filter(1000, 'lowpass', -48).toDestination();
  // // filter2 = new Tone.Filter(1000, 'lowpass', -48).toDestination();
  // // filter.Q.value = 0.3;
  // // filter2.Q.value = 0.3;
  // // osc.connect(filter).start();
  // // osc2.connect(filter2).start();

  // lfo = new Tone.LFO(0.5, 200, 240);
  // lfo.connect(osc2.frequency);
  // lfo.start();

  const synth = new Tone.Synth().toDestination();

  //play a middle 'C' for the duration of an 8th note
  synth.triggerAttackRelease('C4', '8n');

  // waveform = new Tone.Waveform();
  // Tone.Destination.connect(waveform);
  Tone.Destination.volume.value = -24;
};

// function initializeGUI() {
//   const oscType = ['sine', 'triangle', 'square', 'sawtooth'];

//   gui = new dat.GUI();
//   gui.add(Tone.Destination.volume, 'value', -32, -12).step(0.1).name('volume');
//   gui.add(params, 'wavePartFactor', 0, 1);
//   gui.add(osc, 'type', oscType).name('osc1 type');
//   gui.add(osc.frequency, 'value', 0, 330).step(0.1).name('frequency 1');
//   gui.add(osc2, 'type', oscType).name('osc2 type');
//   gui.add(lfo.frequency, 'value', 0, 5).step(0.01).name('lfo frequency');
//   // gui.add(filter.frequency, 'value', 50, 10000).step(0.1).name('filter 1');
//   // gui.add(filter2.frequency, 'value', 50, 10000).step(0.1).name('filter 2');
// }

const sketch = new p5((p5Instance) => {
  const p = p5Instance as unknown as p5;

  p.setup = () => {
    initializeAudio();
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
    ui.updateKnobs();
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
