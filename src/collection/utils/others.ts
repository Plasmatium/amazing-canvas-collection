import { Canvas } from "./Canvas"
import { Subject } from 'rxjs/Subject'
import { Observer } from 'rxjs/observer'

import 'rxjs/add/operator/pairwise'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/bufferCount'
import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/timeout'


let {floor, random, sin, cos, tan, PI} = Math

// ------utils--------
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

export type colorArray = [number, number, number, number]

export interface TransferParam {
  size: number
  type: number
  normalize: boolean
  stride: number
  offset: number
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

export function randPos ({windowH, windowW}: {
  windowH: number
  windowW: number
}) {
  let x = random() * windowW
  let y = random() * windowH
  return {x, y}
}

export function randColor () {
  return [0xff, 0xff, 0xff, 1].map(v => {
    let ret = random()*v
    return ret <= 1 ? ret : floor(ret)
  })
}
export function makeRandomColorful () {
  // controls the color in range [0.382, 0.618]
  let rand = randn_bm() * 10
  return (step: number) => {
    let r = Math.floor(0xff*((sin(rand+step+0*PI/3)+1)*0.5))
    let g = Math.floor(0xff*((sin(rand+step+2*PI/3)+1)*0.5))
    let b = Math.floor(0xff*((sin(rand+step-2*PI/3)+1)*0.5))
    let a = 0.382
    return [r, g, b, a]
  }
}

export function showFPS (ctx: CanvasRenderingContext2D) {
  let prevTime = new Date().getTime()
  let count = 0
  let fps = '0'
  function renderFPS () {
    count++
    ctx.fillStyle = 'green'
    ctx.font = '12px helvetica, sans'
    if (count !== 100) {
      ctx.fillText(`FPS: ${fps}`, 10, 20)
      return
    }
    count = 0
    // 100 frames rendered
    let currTime = new Date().getTime()
    let diffTime = (currTime-prevTime) / 1000
    prevTime = currTime
    fps = (100 / diffTime).toFixed(1)
    ctx.fillText(`FPS: ${fps}`, 10, 20)
  }
  return renderFPS
}

export function showFPS2 () {
  let fpsMask = document.getElementById('fps-present') as HTMLCanvasElement | null
  if (!fpsMask) {
    fpsMask = document.createElement('canvas')
    fpsMask.setAttribute('width', '80')
    fpsMask.setAttribute('height', '30')
    fpsMask.id = 'fps-present'
    fpsMask.style.position = 'fixed'
    fpsMask.style.top = '0'
    document.body.appendChild(fpsMask)
  }

  let ctx = fpsMask.getContext('2d') as CanvasRenderingContext2D
  if (!ctx) throw Error('fps present mask canvas not found')

  let emitter = new Subject<number>()
  let fpsSubscription = emitter
  .timeout(5000) // close emitter and do clean staff if no data in 5sec
  .pairwise()
  .map(([prev, curr]) => curr - prev)
  .bufferCount(100, 1)
  .scan((presentFPS, fpsArr, idx) => {
    if (idx%33 === 0) {
      let timeCost = fpsArr.reduce((sum, d) => sum+d, 0)
      let fps = (100*1000/timeCost).toFixed(1)
      presentFPS = fps
    }
    return presentFPS
  }, '0')
  .subscribe({
    next: fps => {
      ctx.clearRect(0, 0, 80, 30)
      ctx.fillStyle = '#444'
      ctx.font = '16px helvetica, sans'
      ctx.fillText(`FPS: ${fps}`, 10, 20)
    },
    error: err => {
      // fpsSubscription was auto unscubscribed when timeout trigger error
      emitter.unsubscribe()
    }
  })

  emitter.next(+new Date())
  function fpsEmitter (timestemp: number) {
    emitter.next(timestemp)
  }
  return fpsEmitter
}

export class RefinedImageData {
  public data: Uint16Array
  constructor (public readonly srcData: ImageData) {}
  refine (filter: (color: number[]) => boolean) {
    let {width, height} = this.srcData
    let rawRet = new Uint16Array(width*height*2)
    let validLength = 0
    for (let i = 0; i < width*height; i++) {
      // let color = this.srcData.data.subarray(i*4, i*4 + 4)
      let d = this.srcData.data
      let idx = i*4
      let color = [d[idx], d[idx+1], d[idx+2], d[idx+3]]
      if (!filter(color)) { continue }
      // debugger
      let x = i % width
      let y = i / width
      // subarray is very very slow
      // rawRet.subarray(validLength, validLength+2).set([x, y])
      rawRet[validLength] = x
      rawRet[validLength+1] = y
      validLength += 2
    }
    this.data = rawRet.subarray(0, validLength*2)
  }
  getColor({x, y}: ParticleLike['pos']) {
    let idx = 4*(y*this.width + x)
    let d = this.srcData.data
    let color = [d[idx], d[idx+1], d[idx+2], d[idx+3]]
    return color
  }
  get width () { return this.srcData.width }
  get height () { return this.srcData.height }
}

// use typed array stands for a batch of dots,
// properties on a dot: [color, pos, dir, acc] share memory
export class BufferDots {
  private buffer: Uint32Array
  constructor (public readonly count: number) {
    this.buffer = new Uint32Array(count*9)
  }
  // this **SHOULD BE** implemented by webgl & glsl,
  // not in js class
}

// -------physical-----------
export function rebound(
  {pos, dir}: ParticleLike,
  {top, bottom, left, right}: Boundary,
  decay = {dcx: 1, dcy: 1},
  callback?: Function
) {
  let hit = false
  if (pos.x < left) {
    pos.x = left
    dir.vx *= -decay.dcx
    hit = true
  } else if (pos.x > right) {
    pos.x = right
    dir.vx *= -decay.dcx
    hit = true
  }

  if (pos.y < top) {
    pos.y = top
    dir.vy *= -decay.dcy
    hit = true
  } else if (pos.y > bottom) {
    pos.y = bottom
    dir.vy *= -decay.dcy
    hit = true
  }
  callback && hit && callback()
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

export function slide (
  pos: ParticleLike['pos'],
  dest: ParticleLike['pos'],
  k = 0.1
) {
  pos.x += (dest.x - pos.x) * k
  pos.y += (dest.y - pos.y) * k
}