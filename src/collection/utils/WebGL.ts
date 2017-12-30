import { TransferParam } from "./others";

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
}

export class GLScene {
  public programs: {[progName: string]: WebGLProgram} = {}
  public canvas: HTMLCanvasElement
  protected gl: WebGLRenderingContext
  constructor () {
    let canvas = document.getElementsByTagName('canvas')[0]
    if (!canvas) throw Error('canvas not found')
    let gl = canvas.getContext('webgl')
    if (!gl) throw Error('get webgl context failed')

    this.canvas = canvas
    this.gl = gl
  }
  get windowW () { return this.canvas.width }
  get windowH () { return this.canvas.height }
  run () {}
  destory () {}
  onClick (e: MouseEvent) {}
}
