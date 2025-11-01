import p5 from 'p5';
import { GridModule } from './grid.types';
import { GridCalculator, GridCalculationParams } from './grid.calculator';
import { GridRenderer } from './grid.renderer';
import { setRandomDimensions } from './grid.utils';

export class Grid {
  private modules: GridModule[][] = [];
  private calculator: GridCalculator;
  private renderer: GridRenderer;
  private randomColumnWidths: number[] = [];
  private randomRowHeights: number[] = [];

  readonly INITIAL_SHAPE_INDEX = 0;
  readonly AMOUNT_OF_SHAPES = 15;

  constructor(private tilesX: number, private tilesY: number) {
    this.calculator = new GridCalculator();
    this.renderer = new GridRenderer();
    this.initialize();
  }

  private initialize(): void {
    // Initialize modules
    for (let iY = 0; iY < this.tilesY; iY++) {
      const rowModules = [];
      for (let iX = 0; iX < this.tilesX; iX++) {
        rowModules.push({
          w: 0,
          h: 0,
          shapeIndex: this.INITIAL_SHAPE_INDEX,
        });
      }
      this.modules.push(rowModules);
    }

    this.tilesX += 1;
    this.tilesY += 1;

    // Setup random dimensions
    this.updateRandomDimensions();
  }

  updateRandomDimensions(): void {
    const dims = setRandomDimensions(this.tilesX, this.tilesY);
    this.randomColumnWidths = dims.columnWidths;
    this.randomRowHeights = dims.rowHeights;
  }

  calculate(p: p5, time: number, params: Omit<GridCalculationParams, 'randomColumnWidths' | 'randomRowHeights'>): void {
    this.calculator.calculate(p, time, this.modules, {
      ...params,
      randomColumnWidths: this.randomColumnWidths,
      randomRowHeights: this.randomRowHeights,
    });
  }

  draw(p: p5, primaryColor: string, secondaryColor: string, speed: number, debug: boolean): void {
    this.renderer.draw(
      p,
      this.modules,
      this.calculator.getScaleFactors(),
      this.calculator.getScaleFactor(),
      this.tilesX,
      this.tilesY,
      primaryColor,
      secondaryColor,
      speed,
      debug
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
    return this.tilesX;
  }

  getTilesY(): number {
    return this.tilesY;
  }
}
