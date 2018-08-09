import { Canvas } from './utils/Canvas';
import { ParticleLike, rebound, distortRoute, randPos, showFPS, move } from './utils/others';

const random = () => Math.random();

class Dot {
  // pos: ParticleLike['pos']
  // r: number
  // color: number[]
  public dir: ParticleLike['dir']
  // cv: Canvas
  constructor(
    public pos: ParticleLike['pos'],
    public r: number,
    public color: number[],
    private cv: Canvas,
  ) {
    this.dir = { vx: random()*2 - 1, vy: random()*2 - 1 };
    // this.color = [Math.floor(128*random() + 100),Math.floor(128*random() + 100),Math.floor(128*random() + 100), random()*0.3 + 0.5]
  }
  mutate() {
    // distortRoute(this, this.cv)
    move(this);
    const { windowW, windowH } = this.cv;
    rebound(this, {
      top: 0, bottom: windowH, left: 0, right: windowW,
    });
  }
  draw({ ctx, canvas } = this.cv) {
    const { pos: { x, y }, r } = this;
    ctx.fillStyle = `rgba(${this.color})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2*Math.PI);
    ctx.closePath();
    ctx.fill();
  }
}

class NeedleDotCanvas extends Canvas {
  bgColor: string = ''
  data: Dot[] = []
  constructor(bgColor: string | CanvasGradient = '#eaeaea') {
    super(bgColor);
    this.createDots();
  }
  // clrscr ({bgColor, canvas, ctx, windowH, windowW, data}: Canvas) {
  //   ctx.fillStyle = `rgba(255, 255, 255, 0.25)`
  //   ctx.fillRect(0, 0, windowW, windowH)
  // }
  createDots() {
    const count = Math.floor(150*this.windowH*this.windowW/(1920*1080));
    const data: Dot[] = this.data = new Array<Dot>(count);
    for (let i = 0; i < count; i++) {
      const pos = randPos(this);
      data[i] = new Dot(pos, 1.62, [0xac, 0xbd, 0xce, 0.62], this);
    }
  }
  renderMain({
    canvas, ctx, windowH, windowW, data,
  }: Canvas) {
    const dThreshold = Math.sqrt(0.618*windowW*windowH/Math.PI)*22;

    ctx.lineWidth = 0.3;
    this.data.forEach((dot, idx) => {
      // lines
      this.data.slice(idx+1).forEach((anotherDot) => {
        const dsqr = ((dot.pos.x-anotherDot.pos.x)**2 + (dot.pos.y-anotherDot.pos.y)**2);
        const a = (1 - dsqr/dThreshold);
        if (a < 0) return;
        ctx.beginPath();
        ctx.moveTo(dot.pos.x, dot.pos.y);
        ctx.lineTo(anotherDot.pos.x, anotherDot.pos.y);
        ctx.closePath();
        ctx.strokeStyle = `rgba(50, 128, 255, ${a})`;
        ctx.stroke();
      });
      dot.draw();
      dot.mutate();
    });
  }
}

export function needleDot() {
  const cv = new NeedleDotCanvas();

  window.onresize = (e) => {
    const target = e.target as (typeof window);
    cv.canvas.height = target.innerHeight;
    cv.canvas.width = target.innerWidth;
  };

  return cv;
}
