import p5 from 'p5';
import { GridModule, GridParams, GRID_METHOD } from './grid.types';
import { GridCalculator } from './grid.calculator';
import { GridRenderer } from './grid.renderer';
import { setRandomDimensions } from './grid.utils';
import CubicBezier from '@thednp/bezier-easing';
import { GRID_CONFIG } from '../config/grid.config';
import { EASE_TYPE } from '../types/types';
import { COLOR_PAIRS } from '../constants/color.constants';
import { HexPair } from '../types/color.types';

export class Grid {
  private modules: GridModule[][] = [];
  private calculator: GridCalculator;
  private renderer: GridRenderer;
  private params: GridParams;
  private colorPairIndex = 0;
  private swapColors = false;

  readonly INITIAL_SHAPE_INDEX = 0;
  readonly AMOUNT_OF_SHAPES = 15;
  readonly easeCubicBezierX = new CubicBezier(0.5, 0, 0.5, 1);
  readonly easeCubicBezierY = new CubicBezier(0.5, 0, 0.5, 1);

  constructor(config: typeof GRID_CONFIG) {
    this.params = {
      tilesX: config.tilesX,
      tilesY: config.tilesY,
      alleyX: config.alleyX,
      alleyY: config.alleyY,
      method: config.method,
      easeType: config.easeType,
      mirrorInput: config.mirrorInput,
      easeCubicBezierX: this.easeCubicBezierX,
      easeCubicBezierY: this.easeCubicBezierY,
      randomColumnWidths: [],
      randomRowHeights: [],
      // colorPair: config.swapColors ? ([config.colorPair[1], config.colorPair[0]] as HexPair) : config.colorPair,
      primaryColor: config.swapColors ? config.colorPair[1] : config.colorPair[0],
      secondaryColor: config.swapColors ? config.colorPair[0] : config.colorPair[1],
      debug: config.debug,
    };

    this.calculator = new GridCalculator();
    this.renderer = new GridRenderer();
    this.initialize();
  }

  private initialize(): void {
    // Initialize modules
    for (let iY = 0; iY < this.params.tilesY; iY++) {
      const rowModules = [];
      for (let iX = 0; iX < this.params.tilesX; iX++) {
        rowModules.push({
          w: 0,
          h: 0,
          shapeIndex: this.INITIAL_SHAPE_INDEX,
        });
      }
      this.modules.push(rowModules);
    }

    this.params.tilesX += 1;
    this.params.tilesY += 1;

    // Setup random dimensions
    this.updateRandomDimensions();
  }

  updateRandomDimensions(): void {
    const dims = setRandomDimensions(this.params.tilesX, this.params.tilesY);
    this.params.randomColumnWidths = dims.columnWidths;
    this.params.randomRowHeights = dims.rowHeights;
  }

  calculate(p: p5, time: number): void {
    this.calculator.calculate(p, time, this.modules, this.params);
  }

  draw(p: p5): void {
    this.renderer.draw(
      p,
      this.modules,
      this.calculator.getScaleFactors(),
      this.calculator.getScaleFactor(),
      this.params
    );
  }

  getModule(row: number, col: number): GridModule | undefined {
    return this.modules[row]?.[col];
  }

  getModulesCoordsByShapeindex(shapeIndex: number) {
    const coords: { r: number; c: number }[] = [];
    for (let r = 0; r < this.modules.length; r++) {
      for (let c = 0; c < this.modules[r].length; c++) {
        if (this.modules[r][c].shapeIndex === shapeIndex) coords.push({ r, c });
      }
    }
    return coords;
  }

  getModulesCoordsExcludingShapeIndex(shapeIndex: number) {
    const coords: { r: number; c: number }[] = [];
    for (let r = 0; r < this.modules.length; r++) {
      for (let c = 0; c < this.modules[r].length; c++) {
        if (this.modules[r][c].shapeIndex !== shapeIndex) coords.push({ r, c });
      }
    }
    return coords;
  }

  setModuleShapeIndex(row: number, col: number, shapeIndex: number): void {
    if (this.modules[row]?.[col]) {
      this.modules[row][col].shapeIndex = shapeIndex;
    }
  }

  resetAllShapes(): void {
    this.modules.forEach((row) => {
      row.forEach((module) => {
        module.shapeIndex = this.INITIAL_SHAPE_INDEX;
      });
    });
  }

  cycleShapeIndex(row: number, col: number): void {
    if (this.modules[row]?.[col]) {
      const current = this.modules[row][col].shapeIndex || 0;
      this.modules[row][col].shapeIndex = (current + 1) % this.AMOUNT_OF_SHAPES;
    }
  }

  cycleMethod(): void {
    const methods = Object.values(GRID_METHOD).filter((method) => typeof method === 'number');
    const currentIndex = methods.indexOf(this.params.method);
    const nextIndex = (currentIndex + 1) % methods.length;
    this.params.method = methods[nextIndex];
  }

  cycleShapingFunction(): void {
    const easeTypes = Object.values(EASE_TYPE).filter((ease) => typeof ease === 'number');
    const currentIndex = easeTypes.indexOf(this.params.easeType);
    const nextIndex = (currentIndex + 1) % easeTypes.length;
    this.params.easeType = easeTypes[nextIndex];
  }

  cycleColorPair(): void {
    const colorPairs = Object.values(COLOR_PAIRS);
    this.colorPairIndex = (this.colorPairIndex + 1) % colorPairs.length;
    this.updateColors();
  }

  setColorPair(index: number): void {
    this.colorPairIndex = Math.round(index);
    this.updateColors();
  }

  toggleSwapColors(): void {
    this.swapColors = !this.swapColors;
    this.updateColors();
  }

  setAlleyX(value: number): void {
    this.params.alleyX = value;
  }

  setAlleyY(value: number): void {
    this.params.alleyY = value;
  }

  private updateColors(): void {
    const colorPairs = Object.values(COLOR_PAIRS);
    const pair = colorPairs[this.colorPairIndex];

    if (this.swapColors) {
      this.params.primaryColor = pair[1];
      this.params.secondaryColor = pair[0];
    } else {
      this.params.primaryColor = pair[0];
      this.params.secondaryColor = pair[1];
    }
  }

  toggleDebug(): void {
    this.params.debug = !this.params.debug;
  }

  getMethod(): GRID_METHOD {
    return this.params.method;
  }

  getEaseType(): EASE_TYPE {
    return this.params.easeType;
  }

  getColorPair(): HexPair {
    return [this.params.primaryColor, this.params.secondaryColor];
  }

  getTilesX(): number {
    return this.params.tilesX;
  }

  getTilesY(): number {
    return this.params.tilesY;
  }
}
