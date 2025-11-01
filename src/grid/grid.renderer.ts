import p5 from 'p5';
import { GridModule } from './grid.types';
import { ShapeRenderer } from './shape.renderer';

export class GridRenderer {
  private shapeRenderer: ShapeRenderer;

  constructor() {
    this.shapeRenderer = new ShapeRenderer();
  }

  draw(
    p: p5,
    modules: GridModule[][],
    scaleFactors: { x: number; y: number }[],
    scaleFactor: { x: number; y: number },
    tilesX: number,
    tilesY: number,
    primaryColor: string,
    secondaryColor: string,
    speed: number,
    debug: boolean
  ): void {
    p.background(primaryColor);
    p.fill(secondaryColor);
    p.noStroke();

    const tileWo = p.width / tilesX;
    const tileHo = p.height / tilesY;

    let tempPosY = 0;
    for (let iY = 1; iY < tilesY; iY++) {
      let tempPosX = 0;
      let tempHeight = 0;

      for (let iX = 1; iX < tilesX; iX++) {
        const { w, h, shapeIndex } = modules[iY - 1][iX - 1];
        const scaleFactorN = scaleFactors[iY - 1];
        const tileW = w * scaleFactorN.x;
        const tileH = h * scaleFactor.y;

        const pos = {
          x: tempPosX,
          y: tempPosY,
        };

        this.shapeRenderer.draw(p, pos, shapeIndex ?? 0, tileW, tileH, iX, iY);

        if (debug) {
          console.log('gaaasdas');
          this.shapeRenderer.drawDebugGrid(p, pos, tileW, tileH, iX, iY);
        }

        tempPosX += tileW;
        tempHeight = tileH;
      }
      tempPosY += tempHeight;
    }
  }
}
