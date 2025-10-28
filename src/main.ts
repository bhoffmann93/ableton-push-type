// @ts-nocheck
import p5 from 'p5';
import './style.css';
import { getDateAndTimeString } from './utils/utils';
import { factory } from './factory';
import { peakify, clamp, map } from './utils/utils';
import { EASE_TYPE, METHOD, GridModule, EASE_MIRROR_TYPE } from './types';
import { easing } from 'ts-easing';
import { Pane } from 'tweakpane';
import * as EssentialPlugin from '@tweakpane/plugin-essentials';
import CubicBezier from '@thednp/bezier-easing';
import { TpChangeEvent } from '@tweakpane/core';
import { WebMidi, Utilities } from 'webmidi';

//configs
let debug = true;
let gridMethod = METHOD.EQUAL as METHOD;
let easeType = EASE_TYPE.parabola as EASE_TYPE;
const mirrorInput = EASE_MIRROR_TYPE.none as EASE_MIRROR_TYPE;
const word = 'PROCESS'.split('');
console.log('word: ', word);
const font = 'Basier Square Mono';
const canvasSize = {
  x: 800,
  y: 800,
};
const selectedShape = 6;
//a4 1.41
const waveSpeed = 0.025;
const speed = 0.0125;

const bezierValues = [0.5, 0, 0.5, 1];
let easeCubicBezierX = new CubicBezier(...bezierValues);
let easeCubicBezierY = new CubicBezier(...bezierValues);

// const greyDark = '#4E444A';
// const greyLight = '#EFEDEF';
const blue = '#0F5AEC';
const grey = '#312926';
const primaryColor = blue;
const secondaryColor = grey;

const scaleFactor = { x: 1, y: 1 };
const scaleFactors: { x: number; y: number }[] = [];
const randomColumnWidths: number[] = [];
const randomRowHeights: number[] = [];
let randomColumnWidthsSum = 0;
let randomRowHeightsSum = 0;

const PARAMS = {
  tilesX: 8,
  tilesY: 8,
  alleyX: 0.1,
  alleyY: 0.1,
};
const modules: GridModule[][] = [];
const INITIAL_SHAPE_INDEX = 0;
const AMOUNT_OF_SHAPES = 15;
let shouldSetButtonsToInitialShapeindex = false;

for (let iY = 0; iY < PARAMS.tilesY; iY++) {
  const rowModules = [];
  for (let iX = 0; iX < PARAMS.tilesX; iX++) {
    rowModules.push({
      w: 0,
      h: 0,
      shapeIndex: INITIAL_SHAPE_INDEX,
    });
  }
  modules.push(rowModules);
}

PARAMS.tilesX += 1;
PARAMS.tilesY += 1;
// PARAMS.tilesX = PARAMS.tilesX % 2 === 0 ? PARAMS.tilesX : PARAMS.tilesX + 1;
// PARAMS.tilesY = PARAMS.tilesY % 2 === 0 ? PARAMS.tilesY : PARAMS.tilesY + 1;
setRandomRowColDimensions();

//midi
const MIDI_INCREMENT = 0.05;
const MIDI_INCREMENT_FINE = 0.001;
const CLAMP_MIDI_01 = false;
const CLAMP_MIDI_0_INFINITY = true;
const INITIAL_MIDI_VALUE = 0;
const midiData = {
  knob1: PARAMS.alleyX,
  knob2: PARAMS.alleyY,
  knob3: INITIAL_MIDI_VALUE,
  knob4: INITIAL_MIDI_VALUE,
  knob5: INITIAL_MIDI_VALUE,
  knob6: INITIAL_MIDI_VALUE,
  knob7: INITIAL_MIDI_VALUE,
  knob8: INITIAL_MIDI_VALUE,
};
let midiOutput;

