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
uniform sampler2D u_texData;

// a_position.z is index
attribute vec3 a_position;

varying vec4 v_color;

void main() {
  float largeIdx, minorIdx;
  minorIdx = mod(a_position.z, 1000.0);
  largeIdx = floor(a_position.z / 1000.0);

  // fetch color
  float colorIdx = largeIdx / u_totalCount;
  v_color = texture2DLod(u_texData, vec2(colorIdx, 0.5), 1.0);

  // fetch innerR or outerR
  float radiusIdx = (largeIdx * 5.0 + 1.0 + minorIdx) / (u_totalCount * 5.0);
  vec4 rd_vec = 255.0 * texture2DLod(u_texData, vec2(radiusIdx, 0.5), 1.0);
  highp float radius = 100.0 * (rd_vec.r*float(0x1000000) + rd_vec.g*float(0x10000) + rd_vec.b*float(0x100) + rd_vec.a) / float(0xffffffff);
  vec2 position = a_position.xy * (5.0 + 15.0 * minorIdx);
  // vec2 position = a_position.xy * radius;
  v_color = vec4(1.0-radiusIdx, radiusIdx*2.0, 0.3, 1.0);

  // window clip transform
  vec2 clip = position / u_resolution * 2.0 - 1.0;
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

class GLColorfulDonut extends GLScene {
  private texData: Uint8Array
  private dataTexture: WebGLTexture | null
  private baseVertices: Float32Array
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
    console.log(this.texData)

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
    gl.uniform2f(u_resolutionLoc, windowW, windowH)
    gl.uniform1f(u_totalCount, this.count)
    
    // -----------
    this.genBase()
  }
  genBase () {
    this.baseVertices = new Float32Array(genStdDonuts(this.count, 32))
  }
  genTexData () {
    let ret: number[] = []
    // total 5 texel per donut
    for(let i=0; i<this.count; i++) {
      // push color, 4 bytes, 1 texel
      ret.push(random() * 255, random() * 255, random() * 255, 255)

      // push innerR and outerR, 8 bytes, 2 texel
      let innerR = 5 + random() * 10
      let outerR = innerR + random() * 25
      ret.push(...float2U8(innerR / 100))
      ret.push(...float2U8(outerR / 100))

      // push posX and posY, 8 bytes, 2 texel
      ret.push(...float2U8(random()))
      ret.push(...float2U8(random()))
    }
    this.texData = new Uint8Array(ret)
  }
  mutate () {
  }
  renderMain (timestamp: number) {
    let {gl, bgColor, windowW, windowH} = this
    let [r, g, b, a] = bgColor

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.texData.length / 4, // 1 texel is rgba, how many rgbas?
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this.texData
    )

    gl.enable(gl.BLEND)
    gl.viewport(0, 0, windowW, windowH)
    gl.clearColor(r, g, b, a)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.baseVertices.length / 3)

    this.mutate()
  }
}

export function glslTest () {
  const count = 1
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