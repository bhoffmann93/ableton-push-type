// @ts-nocheck
import p5 from 'p5';
import './style.css';
import { peakify, clamp, map, getDateAndTimeString } from './utils/utils';
import { HSLAToRGBA } from './utils/color.utils';
import { factory } from './factory';
import { EASE_TYPE, METHOD, GridModule, EASE_MIRROR_TYPE } from './types/types';
import { easing } from 'ts-easing';
import CubicBezier from '@thednp/bezier-easing';
import { PushController, PushLEDColor } from './midi';
import { GRID_CONFIG } from './config/grid.config';

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
const easeCubicBezierX = new CubicBezier(...bezierValues);
const easeCubicBezierY = new CubicBezier(...bezierValues);

const primaryColor = GRID_CONFIG.swapColors ? GRID_CONFIG.colorPair[0] : GRID_CONFIG.colorPair[1];
const secondaryColor = GRID_CONFIG.swapColors ? GRID_CONFIG.colorPair[1] : GRID_CONFIG.colorPair[0];

const scaleFactor = { x: 1, y: 1 };
const scaleFactors: { x: number; y: number }[] = [];
const randomColumnWidths: number[] = [];
const randomRowHeights: number[] = [];
let randomColumnWidthsSum = 0;
let randomRowHeightsSum = 0;

const modules: GridModule[][] = [];
const INITIAL_SHAPE_INDEX = 0;
const AMOUNT_OF_SHAPES = 15;
let shouldSetButtonsToInitialShapeindex = false;

for (let iY = 0; iY < GRID_CONFIG.tilesY; iY++) {
  const rowModules = [];
  for (let iX = 0; iX < GRID_CONFIG.tilesX; iX++) {
    rowModules.push({
      w: 0,
      h: 0,
      shapeIndex: INITIAL_SHAPE_INDEX,
    });
  }
  modules.push(rowModules);
}

GRID_CONFIG.tilesX += 1;
GRID_CONFIG.tilesY += 1;
// GRID_CONFIG.tilesX = GRID_CONFIG.tilesX % 2 === 0 ? GRID_CONFIG.tilesX : GRID_CONFIG.tilesX + 1;
// GRID_CONFIG.tilesY = GRID_CONFIG.tilesY % 2 === 0 ? GRID_CONFIG.tilesY : GRID_CONFIG.tilesY + 1;
setRandomRowColDimensions();

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
      modules.forEach((row) => {
        row.forEach((module) => {
          module.shapeIndex = INITIAL_SHAPE_INDEX;
        });
      });
    },
    onButtonPress: (row, col) => {
      if (!modules) return;

      // Cycle through shapes
      if (shouldSetButtonsToInitialShapeindex) {
        modules[row][col].shapeIndex = INITIAL_SHAPE_INDEX;
      } else {
        modules[row][col].shapeIndex = (modules[row][col].shapeIndex + 1) % AMOUNT_OF_SHAPES;
      }

      // Update LED
      const buttonId = 36 + (7 - row) * 8 + col;
      if (modules[row][col].shapeIndex !== INITIAL_SHAPE_INDEX) {
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

  for (let iX = 1; iX < GRID_CONFIG.tilesX; iX++) {
    if (iX % 2 === 0 && iX >= 1) {
      randomColumnWidths[iX] = 0.1;

      //TODO alley calculation maybe needs to happen here width the aspect ratio?
    } else {
      randomColumnWidths[iX] = clamp(Math.random(), 0.25, 1);
      randomColumnWidthsSum += randomColumnWidths[iX];
    }
  }
  for (let iY = 1; iY < GRID_CONFIG.tilesY; iY++) {
    if (iY % 2 === 0 && iY >= 1) {
      randomRowHeights[iY] = 0.1;
    } else {
      randomRowHeights[iY] = clamp(Math.random(), 0.25, 1);
      randomRowHeightsSum += randomRowHeights[iY];
    }
  }
}

function calcGrid(p: p5, time: number) {
  const tileWo = p.width / GRID_CONFIG.tilesX;
  const tileHo = p.height / GRID_CONFIG.tilesY;
  let sumWidth = 0;
  let sumHeight = 0;

  for (let iY = 1; iY < GRID_CONFIG.tilesY; iY++) {
    const rowModules = [];

    const freqY = 0.3;
    const ampWaveY = 0.7; //0-1
    const waveY = ampWaveY * Math.sin(iY * freqY + p.frameCount * 0.01) * 0.5 + 0.5;

    for (let iX = 1; iX < GRID_CONFIG.tilesX; iX++) {
      const w = iX / GRID_CONFIG.tilesX;
      const h = iY / GRID_CONFIG.tilesY;
      let eased = { w: 0, h: 0 };
      const aspect = tileWo / tileHo;

      switch (gridMethod) {
        case METHOD.RANDOM:
          eased.w = isAlley(iX) ? GRID_CONFIG.alleyX : randomColumnWidths[iX];
          eased.h = isAlley(iY) ? GRID_CONFIG.alleyX * aspect : randomRowHeights[iY];
          break;
        case METHOD.STATIC_ALLEY:
          eased.w = isAlley(iX) ? GRID_CONFIG.alleyX : 1;
          eased.h = isAlley(iY) ? GRID_CONFIG.alleyX * aspect : 1;
          break;
        case METHOD.EQUAL:
          eased.w = 1;
          eased.h = 1;
          break;
        case METHOD.SHAPING_FUNCTION:
          const easedOut = factory(w, h, time, easeType, mirrorInput);
          eased.w = isAlley(iX) ? GRID_CONFIG.alleyX : easedOut.w;
          eased.h = isAlley(iY) ? GRID_CONFIG.alleyY : easedOut.h;
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
            // waveX = GRID_CONFIG.alleyX;
          }
          if (isAlley(iY)) {
            // waveY = GRID_CONFIG.alleyY;
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
  p.background(primaryColor);
  p.fill(secondaryColor);
  p.noStroke();

  const tileWo = p.width / GRID_CONFIG.tilesX;
  const tileHo = p.height / GRID_CONFIG.tilesY;

  let tempPosY = 0;
  for (let iY = 1; iY < GRID_CONFIG.tilesY; iY++) {
    let tempPosX = 0;
    let tempHeight = 0;

    for (let iX = 1; iX < GRID_CONFIG.tilesX; iX++) {
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
});