const initMidi = () => {
  // Function triggered when WEBMIDI.js is ready
  const onEnabled = () => {
    // Display available MIDI input devices
    if (WebMidi.inputs.length < 1) {
      document.body.innerHTML += 'No device detected.';
    } else {
      WebMidi.inputs.forEach((device, index) => {
        console.log(`${index}: ${device.name}`);
      });
    }
    const mySynth = WebMidi.getInputByName('Ableton Push User Port');
    midiOutput = WebMidi.getOutputByName('Ableton Push User Port');
    setAllButtonsLEDsOff();
    console.log('midiOutput: ', midiOutput);
    console.log('mySynth: ', mySynth);

    mySynth.addListener(
      'controlchange',
      (e) => {
        // document.body.innerHTML += `${e.note.name} <br>`;
        // console.log(`${e.note.name}:`);
        // console.log('data: ', e.data);
        // console.log('rawValue: ', e.rawValue);
        // console.log('e: ', e.note);
        // console.log('e: ', e);
        const increment = MIDI_INCREMENT;
        // if (e.controllerNumber == 85 && e.rawValue == 127) increment = MIDI_INCREMENT_FINE;
        // console.log('increment: ', increment);

        //KNOBS
        if (e.controller.number >= 71 && e.controller.number <= 78) {
          const knobIndex = e.controller.number - 71;
          const value = e.rawValue;
          let normalizedMidiValue = Utilities.from7bitToFloat(value);

          if (normalizedMidiValue <= 1 && normalizedMidiValue > 0.5) {
            normalizedMidiValue = 1 - normalizedMidiValue;
            // midiData[`knob${knobIndex + 1}`] -= mappedValue;
            midiData[`knob${knobIndex + 1}`] -= increment;
          } else if (normalizedMidiValue < 0.5 && normalizedMidiValue > 0) {
            // midiData[`knob${knobIndex + 1}`] += mappedValue;

            midiData[`knob${knobIndex + 1}`] += increment;
          }
          if (CLAMP_MIDI_01) {
            midiData[`knob${knobIndex + 1}`] = clamp(midiData[`knob${knobIndex + 1}`], 0, 1);
          }
          if (CLAMP_MIDI_0_INFINITY) {
            midiData[`knob${knobIndex + 1}`] = clamp(midiData[`knob${knobIndex + 1}`], 0, Infinity);
          }
          PARAMS.alleyX = midiData.knob1;
          PARAMS.alleyY = midiData.knob2;
          // console.log('knob:', midiData[`knob${knobIndex + 1}`]);
          // console.log('midiData: ', midiData);
          // console.log(`knob${knobIndex + 1}: `, mappedValue);
        }

        //KNOB LEFT 1 Grid Method
        if (e.controller.number == 14) {
          const methods = Object.values(METHOD).filter((method) => typeof method === 'number');
          const currentIndex = methods.indexOf(gridMethod);
          const nextIndex = (currentIndex + 1) % methods.length;
          gridMethod = methods[nextIndex];
          console.log(METHOD[nextIndex]);
        }
        //KNOB LEFT 2 Shaping Function
        if (e.controller.number == 15) {
          const ease = Object.values(EASE_TYPE).filter((ease) => typeof ease === 'number');
          const currentIndex = ease.indexOf(easeType);
          const nextIndex = (currentIndex + 1) % ease.length;
          easeType = ease[nextIndex];
          console.log('easeType: ', EASE_TYPE[nextIndex]);
        }
        //NEW "delete"
        if (e.controller.number == 87) {
          shouldSetButtonsToInitialShapeindex = !shouldSetButtonsToInitialShapeindex;
        }
        // RECORD Grid
        if (e.controller.number == 86 && e.rawValue == 127) {
          debug = !debug;
        }
        //PLAY Reset
        if (e.controller.number == 85 && e.rawValue == 127) {
          modules.forEach((row) => {
            row.forEach((module) => {
              module.shapeIndex = INITIAL_SHAPE_INDEX;
            });
            setAllButtonsLEDsOff();
          });
        }
      },
      { channels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] }
    );

    mySynth.addListener('noteon', (e) => {
      // console.log(`Note on: ${e.note.name}${e.note.octave} Velocity: ${e.velocity}`);
      // console.log('data: ', e.data);

      //BUTTONS
      if (!modules) return;
      if (e.data[1] >= 36 && e.data[1] <= 99) {
        const controllerNumber = e.data[1];
        const row = 7 - Math.floor((controllerNumber - 36) / 8);
        const col = (controllerNumber - 36) % 8;
        //cycle through shapes
        if (shouldSetButtonsToInitialShapeindex) modules[row][col].shapeIndex = INITIAL_SHAPE_INDEX;
        else modules[row][col].shapeIndex = (modules[row][col].shapeIndex + 1) % AMOUNT_OF_SHAPES; // Assuming there are 11 shapes
        // console.log('modules[row][col].shapeIndex: ', modules[row][col].shapeIndex);
        // console.log('', modules[row][col]);

        const buttonId = e.data[1];
        if (modules[row][col].shapeIndex != INITIAL_SHAPE_INDEX) {
          // BLACK = 0
          // WHITE_HI = 3
          // RED_HI = 120
          // ORANGE_HI = 60
          // YELLOW_HI = 13
          // GREEN_HI = 21
          // CYAN_HI = 33
          // BLUE_HI = 45
          // INDIGO_HI = 49
          // VIOLET_HI = 53
          // const buttonColor = colors[modules[row][col].shapeIndex % colors.length];
          const buttonColor = 45;
          midiOutput.sendNoteOn(buttonId, { rawAttack: buttonColor, channel: 1 }); // Channel 1 for User Mode
        } else {
          midiOutput.sendNoteOff(buttonId, { channel: 1 });
        }
      }
    });

    function setAllButtonsLEDsOff() {
      for (let i = 36; i <= 99; i++) {
        midiOutput.sendNoteOff(i, { channel: 1 });
      }
    }
  };

  WebMidi.enable()
    .then(onEnabled)
    .catch((err) => alert(err));
};
initMidi();

