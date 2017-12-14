import { Canvas } from "./Canvas"

let {random, sin, cos, tan, PI} = Math

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
function randn_bm() {
  var u = 0, v = 0;
  while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
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
  {windowH, windowW}: Canvas,
  decay = {dcx: 1, dcy: 1}
) {
  if (pos.x < 0) {
    pos.x = 0
    dir.vx *= -decay.dcx
  } else if (pos.x > windowW) {
    pos.x = windowW
    dir.vx *= -decay.dcx
  }

  if (pos.y < 0) {
    pos.y = 0
    dir.vy *= -decay.dcy
  } else if (pos.y > windowH) {
    pos.y = windowH
    dir.vy *= -decay.dcy
  }
}

let distortStep = 0
export function distortRoute(
  {pos, dir}: ParticleLike,
  {windowH, windowW}: Canvas
) {
  dir.vx *= Math.sin(distortStep)*0.03 + 1
  dir.vy *= Math.cos(distortStep)*0.03 + 1
  distortStep += 0.01
}

export function randPos ({windowH, windowW}: {
  windowH: number
  windowW: number
}) {
  let x = random() * windowW
  let y = random() * windowH
  return {x, y}
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
  g = 5
) {
  dir.vy += g
}

export function move (
  {pos, dir}: ParticleLike,
  damping = {dpx: 0.96, dpy: 0.96}
) {
  pos.x += dir.vx
  pos.y += dir.vy

  dir.vx *= damping.dpx
  dir.vy *= damping.dpy
}