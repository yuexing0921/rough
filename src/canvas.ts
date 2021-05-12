import { Config, Options, ResolvedOptions, Drawable, OpSet } from './core';
import { RoughGenerator } from './generator';
import { Point } from './geometry';

export class RoughCanvas {
  private gen: RoughGenerator;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, config?: Config) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d')!;
    this.gen = new RoughGenerator(config);
  }

  draw(drawable: Drawable) {
    const sets = drawable.sets || [];
    const o = drawable.options || this.getDefaultOptions();
    const ctx = this.ctx;
    for (const drawing of sets) {
      switch (drawing.type) {
        case 'path':
          ctx.save();
          ctx.strokeStyle = o.stroke === 'none' ? 'transparent' : o.stroke;
          ctx.lineWidth = o.strokeWidth;
          if (o.strokeLineDash) {
            ctx.setLineDash(o.strokeLineDash);
          }
          if (o.strokeLineDashOffset) {
            ctx.lineDashOffset = o.strokeLineDashOffset;
          }
          this._drawToContext(ctx, drawing);
          ctx.restore();
          break;
        case 'fillPath':
          ctx.save();
          ctx.fillStyle = o.fill || '';
          const fillRule: CanvasFillRule = (drawable.shape === 'curve' || drawable.shape === 'polygon') ? 'evenodd' : 'nonzero';
          this._drawToContext(ctx, drawing, fillRule);
          ctx.restore();
          break;
        case 'fillSketch':
          this.fillSketch(ctx, drawing, o);
          break;
      }
    }
  }

  private fillSketch(ctx: CanvasRenderingContext2D, drawing: OpSet, o: ResolvedOptions) {
    let fweight = o.fillWeight;
    if (fweight < 0) {
      fweight = o.strokeWidth / 2;
    }
    ctx.save();
    if (o.fillLineDash) {
      ctx.setLineDash(o.fillLineDash);
    }
    if (o.fillLineDashOffset) {
      ctx.lineDashOffset = o.fillLineDashOffset;
    }
    ctx.strokeStyle = o.fill || '';
    ctx.lineWidth = fweight;
    this._drawToContext(ctx, drawing);
    ctx.restore();
  }

  private _drawToContext(ctx: CanvasRenderingContext2D, drawing: OpSet, rule: CanvasFillRule = 'nonzero') {
    ctx.beginPath();
    for (const item of drawing.ops) {
      const data = item.data;
      switch (item.op) {
        case 'move':
          ctx.moveTo(data[0], data[1]);
          break;
        case 'bcurveTo':
          ctx.bezierCurveTo(data[0], data[1], data[2], data[3], data[4], data[5]);
          break;
        case 'lineTo':
          ctx.lineTo(data[0], data[1]);
          break;
      }
    }
    if (drawing.type === 'fillPath') {
      ctx.fill(rule);
    } else {
      ctx.stroke();
    }
  }

  get generator(): RoughGenerator {
    return this.gen;
  }

  getDefaultOptions(): ResolvedOptions {
    return this.gen.defaultOptions;
  }

  line(x1: number, y1: number, x2: number, y2: number, options?: Options): Drawable {
    const d = this.gen.line(x1, y1, x2, y2, options);
    this.draw(d);
    return d;
  }

  // 矩形
  rectangle(x: number, y: number, width: number, height: number, options?: Options): Drawable {
    const d = this.gen.rectangle(x, y, width, height, options);
    this.draw(d);
    return d;
  }

  // 椭圆
  ellipse(x: number, y: number, width: number, height: number, options?: Options): Drawable {
    const d = this.gen.ellipse(x, y, width, height, options);
    this.draw(d);
    return d;
  }

  // 圆
  circle(x: number, y: number, diameter: number, options?: Options): Drawable {
    const d = this.gen.circle(x, y, diameter, options);
    this.draw(d);
    return d;
  }

  // 直线
  linearPath(points: Point[], options?: Options): Drawable {
    const d = this.gen.linearPath(points, options);
    this.draw(d);
    return d;
  }

  // 多角形物体
  polygon(points: Point[], options?: Options): Drawable {
    const d = this.gen.polygon(points, options);
    this.draw(d);
    return d;
  }

  // 弧
  arc(x: number, y: number, width: number, height: number, start: number, stop: number, closed: boolean = false, options?: Options): Drawable {
    const d = this.gen.arc(x, y, width, height, start, stop, closed, options);
    this.draw(d);
    return d;
  }

  // 曲线
  curve(points: Point[], options?: Options): Drawable {
    const d = this.gen.curve(points, options);
    this.draw(d);
    return d;
  }

  // 路径
  path(d: string, options?: Options): Drawable {
    const drawing = this.gen.path(d, options);
    this.draw(drawing);
    return drawing;
  }
}