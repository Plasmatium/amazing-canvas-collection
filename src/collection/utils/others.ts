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
  colorArray: string[]
}

export function makeLinearGradient(
  ctx: CanvasRenderingContext2D,
  {x0, y0, x1, y1, colorArray}: LinearGradient
) {
  let gradient = ctx.createLinearGradient(x0, y0, x1, y1)
  colorArray.forEach((color, idx) => {
    gradient.addColorStop(idx, color)
  })
  return gradient
}

export function rebound(
  {pos, dir}: ParticleLike,
  {windowH, windowW}: Canvas
) {
  if (pos.x < 0) {
    pos.x = 0
    dir.vx *= -1
  } else if (pos.x > windowW) {
    pos.x = windowW
    dir.vx *= -1
  }

  if (pos.y < 0) {
    pos.y = 0
    dir.vy *= -1
  } else if (pos.y > windowH) {
    pos.y = windowH
    dir.vy *= -1
  }
}

export function distortRoute(
  {pos, dir}: ParticleLike,
  {windowH, windowW}: Canvas
) {
  dir.vx += Math.sin(dir.vx/1000)/1000
  dir.vy += Math.cos(dir.vy/1000)/1000
  pos.x += dir.vx
  pos.y += dir.vy
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

export function gravityFall (
  {pos, dir}: ParticleLike,
  {windowW, windowH}: Canvas
) {
  
}