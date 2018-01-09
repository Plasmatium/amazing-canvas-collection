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
  float2U8
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
  private vertices: Float32Array
  private dataTexture: Uint8Array
  private baseVertices: number[]
  private ppm: PingPongMGR
  private texIdxSwitcher: boolean = false // this is for fbo ping pong switch
  private idxStride: number
  private u_control_loc: WebGLUniformLocation | null
  constructor (
    public bgColor: colorArray,
    private count: number,
    private precision: number,
    private circleList: number[][] 
  ) {
    super()

    /**
     * generate vertices and dataTexture
     */
    let {windowW, windowH, gl} = this
    const idxGen = new IndexGen()

    const vertices = []
    for (let i=0; i<count; i++) {
      vertices.push(...genDonut(circleList))
    }
    // then fill index
    // [posX, posY, idx, posX, posY, idx, ...]
    for (let i=0; i<vertices.length; i+=3) {
      vertices[i+2] = idxGen.pullIdx()
    }
    this.vertices = new Float32Array(vertices)

    const dataTexture: number[] = []
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
      16,17,18,19, // posX*4B
      26,27,28,29, // posY*4B

      36,37,38,39, // volX*4B
      46,47,48,49,// volY*4B

      56,57,58,59,// accX*4B
      66,67,68,69,// accY*4B

      76,77,78,79,  // reserve_32b = 4B
      // total: 32B
    ]
    for (let i = 0; i < count; i++) {
      let color = [random() * 255, random() * 255, random() * 255, 255]
      // let color = [1, 0, 1, 1]

      // data: [posX, posY, volX, volY, accX, accY, reserve, reserve], uint32
      let x = 100 / this.windowW
      let y = 200 / this.windowH
      let dataX = float2U8(x)
      let dataY = float2U8(y)
      dataX.forEach((d, idx) => {
        data[idx] = d
      })
      dataY.forEach((d, idx) => {
        data[idx+4] = d
      })
      dataTexture.push(...color, ...data)
    }
    //---debug
    // dataTexture[0]=255;dataTexture[1]=0;dataTexture[2]=0;
    // dataTexture[32]=0;dataTexture[33]=255;dataTexture[34]=0;
    // dataTexture[64]=0;dataTexture[65]=0;dataTexture[66]=255;
    //---debug
    this.dataTexture = new Uint8Array(dataTexture)
    console.log(this.dataTexture)
    
    /** 
     * 顶点数组结构：
     * [posX, posY, idx...], idx由idxGen自增，每个donut包含precision*2+2+2
     * 因为包括了inner和outer两圈（消耗两个idx），以及1组闭合（inner的和outer的
     * 两个idx），以及前后两个退化三角形辅助点（2个idx）。
     * 注：1个点配合1个idx：[posX, posY, idx...]
     * 比如precision=32时，stride是68，即每个donut的idx跨度是68
     */                        
    this.idxStride = precision * 2 + 2 + 2

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
    jsArr2gRam(gl, gl.ARRAY_BUFFER, positionsBuffer, this.vertices, gl.STATIC_DRAW)
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
     * 因为format是gl.RGBA，一个宽度是4B，
     * 所以texture宽度要设为dataTexture.length / 4
     * dataTexture.length / 4 === donutCount * 8
     */
    let width = this.dataTexture.length / 4
    let height = 1
    /**
     * setup PingPongManager
     */
    this.u_control_loc = gl.getUniformLocation(this.program, 'u_control')
    this.ppm = new PingPongMGR(gl, width, height, gl.UNSIGNED_BYTE, this.u_control_loc)
    this.ppm.initPing(this.dataTexture)
    this.ppm.initPong()

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
    gl.uniform1f(u_totalCount, this.dataTexture.length / 32)
    gl.uniform1f(u_idxStride, this.idxStride)    
  }
  genBase () {
    
  }
  renderMain (timestamp: number) {
    let {gl, bgColor, windowW, windowH} = this
    let [r, g, b, a] = bgColor

    gl.enable(gl.BLEND)
    this.ppm.enablePing()
    gl.viewport(0, 0, windowW, windowH)
    gl.clearColor(r, g, b, a)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertices.length / 3)
//-------------

    gl.uniform1i(this.u_control_loc, 1)
    gl.drawArrays(gl.LINE_STRIP, 0, this.count)

//--------------
    debugger
    this.ppm.enablePong()
    gl.disable(gl.BLEND)
    let width = this.count * 8
    gl.viewport(0, 0, width, 1)
    gl.clearColor(0.5, 0.6, 0.7, 0.8)
    gl.clear(gl.COLOR_BUFFER_BIT)
    
    // deal with color
    gl.uniform1i(this.u_control_loc, 1)
    gl.drawArrays(gl.POINTS, 0, this.count)

    // deal with donut position
    // gl.uniform1i(this.u_control_loc, 2)
    // gl.drawArrays(gl.POINTS, 0, this.count)

    // clear binding framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    // this.ppm.swapPingPong()
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