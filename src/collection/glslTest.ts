/**
 * 着色程序中，全局变量只能赋值常量，否则要把变量放置在main中（同C）
 * uniform类型变量，需要在gl.useProgram之后再传送值去显卡。
 */

import {GLScene, generateGLProgram, jsArr2gRam, gRam2ShaderAttr, dd, dt} from './utils/WebGL'
import { colorArray, TransferParam, randn_bm } from './utils/others'
import { normalize } from 'path';

const vsSrc = `
uniform vec2 u_resolution;
attribute vec3 a_position;
// a_position.z is index
varying float v_index;
varying vec4 v_color;
void main() {
  v_index = a_position.z;

  vec2 clip = a_position.xy/u_resolution*2.0 - 1.0;
  v_color = vec4(v_index, 0.4, 0.8, 1);
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
  public vertices: number[] = []
  public dataTexture: number[] = []
  constructor (public bgColor: colorArray = [0, 0, 0, 0], count = 500) {
    super()
    let {windowW, windowH, gl} = this
    this.vertices = dd
    this.dataTexture = dt

    // init
    let program = generateGLProgram(gl, vsSrc, fsSrc)
    let positionsBuffer = gl.createBuffer()

    let pointerConfig = {
      size: 3,
      type: gl.FLOAT,
      normalize: false,
      stride: 0,
      offset: 0
    }
    // transfer vertices
    let vertices = new Float32Array(this.vertices)
    jsArr2gRam(gl, gl.ARRAY_BUFFER, positionsBuffer, vertices, gl.STATIC_DRAW)
    gRam2ShaderAttr(gl, gl.ARRAY_BUFFER, positionsBuffer, 'a_position', pointerConfig, program)



    // transfer data texture
    
    gl.useProgram(program)
    // transform uniform variable
    let u_resolutionLoc = gl.getUniformLocation(program, 'u_resolution')
    gl.uniform2f(u_resolutionLoc, windowW, windowH)
  }
  renderMain (timestamp: number) {
    let {gl, bgColor, windowW, windowH} = this
    let [r, g, b, a] = bgColor
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