const pane = new Pane();
pane.registerPlugin(EssentialPlugin);
const folder = pane.addFolder({
  title: 'Config',
});
folder
  .addInput(PARAMS, 'tilesX', {
    min: 2,
    max: 50,
    step: 2,
  })
  //@ts-ignore
  .on('change', (e: TpChangeEvent) => {
    PARAMS.tilesX = e.value;
    PARAMS.tilesX = PARAMS.tilesX % 2 === 0 ? PARAMS.tilesX : PARAMS.tilesX + 1;
    setRandomRowColDimensions();
  });
folder
  .addInput(PARAMS, 'tilesY', {
    min: 2,
    max: 50,
    step: 2,
  })
  //@ts-ignore
  .on('change', (e: TpChangeEvent) => {
    PARAMS.tilesY = e.value;
    PARAMS.tilesY = PARAMS.tilesY % 2 === 0 ? PARAMS.tilesY : PARAMS.tilesY + 1;
    setRandomRowColDimensions();
  });
folder.addInput(PARAMS, 'alleyX', {
  min: 0,
  max: 0.5,
  step: 0.01,
});
folder.addInput(PARAMS, 'alleyY', {
  min: 0,
  max: 0.5,
  step: 0.01,
});

folder
  .addBlade({
    view: 'cubicbezier',
    value: bezierValues,
    // expanded: true,
    label: 'X',
    picker: 'inline',
  })
  //@ts-ignore
  .on('change', (e: TpChangeEvent) => {
    const [x1, y1, x2, y2] = e.value.comps_;
    easeCubicBezierX = new CubicBezier(x1, y1, x2, y2);
  });
folder
  .addBlade({
    view: 'cubicbezier',
    value: bezierValues,
    // expanded: true,
    label: 'Y',
    // picker: 'inline',
  })

  //@ts-ignore
  .on('change', (e: TpChangeEvent) => {
    const [x1, y1, x2, y2] = e.value.comps_;
    easeCubicBezierY = new CubicBezier(x1, y1, x2, y2);
  });
pane.hidden = false;

