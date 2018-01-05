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
  public program: WebGLProgram | null = null
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
  destory () {
    this.isRunning = false
  }
  onClick (e: MouseEvent) {}
}

// generator vertices
export function genCircle (r: number, div: number = 32) {
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

// DataFBO should be deprecated ----------!
export class DataFBO {
  frameBuffer: WebGLFramebuffer | null
  texture: WebGLTexture | null
  constructor (
    private gl: WebGLRenderingContext,
    private type: number,
    private width: number,
    private height: number,
    public texIdx: number
  ) {
    this.frameBuffer = gl.createFramebuffer()
    this.texture = gl.createTexture()
  }
  loadData(
    data: Uint8Array | Float32Array | null,
  ) {
    let {gl, texture} = this
    this.activeNBindTexture()
    
    if (this.type === gl.FLOAT) {
      gl.getExtension('OES_texture_float')
      gl.getExtension('OES_texture_float_linear')
    }
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
      this.width,
      this.height,
      0,
      gl.RGBA,
      this.type,
      data
    )
  }
  activeNBindTexture() {
    let {gl, texture, texIdx} = this
    gl.activeTexture(gl.TEXTURE0 + texIdx)
    gl.bindTexture(gl.TEXTURE_2D, texture)
  }
}

/**
 * first bind to texPing, render to screen
 * second bind to texPong, bind frameBuffer, render to texPong
 * then swap texPing and texPong
 * 
 * in texture data, use reserved data bytes to control
 * if should discard in shader program
 * (retransfer vertices to GPU is slow, it takes about 0.5~1.5ms)
 */
export class PingPongMGR {
  private texPing: WebGLTexture | null
  private texPong: WebGLTexture | null
  private frameBuffer: WebGLFramebuffer | null
  private u_control_loc: number | null
  constructor (
    private gl: WebGLRenderingContext,
    private width: number,
    private height: number,
    private dataType: number
  ) {
    this.texPing = gl.createTexture()
    this.texPong = gl.createTexture()
    this.frameBuffer = gl.createFramebuffer()
  }
  initData (
    data: Uint8Array | Float32Array | null,
    tex: WebGLTexture | null
  ) {
    let {gl} = this
    gl.bindTexture(gl.TEXTURE_2D, tex)
    
    if (this.dataType === gl.FLOAT) {
      gl.getExtension('OES_texture_float')
      gl.getExtension('OES_texture_float_linear')
    }
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
      this.width,
      this.height,
      0,
      gl.RGBA,
      this.dataType,
      data
    )
  }
  initPing (data: Uint8Array | Float32Array) { this.initData(data, this.texPing) }
  initPong () { this.initData(null, this.texPong) }
  enablePing () {
    // render to screen from using texPing
    let {gl, texPing} = this
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.bindTexture(gl.TEXTURE_2D, texPing)
    gl.uniform1i(this.u_control_loc, 1) // 1 stands for rendering to screen
  }
  enablePong () {
    // render to texPong into frameBuffer
    let {gl, texPong, frameBuffer} = this
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
    const attachmentPoing = gl.COLOR_ATTACHMENT0
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoing, gl.TEXTURE_2D, texPong, 0)
    gl.uniform1i(this.u_control_loc, 0) // 0 stands form rendering to texPong
  }
  swapPingPong () {
    let tmp = this.texPing
    this.texPing = this.texPong
    this.texPong = tmp
  }
}