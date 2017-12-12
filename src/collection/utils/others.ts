import { Canvas } from "./Canvas"

let {random, sin, cos, tan, PI} = Math

interface ParticleLike {
  pos: {
    x: number
    y: number
  }
  dir: {
    vx: number
    vy: number
  }
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