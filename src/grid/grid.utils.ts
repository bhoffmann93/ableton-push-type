import { clamp } from '../utils/utils';

export function isAlley(index: number): boolean {
  return index % 2 === 0 && index >= 1;
}

export function isXorYAlley(iX: number, iY: number): boolean {
  const isXAlley = iX % 2 === 0 && iX >= 1;
  const isYAlley = iY % 2 === 0 && iY >= 1;
  return isYAlley || isXAlley;
}

export function setRandomDimensions(
  tilesX: number,
  tilesY: number
): {
  columnWidths: number[];
  rowHeights: number[];
  columnWidthsSum: number;
  rowHeightsSum: number;
} {
  const columnWidths: number[] = [];
  const rowHeights: number[] = [];
  let columnWidthsSum = 0;
  let rowHeightsSum = 0;

  for (let iX = 1; iX < tilesX; iX++) {
    if (iX % 2 === 0 && iX >= 1) {
      columnWidths[iX] = 0.1;
    } else {
      columnWidths[iX] = clamp(Math.random(), 0.25, 1);
      columnWidthsSum += columnWidths[iX];
    }
  }

  for (let iY = 1; iY < tilesY; iY++) {
    if (iY % 2 === 0 && iY >= 1) {
      rowHeights[iY] = 0.1;
    } else {
      rowHeights[iY] = clamp(Math.random(), 0.25, 1);
      rowHeightsSum += rowHeights[iY];
    }
  }

  return { columnWidths, rowHeights, columnWidthsSum, rowHeightsSum };
}