const sketch = new p5((p5Instance) => {
  const p = p5Instance as unknown as p5;

  p.setup = () => {
    p.createCanvas(canvasSize.x, canvasSize.y);
    calcGrid(p, 1);
    // p.noLoop();
  };

  p.draw = () => {
    let time = Math.sin(p.frameCount * waveSpeed) * 0.5 + 0.5;
    // time = (p.frameCount * speed) % 1;
    time = easing.outSine(time);

    calcGrid(p, time);
    drawGrid(p);
    if (debug) {
      // drawMidCross(p);
    }
  };
}, document.getElementById('app') as HTMLElement);

function setRandomRowColDimensions() {
  if (randomColumnWidthsSum !== 0) randomColumnWidthsSum = 0;
  if (randomRowHeightsSum !== 0) randomRowHeightsSum = 0;
  // randomColumnWidths[0] = 0;
  // randomRowHeights[0] = 0;

  for (let iX = 1; iX < PARAMS.tilesX; iX++) {
    if (iX % 2 === 0 && iX >= 1) {
      randomColumnWidths[iX] = 0.1;

      //TODO alley calculation maybe needs to happen here width the aspect ratio?
    } else {
      randomColumnWidths[iX] = clamp(Math.random(), 0.25, 1);
      randomColumnWidthsSum += randomColumnWidths[iX];
    }
  }
  for (let iY = 1; iY < PARAMS.tilesY; iY++) {
    if (iY % 2 === 0 && iY >= 1) {
      randomRowHeights[iY] = 0.1;
    } else {
      randomRowHeights[iY] = clamp(Math.random(), 0.25, 1);
      randomRowHeightsSum += randomRowHeights[iY];
    }
  }
}

function calcGrid(p: p5, time: number) {
  const tileWo = p.width / PARAMS.tilesX;
  const tileHo = p.height / PARAMS.tilesY;
  let sumWidth = 0;
  let sumHeight = 0;

  for (let iY = 1; iY < PARAMS.tilesY; iY++) {
    const rowModules = [];

    const freqY = 0.3;
    const ampWaveY = 0.7; //0-1
    const waveY = ampWaveY * Math.sin(iY * freqY + p.frameCount * 0.01) * 0.5 + 0.5;

    for (let iX = 1; iX < PARAMS.tilesX; iX++) {
      const w = iX / PARAMS.tilesX;
      const h = iY / PARAMS.tilesY;
      let eased = { w: 0, h: 0 };
      const aspect = tileWo / tileHo;

      switch (gridMethod) {
        case METHOD.RANDOM:
          eased.w = isAlley(iX) ? PARAMS.alleyX : randomColumnWidths[iX];
          eased.h = isAlley(iY) ? PARAMS.alleyX * aspect : randomRowHeights[iY];
          break;
        case METHOD.STATIC_ALLEY:
          eased.w = isAlley(iX) ? PARAMS.alleyX : 1;
          eased.h = isAlley(iY) ? PARAMS.alleyX * aspect : 1;
          break;
        case METHOD.EQUAL:
          eased.w = 1;
          eased.h = 1;
          break;
        case METHOD.SHAPING_FUNCTION:
          const easedOut = factory(w, h, time, easeType, mirrorInput);
          eased.w = isAlley(iX) ? PARAMS.alleyX : easedOut.w;
          eased.h = isAlley(iY) ? PARAMS.alleyY : easedOut.h;
          break;
        case METHOD.BEZIER:
          //@ts-ignore
          eased.w = clamp(peakify(w, easeCubicBezierX), 0, 1);
          //@ts-ignore
          eased.h = clamp(peakify(h, easeCubicBezierY), 0, 1);
          break;
        case METHOD.WAVE:
          const freqX = 5;
          const ampWaveX = 0.5; //0-1
          const offWaveX = 1 + time * 0.5;
          let waveX = 0;

          const wave0 = Math.sin(p.frameCount * 0.01) * 0.5 + 0.5;
          // if (iX < tilesX / 2) {
          waveX = 1;
          if (iX % 3 === 0) {
            // waveX = 1;
            // waveX = wave0;
            // waveX = ampWaveX * Math.sin(iX * freqX + p.frameCount * 0.01 + iY * offWaveX) * 0.5 + 0.5;
            // waveX = 1 - wave0 * 0.75;
          } else {
            // waveX = ampWaveX * Math.sin(iX * freqX + p.frameCount * 0.01 + iY * offWaveX) * 0.5 + 0.5;
          }
          //fixed
          if (iX > 4 && iX < 11 && iY > 4 && iY < 11) {
            // waveX = wave0;
          }

          if (isAlley(iX)) {
            // waveX = PARAMS.alleyX;
          }
          if (isAlley(iY)) {
            // waveY = PARAMS.alleyY;
          }
          // eased = {
          //   w: waveX,
          //   h: 1,
          // };
          eased = {
            w: waveX,
            h: waveY,
          };
          // console.log(eased.w.toFixed(1));
          // console.log(eased.h.toFixed(1));

          // if (iX === 10 && iY === 10) console.log('eased: ', eased.w);
          break;
      }

      const tileWeased = tileWo * eased.w;
      const tileHeeased = tileHo * eased.h;

      rowModules.push({
        w: tileWeased,
        h: tileHeeased,
        // shapeIndex: INITIAL_SHAPE_INDEX,
      });
      // rowModules[iX].w = tileWeased;
      // rowModules[iX].h = tileHeeased;

      sumWidth += tileWeased;
      if (iX === 1) sumHeight += tileHeeased;
    }

    if (iY === 1) scaleFactor.x = p.width / sumWidth;

    scaleFactors[iY - 1] = { x: p.width / sumWidth, y: 1 };
    sumWidth = 0;
    // modules[iY - 1] = rowModules;
    rowModules.forEach((module, iX) => {
      modules[iY - 1][iX].w = module.w;
      modules[iY - 1][iX].h = module.h;
    });
  }
  scaleFactor.y = p.height / sumHeight;
}

