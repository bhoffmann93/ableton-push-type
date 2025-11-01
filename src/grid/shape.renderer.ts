import p5 from 'p5';
import { isXorYAlley } from './grid.utils';

export class ShapeRenderer {
  draw(
    p: p5,
    pos: { x: number; y: number },
    shapeIndex: number,
    tileW: number,
    tileH: number,
    iX: number,
    iY: number
  ): void {
    p.push();
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
        if (isXorYAlley(iX, iY)) {
          // Optional: change fill for alleys
        }
        p.ellipseMode(p.CORNERS);
        p.ellipse(0, 0, tileW, tileH);
        break;
    }

    p.pop();
  }

  drawDebugGrid(p: p5, pos: { x: number; y: number }, tileW: number, tileH: number, iX: number, iY: number): void {
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
    p.text(iX + ' ' + iY, tileW * 0.5, tileH * 0.5);
    p.pop();
  }

  drawMidCross(p: p5): void {
    p.noFill();
    p.stroke(255, 0, 0);
    p.strokeWeight(2);
    p.line(0, p.height / 2, p.width, p.height / 2);
    p.line(p.width / 2, 0, p.width / 2, p.height);
  }
}
