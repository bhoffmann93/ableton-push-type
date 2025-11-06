import p5 from 'p5';
import { GridModule, GridParams } from './grid.types';
import { GridCalculator } from './grid.calculator';
import { GridRenderer } from './grid.renderer';
import { setRandomDimensions } from './grid.utils';
import CubicBezier from '@thednp/bezier-easing';
import { GRID_CONFIG } from '../config/grid.config';

export class Grid {
  private modules: GridModule[][] = [];
  private calculator: GridCalculator;
  private renderer: GridRenderer;
  private randomColumnWidths: number[] = [];
  private randomRowHeights: number[] = [];
  private params: GridParams;

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
    this.randomColumnWidths = dims.columnWidths;
    this.randomRowHeights = dims.rowHeights;
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

  getTilesX(): number {
    return this.params.tilesX;
  }

  getTilesY(): number {
    return this.params.tilesY;
  }
}
