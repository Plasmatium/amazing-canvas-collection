import { Canvas } from './utils/Canvas';
import {
  ParticleLike,
  randColor,
  RefinedImageData,
  makeLinearGradient,
  slide,
} from './utils/others';


class Dot {
  public free: boolean = false
  constructor(
    public pos: ParticleLike['pos'],
    // public dir: ParticleLike['dir'],
    public destPos: ParticleLike['pos'],
    public color: number[],
    public cv: Canvas,
  ) { }
  draw({ ctx } = this.cv) {
    const { x, y } = this.pos;
    ctx.fillStyle = `rgba(${this.color})`;
    ctx.fillRect(x, y, 3, 3);
  }
  move() {
    if (!this.free) return;
    const { pos, destPos } = this;
    slide(pos, destPos, 0.05);
  }
}

class TextParticle extends Canvas {
  public dots: Dot[] = []
  constructor(public bgColor: string | CanvasGradient = '#feefed') {
    super(bgColor);
  }
  renderMain({
    canvas, ctx, windowH, windowW, data,
  }: Canvas = this) {
    this.dots && this.dots.forEach((dot) => {
      dot.draw();
      dot.move();
    });
  }
  onClick(e: MouseEvent) {
    this.dots.forEach((dot) => {
      setTimeout(() => dot.free = !dot.free, 60000*Math.random());
    });
  }
}

export function textParticle() {
  const cv = new TextParticle();
  const { ctx } = cv;
  const offset = 0;
  const colorInfoArr = [
    { offset: 1/6, color: '#f00' },
    { offset: 2/6, color: '#ff0' },
    { offset: 3/6, color: '#0f0' },
    { offset: 4/6, color: '#0ff' },
    { offset: 5/6, color: '#00f' },
    { offset: 6/6, color: '#f0f' },
  ];
  const gradientOption = {
    x0: 250 + offset,
    y0: 150,
    x1: 280 + offset,
    y1: 200,
    colorInfoArr,
  };
  const textColor = makeLinearGradient(cv.ctx, gradientOption);
  // draw first frame and get its data, @pos(20000, 150)
  // ctx.fillStyle = '#eacdae'
  // ctx.fillRect(200+offset, 150, 200, 50)
  ctx.fillStyle = textColor;
  // ctx.fillStyle = '#777'
  ctx.font = '60px helvetica,sans';
  ctx.fillText('彩虹', 200 + offset, 200);

  const hitChance = 0.3;
  const filter = (color: number[]) => {
    const str = color.reduce((s, c) => s+c.toString(16), '#');
    return str !== cv.bgColor && Math.random() < hitChance;
  };
  const refinedData = new RefinedImageData(ctx.getImageData(200 + offset, 150, 200, 60));
  // hide this pre-render text
  cv.clrscr();
  refinedData.refine(filter);
  for (let i = 0; i < refinedData.data.length; i += 2) {
    const d = refinedData.data;
    const [x, y] = [d[i], d[i+1]];
    const color = refinedData.getColor({ x, y });
    const dot = new Dot({
      x: Math.random()* 50 + cv.windowW / 2,
      y: -Math.random()* 20 + cv.windowH,
    }, { x: x*2 + 150, y: y*2 + 150 }, color, cv);
    cv.dots.push(dot);
  }

  window.onresize = (e) => {
    const target = e.target as (typeof window);
    cv.canvas.height = target.innerHeight;
    cv.canvas.width = target.innerWidth;
  };

  return cv;
}
