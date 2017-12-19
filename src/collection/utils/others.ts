import { Canvas } from "./Canvas"

let {floor, random, sin, cos, tan, PI} = Math

export interface ParticleLike {
  pos: {
    x: number
    y: number
  }
  dir: {
    vx: number
    vy: number
  }
}

export interface Boundary {
  top: number
  bottom: number
  left: number
  right: number
}

export interface LinearGradient {
  x0: number
  y0: number
  x1: number
  y1: number
  colorInfoArr: {
    offset: number
    color: string
  }[]
}

// Standard Normal variate using Box-Muller transform.
// ref: https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
export function randn_bm() {
  var u = 0, v = 0;
  //Converting [0,1) to (0,1)
  while(u === 0) u = Math.random()
  while(v === 0) v = Math.random()
  return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
}

export function makeLinearGradient(
  ctx: CanvasRenderingContext2D,
  {x0, y0, x1, y1, colorInfoArr}: LinearGradient
) {
  let gradient = ctx.createLinearGradient(x0, y0, x1, y1)
  colorInfoArr.forEach((colorInfo, idx) => {
    let {offset, color} = colorInfo
    gradient.addColorStop(offset, color)
  })
  return gradient
}

export function rebound(
  {pos, dir}: ParticleLike,
  {top, bottom, left, right}: Boundary,
  decay = {dcx: 1, dcy: 1}
) {
  if (pos.x < left) {
    pos.x = left
    dir.vx *= -decay.dcx
  } else if (pos.x > right) {
    pos.x = right
    dir.vx *= -decay.dcx
  }

  if (pos.y < top) {
    pos.y = top
    dir.vy *= -decay.dcy
  } else if (pos.y > bottom) {
    pos.y = bottom
    dir.vy *= -decay.dcy
  }
}

export function distortRoute(
  {pos, dir}: ParticleLike,
  {windowH, windowW}: Canvas
) {
  let randx = Infinity
  let randy = Infinity
  // make random in (-10, 10)
  while(Math.abs(randx) > 10) randx = randn_bm()
  while(Math.abs(randy) > 10) randy = randn_bm()
  dir.vx += randx * 0.01
  dir.vy += randy * 0.01
}

export function randPos ({windowH, windowW}: {
  windowH: number
  windowW: number
}) {
  let x = random() * windowW
  let y = random() * windowH
  return {x, y}
}

export function randColor () {
  return [0xff, 0xff, 0xff, 0xff].map(v => floor(random()*v))
}

export function showFPS () {
  let prevTime = new Date().getTime()
  let count = 0
  let fps = '0'
  function renderFPS (ctx: CanvasRenderingContext2D) {
    count++
    ctx.fillStyle = 'green'
    ctx.font = '24px Sans'
    if (count !== 100) {
      ctx.fillText(`FPS: ${fps}`, 10, 50)
      return
    }
    count = 0
    // 100 frames rendered
    let currTime = new Date().getTime()
    let diffTime = (currTime-prevTime) / 1000
    prevTime = currTime
    fps = (100 / diffTime).toFixed(1)
    ctx.fillText(`FPS: ${fps}`, 10, 50)
  }

  return renderFPS
}

export function applyGravity (
  {pos, dir}: ParticleLike,
  {windowW, windowH}: Canvas,
  g = 1
) {
  dir.vy += g
}

function calcDamping (v: number ) {
  if (Math.abs(v) > 100) return 1
  if (Math.abs(v) < 0.5) return 0
  return 0.01*v
}
export function move (
  {pos, dir}: ParticleLike,
  damping = false
) {
  pos.x += dir.vx
  pos.y += dir.vy

  if (!damping) return
  // dir.vx *= damping.dpx
  // dir.vy *= damping.dpy
  dir.vx -= calcDamping(dir.vx)
  dir.vy -= calcDamping(dir.vy)
}

export function applyFriction(dir: ParticleLike['dir'], a: number) {
  let signx = Math.sign(dir.vx)
  dir.vx = Math.abs(dir.vx) - a < 0 ? 0 : dir.vx - signx * a

  let signy = Math.sign(dir.vy)
  dir.vy = Math.abs(dir.vy) - a < 0 ? 0 : dir.vy - signx * a
}

export function earthFricion(
  {pos, dir}: ParticleLike,
  m: number, // m for mass
  horizon: number,
  k = 0.1
) {
  if (pos.y < horizon) return
  let a = m * k
  applyFriction(dir, a)
}