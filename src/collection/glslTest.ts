/**
 * 着色程序中，全局变量只能赋值常量，否则要把变量放置在main中（同C）
 * uniform类型变量，需要在gl.useProgram之后再传送值去显卡。
 */

import {GLScene, generateGLProgram, jsArr2gRam, gRam2ShaderAttr, DataFBO, genDonut} from './utils/WebGL'
import { colorArray, TransferParam, randn_bm } from './utils/others'
import { normalize } from 'path';

// texture2DLod 最后参数1.0是不使用插值，直接使用raw值。
const vsSrc = `
uniform vec2 u_resolution;
uniform float u_totalCount;
uniform sampler2D u_dataTextureIn;
uniform sampler2D u_dataTextureOut;

attribute vec3 a_position;
// a_position.z is index

varying float v_index;
varying vec4 v_color;
void main() {
  v_index = a_position.z;
  vec4 color = texture2DLod(u_dataTextureIn, vec2(v_index*1.0/u_totalCount, 0.0), 1.0);
  vec2 clip = a_position.xy/u_resolution*2.0 - 1.0;
  // v_color = vec4(v_index/10.0, 1.0-v_index/10.0, 0, 1);
  v_color = color;
  gl_Position = vec4(clip, 0, 1);
}
`

const fsSrc = `
precision mediump float;
varying vec4 v_color;
void main() {
  gl_FragColor = v_color;
}
`

const {random} = Math
/*
 * generate data
 */
let count = 3
const dd: number[] = []
for(let i=0; i<count; i++) {
  dd.push(...genDonut(i))
}

let dt: number[] = [] //data texure
/**
 * data type: unsigned byte
 * [r,g,b,a,        // 4 bytes
 * posX*4B, posY*4B,  // 8 bytes
 * volY*4B, volY*4B,  // 8 bytes
 * accX*4B, accY*4B,  // 8 bytes
 * reserve_32b]     // 4 bytes
 * total 32 bytes
 */
let data = [
  // color = rgba, 4B
  0,0,0,0, // posX*4B
  0,0,0,0, // posY*4B

  0,0,0,0, // volX*4B
  0,0,0,0, // volY*4B

  0,0,0,0, // accX*4B
  0,0,0,0, // accY*4B

  0,0,0,0  // reserve_32b = 4B
  // total: 32B
]
for(let i=0; i<count; i++) {
  let color = [random()*255, random()*255, random()*255, 255]
  // let color = [1, 0, 1, 1]

  // data: [posX, posY, volX, volY, accX, accY, reserve, reserve], uint32
  dt.push(...color, ...data)
}

class GLColorfulDonut extends GLScene {
  private vertices: number[] = []
  private dataTexture: number[] = []
  private fboPing: DataFBO
  private fboPong: DataFBO
  private texIdxSwitcher: boolean = false // this is for fbo ping pong switch
  constructor (public bgColor: colorArray = [0.97, 0.96, 0.93, 1], count = 500) {
    super()
    let {windowW, windowH, gl} = this
    this.vertices = dd
    this.dataTexture = dt

    /**
     * init shader this.program
     */
    this.program = generateGLProgram(gl, vsSrc, fsSrc)
    let positionsBuffer = gl.createBuffer()

    let pointerConfig = {
      size: 3,
      type: gl.FLOAT,
      normalize: false,
      stride: 0,
      offset: 0
    }
    
    /**
     * transfer vertices geometry
     */
    let vertices = new Float32Array(this.vertices)
    jsArr2gRam(gl, gl.ARRAY_BUFFER, positionsBuffer, vertices, gl.STATIC_DRAW)
    gRam2ShaderAttr(gl, gl.ARRAY_BUFFER, positionsBuffer, 'a_position', pointerConfig, this.program)

    /**
     * setup ping fbo, default texture index 0
     * transfer data texture
     * data type: unsigned byte
     * [r,g,b,a,        // 4 bytes
     * posX*4B, posY*4B,  // 8 bytes
     * volY*4B, volY*4B,  // 8 bytes
     * accX*4B, accY*4B,  // 8 bytes
     * reserve_32b]     // 4 bytes
     * total 32 bytes
     * 因为format是gl.RGBA，一个宽度是4byte，
     * 所以texture宽度要设为dataTexture.length / 4
     */
    let dataTexture = new Uint8Array(this.dataTexture)
    let width = dataTexture.length / 4
    let height = 1
    let texIdx = 0
    let dataType = gl.UNSIGNED_BYTE
    this.fboPing = new DataFBO(gl, dataType, width, height, texIdx)
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 8)
    this.fboPing.loadData(dataTexture)
    
    //setup pong fbo, default texture index 1
    // switch this.texIdxSwitcher for running with ping pong fbo mode
    texIdx = 1
    this.fboPong = new DataFBO(gl, dataType, width, height, texIdx)
    this.fboPong.loadData(null) // data is null, rending into this texture

    /**
     * enable transparent alpha blend
     * refer to: http://www.halflab.me/2016/08/01/WebGL-premultiplied-alpha/
     */
    gl.enable(gl.BLEND)
    gl.blendEquation(gl.FUNC_ADD)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  
    /**
     * rolling on
     */
    gl.useProgram(this.program)

    // transform uniform variable
    let u_resolutionLoc = gl.getUniformLocation(this.program, 'u_resolution')
    let u_totalCount = gl.getUniformLocation(this.program, 'u_totalCount')
    gl.uniform2f(u_resolutionLoc, windowW, windowH)
    // in this data texture, each donut index has 32 bytes data,
    // 4B color, 8B pos, 8B vol, 8B acc, 4B reserve, total 32B
    gl.uniform1f(u_totalCount, dataTexture.length / 32)

  }
  renderMain (timestamp: number) {
    let {gl, bgColor, windowW, windowH} = this
    let [r, g, b, a] = bgColor

    // set texture index to zero (current ping fbo)
    let texIdx = Number(this.texIdxSwitcher)
    let u_dataTextureIn_loc = gl.getUniformLocation(this.program, 'u_dataTextureIn')
    gl.uniform1i(u_dataTextureIn_loc, texIdx)

    // draw
    gl.viewport(0, 0, windowW, windowH)
    gl.clearColor(r, g, b, a)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertices.length / 3)
  }
}

export function glslTest () {
  let scene = new GLColorfulDonut()

  window.onresize = e => {
    let target = e.target as (typeof window)
    scene.canvas.height = target.innerHeight
    scene.canvas.width = target.innerWidth
  }

  return scene
}