function drawGrid(p: p5) {
  p.background(secondaryColor);
  p.fill(primaryColor);
  p.noStroke();

  const tileWo = p.width / PARAMS.tilesX;
  const tileHo = p.height / PARAMS.tilesY;

  let tempPosY = 0;
  for (let iY = 1; iY < PARAMS.tilesY; iY++) {
    let tempPosX = 0;
    let tempHeight = 0;

    for (let iX = 1; iX < PARAMS.tilesX; iX++) {
      const { w, h, shapeIndex } = modules[iY - 1][iX - 1];
      // console.log('modules: ', modules);
      const scaleFactorN = scaleFactors[iY - 1];
      const tileW = w * scaleFactorN.x;
      const tileH = h * scaleFactor.y;

      const pos = {
        x: tempPosX,
        y: tempPosY,
      };

      //for debugging
      const posOrigGrid = {
        x: iX * tileWo,
        y: iY * tileHo,
      };

      // let wave = Math.sin(p.frameCount * speed + posOrigGrid.x * 10 + posOrigGrid.y * 10);
      let wave = Math.sin(p.frameCount * speed * pos.y * 0.01);
      wave = (wave * 0.5 + 0.5) * 5;
      wave = p.map(wave, 0, 4, 2, 6);
      wave = selectedShape;
      // const shapeIndex = Math.floor(wave);
      // const shapeIndex = Math.floor((midiData.knob1 * amountOfShapes) % amountOfShapes);
      // const shapeIndex = Math.floor(Math.random() * 3) + 3;
      drawShape(p, pos, shapeIndex, tileW, tileH, tileWo, tileHo, iX, iY);
      if (debug) drawDebugGrid(p, pos, tileW, tileH, iX, iY);

      tempPosX += tileW;
      tempHeight = tileH;
    }
    tempPosY += tempHeight;
  }
}

