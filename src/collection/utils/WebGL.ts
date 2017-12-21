import { TransferParam } from "./others";

export class GLProg {
  public program: WebGLProgram
  public attrLocs: { [variableName: string]: number }
  constructor (vsSrc: string, fsSrc: string, protected gl: WebGLRenderingContext) {
    this.makeProgram(vsSrc, fsSrc)
  }
  private makeShader (type: number, source: string,) {
    let {gl} = this
    let shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (!success) {
      console.log(gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
    }
    return shader
  }
  private makeProgram(vsSrc: string, fsSrc: string) {
    let {gl} = this
    let vShader = this.makeShader(gl.VERTEX_SHADER, vsSrc)
    let fShader = this.makeShader(gl.FRAGMENT_SHADER, fsSrc)

    let program = gl.createProgram()
    gl.attachShader(program, vShader)
    gl.attachShader(program, fShader)
    gl.linkProgram(program)

    let success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (!success || !program) {
      console.log(gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      return
    }
    this.program = program
  }
  assignAttrLoc (attrList: string[]) {
    let {gl, program} = this
    attrList.forEach(attrName => {
      let loc = gl.getAttribLocation(program, attrName)
      this.attrLocs[attrName] = loc
    })
  }
  transferArray (attrName: string,
    buffer: WebGLBuffer, 
    {
      size,
      type,
      normalize,
      stride,
      offset
    }: TransferParam
  ) {
    let {gl} = this
    let attrLoc = this.attrLocs[attrName]
    gl.enableVertexAttribArray(attrLoc)
    gl.bindBuffer(gl.ARRAY_BUFFER, attrLoc)
    gl.vertexAttribPointer(attrLoc, size, type, normalize, stride, offset)
  }
}

export abstract class GLScene {
  protected glPrograms: { [progName: string]: GLProg }
  protected bufferPool: { [bufferName: string]: WebGLBuffer }
  public canvas: HTMLCanvasElement
  public gl: WebGLRenderingContext
  timer: number
  constructor () {
    let canvas = document.getElementsByTagName('canvas')[0]
    if (!canvas) throw Error('canvas not found')
    let gl = canvas.getContext('webgl')
    if (!gl) throw Error('get webgl context failed')

    this.canvas = canvas
    this.gl = gl
  }
  get windowH () { return this.gl.canvas.height }
  get windowW () { return this.gl.canvas.width }
  addProg (name: string, prog: GLProg) {
    this.glPrograms[name] = prog
  }
  addArrayBuffer (bufferName: string, dataArr: Float32Array) {
    const {gl} = this
    let buffer = gl.createBuffer()
    if (!buffer) throw Error('could not create buffer')

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, dataArr, gl.STATIC_DRAW)
    this.bufferPool[bufferName] = buffer
  }

  abstract render (): void
  run () {
    this.timer = window.setInterval(() => this.render(), 16)
  }
  onClick (e: MouseEvent) {}
  destory () {
    window.clearInterval(this.timer)
  }
}