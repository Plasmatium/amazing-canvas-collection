import { TransferParam, showFPS2 } from "./others";
import { timestamp } from "rxjs/operators/timestamp";

let {random, round, floor, sin, cos, PI} = Math

// 生成着色器方法，输入参数：渲染上下文，着色器类型，数据源
export function generateGLShader(
  gl: WebGLRenderingContext,
  type: number, source: string
) {
  let shader = gl.createShader(type); // 创建着色器对象
  gl.shaderSource(shader, source); // 提供数据源
  gl.compileShader(shader); // 编译 -> 生成着色器
  let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    let errString = String(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw Error(errString)
  }
  return shader as WebGLShader;
}

// 生成着色程序
export function generateGLProgram (
  gl: WebGLRenderingContext,
  vsSrc: string,
  fsSrc: string
) {
  let program = gl.createProgram();

  let vertexShader = generateGLShader(gl, gl.VERTEX_SHADER, vsSrc);
  gl.attachShader(program, vertexShader);
  
  let fragmentShader = generateGLShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);
  let success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    let errString = String(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    throw Error(errString)
  }
  return program; 
}

// 从js数据传送到显存
export function jsArr2gRam (
  gl: WebGLRenderingContext,
  target: number,
  buffer: WebGLBuffer | null, // this is gRam
  data: Float32Array,
  usage: number
) {
  gl.bindBuffer(target, buffer)
  gl.bufferData(target, data, usage)
  gl.bindBuffer(target, null)
}

// 将着色程序中的属性指定到显存位置 (属性可以是已索引的，也可以提供着色程序和名称)
export interface PointerConfig {
  size: number
  type: number
  normalize: boolean
  stride: number
  offset: number
}
export function gRam2ShaderAttr (
  gl: WebGLRenderingContext,
  target: number,
  buffer: WebGLBuffer | null,
  attrIdx: number,
  pointerConfig: PointerConfig
): void
export function gRam2ShaderAttr (
  gl: WebGLRenderingContext,
  target: number,
  buffer: WebGLBuffer | null,
  attrName: string,
  pointerConfig: PointerConfig,
  program?: WebGLProgram | null
): void

export function gRam2ShaderAttr (
  gl: WebGLRenderingContext,
  target: number,
  buffer: WebGLBuffer | null,
  attr: string | number,
  pointerConfig: PointerConfig,
  program?: WebGLProgram | null
) {
  let attrIdx: number

  if (typeof attr === 'string') {
    if (!program) throw Error('webgl program should be provided if attr is string')
    attrIdx = gl.getAttribLocation(program, attr)
  } else attrIdx = attr

  let {size, type, normalize, stride, offset} = pointerConfig
  gl.bindBuffer(target, buffer)
  gl.vertexAttribPointer(attrIdx, size, type, normalize, stride, offset)
  gl.enableVertexAttribArray(attrIdx)
  gl.bindBuffer(target, null)
}

export abstract class GLScene {
  public programs: {[progName: string]: WebGLProgram} = {}
  public canvas: HTMLCanvasElement
  protected gl: WebGLRenderingContext
  isRunning: boolean = false
  renderMask: Function[]
  constructor () {
    let canvas = document.getElementsByTagName('canvas')[0]
    if (!canvas) throw Error('canvas not found')
    let gl = canvas.getContext('webgl', {alpha: false})
    if (!gl) throw Error('get webgl context failed')

    this.canvas = canvas
    this.gl = gl
    
    this.renderMask = [showFPS2()]
  }
  get windowW () { return this.canvas.width }
  get windowH () { return this.canvas.height }
  abstract renderMain (timestamp: number): void
  render (timestamp: number) {
    this.isRunning && window.requestAnimationFrame(ts => {
      this.render(ts)
    })
    this.renderMain(timestamp)
    this.renderMask.forEach(mask => {
      mask(timestamp, this.isRunning)
    })
  }
  run () {
    this.isRunning = true
    window.requestAnimationFrame(ts => this.render(ts))
  }
  destory () {}
  onClick (e: MouseEvent) {}
}

// generator vertices
export function genCircle (r: number, div: number = 12) {
  let ret: number[] = []
  for (let i=0; i<2*PI; i += 2*PI/div) {
    ret.push(Math.sin(i)*r, Math.cos(i)*r)
  }
  return ret
}

// for Donuts
const circleList = [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]
.map(r => {
  return genCircle(r)
})

// param index for donut uniform index
export function genDonut (index: number) {
  let len = circleList.length
  let outerIdx = floor(random() * (len-1) + 1) // [1, len-1]
  let innerIdx = outerIdx
  while (innerIdx === outerIdx) innerIdx = floor(random()*outerIdx) // [0, outer]

  let innerC = circleList[innerIdx]
  let outerC = circleList[outerIdx]

  // debug position for x, y
  let x = random()*300
  let y = random()*300

  // flat zip two circle
  let ret: number[] = []
  for (let i=0; i<innerC.length; i+=2) {
    ret.push(innerC[i]+x, innerC[i+1]+y, index, outerC[i]+x, outerC[i+1]+y, index)
  }
  ret.push(ret[0], ret[1], index, ret[3], ret[4], index) // 闭合点
  ret.push(ret[3], ret[4], index) // 结尾化点
  ret.unshift(ret[0], ret[1], index) //开头的退化点，不能放前面，会改变index值
  return ret
}

interface TexParam {
  level: number
  internalFormat: number
  width: number
  height: number
  border: number
  format: number
  type: number
}
export class DataFBO {
  frameBuffer: WebGLFramebuffer | null
  texture: WebGLTexture | null
  constructor (private gl: WebGLRenderingContext) {
    this.frameBuffer = gl.createFramebuffer()
    this.texture = gl.createTexture()
  }
  loadData(data: Uint8Array | Float32Array){
    let {gl, texture} = this

    gl.getExtension('OES_texture_float')
    gl.getExtension('OES_texture_float_linear')
    gl.bindTexture(gl.TEXTURE_2D, texture)
    /**
     * refer to https://stackoverflow.com/questions/46262432/linear-filtering-of-floating-point-textures-in-webgl2
     * and firefox console error
     */
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      data.length / 4,
      1,
      0,
      gl.RGBA,
      gl.FLOAT,
      data
    )
  }
}

/**
 * below is for testing
 */

let count = 300
const _dd: number[] = []
for(let i=0; i<count; i++) {
  _dd.push(...genDonut(i))
}

let _dt: number[] = [] //data texure
let data = [1, 0, 0, 1, 1, 0, 0, 1]
for(let i=0; i<count; i++) {
  let color = [random(), random(), random(), random()]
  // let color = [1, 0, 1, 1]

  // data: [posX, posY, volX, volY, accX, accY, reserve, reserve]
  _dt.push(...color, ...data)
}
// _dt = [.3,.5,.9,1,...data,1,0,0,1,...data,0,0,1,1,...data]

export const dd = _dd
export const dt = _dt