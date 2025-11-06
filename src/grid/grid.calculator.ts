import p5 from 'p5';
import { GridModule, GRID_METHOD, GridParams } from './grid.types';
import { factory } from '../factory';
import { peakify, clamp } from '../utils/utils';
import { isAlley } from './grid.utils';

export class GridCalculator {
  private scaleFactor = { x: 1, y: 1 };
  private scaleFactors: { x: number; y: number }[] = [];

  calculate(p: p5, time: number, modules: GridModule[][], params: GridParams): void {
    const tileWo = p.width / params.tilesX;
    const tileHo = p.height / params.tilesY;
    let sumWidth = 0;
    let sumHeight = 0;

    for (let iY = 1; iY < params.tilesY; iY++) {
      const rowModules = [];

      const freqY = 0.3;
      const ampWaveY = 0.7;
      const waveY = ampWaveY * Math.sin(iY * freqY - p.millis() / 1000.0) * 0.5 + 0.5;

      for (let iX = 1; iX < params.tilesX; iX++) {
        const w = iX / params.tilesX;
        const h = iY / params.tilesY;
        let eased = { w: 0, h: 0 };
        const aspect = tileWo / tileHo;

        switch (params.method) {
          // case GRID_METHOD.Random:
          //   eased.w = isAlley(iX) ? params.alleyX : params.randomColumnWidths[iX];
          //   eased.h = isAlley(iY) ? params.alleyX * aspect : params.randomRowHeights[iY];
          //   break;
          case GRID_METHOD.StaticAlley:
            eased.w = isAlley(iX) ? params.alleyX : 1;
            eased.h = isAlley(iY) ? params.alleyX * aspect : 1;
            break;
          case GRID_METHOD.Uniform:
            eased.w = 1;
            eased.h = 1;
            break;
          case GRID_METHOD.Shaping:
            const easedOut = factory(w, h, time, params.easeType, params.mirrorInput);
            eased.w = isAlley(iX) ? params.alleyX : easedOut.w;
            eased.h = isAlley(iY) ? params.alleyY : easedOut.h;
            break;
          case GRID_METHOD.Bezier:
            //@ts-ignore
            eased.w = clamp(peakify(w, params.easeCubicBezierX), 0, 1);
            //@ts-ignore
            eased.h = clamp(peakify(h, params.easeCubicBezierY), 0, 1);
            break;
          case GRID_METHOD.Wave:
            const freqX = 5;
            const ampWaveX = 0.5;
            const offWaveX = 1 + time * 0.5;
            const waveX = 1;

            const wave0 = Math.sin(time - iY * Math.PI) * 0.5 + 0.5;

            if (iX % 3 === 0) {
              // Optional wave variations
            }

            if (iX > 4 && iX < 11 && iY > 4 && iY < 11) {
              // Optional fixed region
            }

            eased = {
              w: waveX,
              h: waveY,
            };
            break;
        }

        const tileWeased = tileWo * eased.w;
        const tileHeased = tileHo * eased.h;

        rowModules.push({
          w: tileWeased,
          h: tileHeased,
        });

        sumWidth += tileWeased;
        if (iX === 1) sumHeight += tileHeased;
      }

      if (iY === 1) this.scaleFactor.x = p.width / sumWidth;

      this.scaleFactors[iY - 1] = { x: p.width / sumWidth, y: 1 };
      sumWidth = 0;

      rowModules.forEach((module, iX) => {
        modules[iY - 1][iX].w = module.w;
        modules[iY - 1][iX].h = module.h;
      });
    }

    this.scaleFactor.y = p.height / sumHeight;
  }

  getScaleFactor(): { x: number; y: number } {
    return this.scaleFactor;
  }

  getScaleFactors(): { x: number; y: number }[] {
    return this.scaleFactors;
  }
}