function drawShape(
  p: p5,
  pos: { x: number; y: number },
  shapeIndex: number,
  tileW: number,
  tileH: number,
  tileWo: number,
  tileHo: number,
  iX: number,
  iY: number
) {
  p.push();
  // p.translate(posOrigGrid.x, posOrigGrid.y);
  p.translate(pos.x, pos.y);
  switch (shapeIndex) {
    case 0:
      break;
    case 1:
      p.rect(0, 0, tileW, tileH);
      break;
    case 2:
      p.arc(0, 0, tileW * 2, tileH * 2, 0, Math.PI * 0.5);
      break;
    case 3:
      p.arc(tileW, 0, tileW * 2, tileH * 2, Math.PI * 0.5, Math.PI);
      break;
    case 4:
      p.arc(tileW, tileH, tileW * 2, tileH * 2, Math.PI, Math.PI * 1.5);
      break;
    case 5:
      p.arc(0, tileH, tileW * 2, tileH * 2, Math.PI * 1.5, Math.PI * 2);
      break;
    case 6:
      //triangle
      p.beginShape();
      p.vertex(0, 0);
      p.vertex(tileW, 0);
      p.vertex(tileW, tileH);
      p.endShape();
      break;
    case 7:
      p.beginShape();
      p.vertex(0, 0);
      p.vertex(tileW, 0);
      p.vertex(0, tileH);
      p.endShape();
      break;
    case 8:
      p.beginShape();
      p.vertex(tileW, 0);
      p.vertex(tileW, tileH);
      p.vertex(0, tileH);
      p.endShape();
      break;
    case 9:
      p.beginShape();
      p.vertex(0, 0);
      p.vertex(tileW, tileH);
      p.vertex(0, tileH);
      p.endShape();
      break;
    case 10:
      p.rect(0, 0, tileW / 2, tileH);
      p.arc(tileW / 2, tileH / 2, tileW, tileH, Math.PI * 1.5, Math.PI * 0.5);
      break;
    case 11:
      p.rect(tileW / 2, 0, tileW / 2, tileH);
      p.arc(tileW / 2, tileH / 2, tileW, tileH, Math.PI * 0.5, Math.PI * 1.5);
      break;
    case 12:
      p.rect(0, 0, tileW, tileH / 2);
      p.arc(tileW / 2, tileH / 2, tileW, tileH, 0, Math.PI);
      break;
    case 13:
      p.rect(0, tileH / 2, tileW, tileH / 2);
      p.arc(tileW / 2, tileH / 2, tileW, tileH, Math.PI, Math.PI * 2);
      break;
    case 14:
      // const wave = Math.sin(p.frameCount * speed + iX * 10 + iY * 10);
      // const waveMapped = p.map(wave, -1, 1, 0.25, 1.0);
      if (isXorYAlley(iX, iY)) {
        // p.fill(0, 0, 0, 0);
      }
      p.ellipseMode(p.CORNERS);
      p.ellipse(0, 0, tileW, tileH);
      // p.ellipseMode(p.CENTER);
      // p.ellipse(tileW * 0.5, tileH * 0.5, tileW * waveMapped, tileH * waveMapped);
      break;
  }
  p.pop();
}

function drawDebugGrid(p: p5, pos: { x: number; y: number }, tileW: number, tileH: number, iX: number, iY: number) {
  p.push();
  p.noFill();
  p.stroke(255);
  p.strokeWeight(1);
  p.translate(pos.x, pos.y);
  p.rect(0, 0, tileW, tileH);
  p.textStyle(p.NORMAL);
  p.noStroke();
  p.fill(255, 0, 0);
  p.textSize(18);
  p.textAlign(p.CENTER, p.CENTER);
  // p.text(iX + ' ' + iY, tileW * 0.5, tileH * 0.5);
  p.pop();
}

function drawMidCross(p: p5) {
  p.noFill();
  p.stroke(255, 0, 0);
  p.strokeWeight(2);
  p.line(0, p.height / 2, p.width, p.height / 2);
  p.line(p.width / 2, 0, p.width / 2, p.height);
}

function isXorYAlley(iX: number, iY: number) {
  const isXAlley = iX % 2 === 0 && iX >= 1;
  const isYAlley = iY % 2 === 0 && iY >= 1;
  return isYAlley || isXAlley;
}

function isAlley(iN: number) {
  return iN % 2 === 0 && iN >= 1;
}

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

  if (e.key === 'g') {
    pane.hidden = !pane.hidden;
  }
});
