/**
 * 着色程序中，全局变量只能赋值常量，否则要把变量放置在main中（同C）
 * uniform类型变量，需要在gl.useProgram之后再传送值去显卡。
 */

import {
  GLScene,
  generateGLProgram,
  jsArr2gRam,
  gRam2ShaderAttr,
  genDonut,
  PingPongMGR,
  genCircleList,
  IndexGen,
  float2U8,
  genStdDonuts
} from './utils/WebGL'
import { colorArray, TransferParam, randn_bm } from './utils/others'

let g_ = 1
// texture2DLod 最后参数1.0是不使用插值，直接使用raw值。
const vsSrc = `
uniform vec2 u_resolution;
uniform float u_totalCount;
uniform sampler2D u_dataTextureIn;
uniform int u_control;
uniform float u_idxStride;

// a_position.z is index
attribute vec3 a_position;

varying vec4 v_color;

void main() {
  float v_index;
  if (0 == u_control) {
    // v_index first cut off to integrate number
    v_index = float(int(a_position.z/u_idxStride));
    v_index = v_index/u_totalCount; // [0.0, 1.0]
    v_color = texture2DLod(u_dataTextureIn, vec2(v_index, 0.0), 1.0);

    vec2 clip = a_position.xy/u_resolution*2.0 - 1.0;

    gl_Position = vec4(clip, 0, 1);
    return;
  }

  if (1 == u_control) {
    // decay color
    // each sector is 32B / 4B, color offset is 0
    // divide 4 stands for rgba, 4 value one group(pixel)
    // +0.05 is a tiny positive offset to let GPU catch 
    // the right index, or it would catch previous index
    v_index = a_position.z / u_totalCount; // [0.0, 1.0]

    // normalize to [-1,1], total width = u_totalCount * 32 / 4
    // divide 4 stands for rgba, 4 value one group(pixel)
    float ping_index = v_index;
    float pong_index = v_index * 2.0 - 1.0; // scalar to [-1,1], for renderer

    // vec2 y=0.5, because for taking middle of the y axis
    v_color = texture2DLod(u_dataTextureIn, vec2(ping_index, 0.0), 1.0);
    // v_color.rgba -= 0.01;

    // a_position.z is for texture coord, is the data texture's data index
    gl_Position = vec4(pong_index, 0.0, 0, 1);
  }

  if (2 == u_control) {

  }
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

class GLColorfulDonut extends GLScene {
  private texData: Uint8Array
  private dataTexture: WebGLTexture | null
  private baseVertices: Float32Array
  private u_control_loc: WebGLUniformLocation | null
  constructor (
    public bgColor: colorArray,
    private count: number,
    private precision: number,
    private circleList: number[][] 
  ) {
    super()
    let {windowW, windowH, gl} = this
    this.genBase()
    this.genTexData()

    /**
     * init shader this.program
     */
    this.program = generateGLProgram(gl, vsSrc, fsSrc)
    gl.useProgram(this.program)

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
    jsArr2gRam(gl, gl.ARRAY_BUFFER, positionsBuffer, this.baseVertices, gl.STATIC_DRAW)
    gRam2ShaderAttr(gl, gl.ARRAY_BUFFER, positionsBuffer, 'a_position', pointerConfig, this.program)

    /**
     * transfer data texture
     * texture channel default to zero
     */

    this.dataTexture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, this.dataTexture)
    /**
     * refer to https://stackoverflow.com/questions/46262432/linear-filtering-of-floating-point-textures-in-webgl2
     * and firefox console error
     */
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.windowW,
      this.windowH,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this.texData
    )
    /**
     * enable transparent alpha blend
     * refer to: http://www.halflab.me/2016/08/01/WebGL-premultiplied-alpha/
     */
    gl.enable(gl.BLEND)
    gl.blendEquation(gl.FUNC_ADD)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    /**
     * enable anti aliasing by gl.ampleCoverage
     */
    // gl.enable(gl.SAMPLE_COVERAGE)
    // gl.sampleCoverage(1.0, false)
  
    // transform uniform variable
    let u_resolutionLoc = gl.getUniformLocation(this.program, 'u_resolution')
    let u_totalCount = gl.getUniformLocation(this.program, 'u_totalCount')
    let u_idxStride = gl.getUniformLocation(this.program, 'u_idxStride')
    gl.uniform2f(u_resolutionLoc, windowW, windowH)
    // in this data texture, each donut index has 32 bytes data,
    // 4B color, 8B pos, 8B vol, 8B acc, 4B reserve, total 32B
    gl.uniform1f(u_totalCount, this.count)
    
    // -----------
    this.genBase()
  }
  genBase () {
    this.baseVertices = new Float32Array(genStdDonuts(this.count, 32))
  }
  genTexData () {
    let ret: number[] = []
    for(let i=0; i<this.count; i++) {
      // push color
      ret.push(random()*255, random()*255, random()*255, 255)

      // push posX and posY
      ret.push(...float2U8(random()))
      ret.push(...float2U8(random()))
    }
    this.texData = new Uint8Array(ret)
  }
  mutate () {}
  renderMain (timestamp: number) {
    let {gl, bgColor, windowW, windowH} = this
    let [r, g, b, a] = bgColor

    gl.enable(gl.BLEND)
    gl.viewport(0, 0, windowW, windowH)
    gl.clearColor(r, g, b, a)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.baseVertices.length / 3)

    this.mutate()
  }
}

export function glslTest () {
  const count = 3
  const precision = 32
  const circleList = genCircleList(5, 25, 0.1, precision)

  let scene = new GLColorfulDonut(
    [0.97, 0.96, 0.93, 1],
    count,
    precision,
    circleList
  )

  window.onresize = e => {
    let target = e.target as (typeof window)
    scene.canvas.height = target.innerHeight
    scene.canvas.width = target.innerWidth
  }

  return scene
}