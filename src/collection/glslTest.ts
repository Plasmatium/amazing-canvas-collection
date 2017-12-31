/**
 * 着色程序中，全局变量只能赋值常量，否则要把变量放置在main中（同C）
 * uniform类型变量，需要在gl.useProgram之后再传送值去显卡。
 */

import {GLScene, generateGLProgram, jsArr2gRam, gRam2ShaderAttr} from './utils/WebGL'
import { colorArray, TransferParam, randn_bm } from './utils/others'
import { normalize } from 'path';

const vsSrc = `
uniform vec2 u_resolution;
attribute vec2 a_position;
attribute vec4 a_color;
varying vec4 v_color;
void main() {
  vec2 clip = a_position/u_resolution*2.0 - 1.0;
  v_color = a_color;
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

class GLDots extends GLScene {
  public dotsData: number[] = []
  constructor (public bgColor: colorArray = [0, 0, 0, 0], count = 500) {
    super()
    let {windowW, windowH, gl} = this
    for (let i=0; i<count; i++) {
      let x = randn_bm()*80 + windowW/2
      let y = randn_bm()*80 + windowH/2
      let rand3 = [1,2,3]
      let color = [random(), random(), random(), 1.0]
      let data = rand3.reduce((v: number[], _ignore) => {
        return [...v, 5*random()+x, 5*random()+y, ...color]
      }, [])
      this.dotsData.push(...data)
    }
  }
  run () {
    let {gl, bgColor, windowW, windowH} = this
    let [r, g, b, a] = bgColor
    let program = generateGLProgram(gl, vsSrc, fsSrc)
    let u_resolutionLoc = gl.getUniformLocation(program, 'u_resolution')
    let positionsBuffer = gl.createBuffer()
    let pointerConfig = {
      size: 2,
      type: gl.FLOAT,
      normalize: false,
      stride: 6*4,
      offset: 0
    }
    
    let data = new Float32Array(this.dotsData)
    jsArr2gRam(gl, gl.ARRAY_BUFFER, positionsBuffer, data, gl.STATIC_DRAW)
    gRam2ShaderAttr(gl, gl.ARRAY_BUFFER, positionsBuffer, 'a_position', pointerConfig, program)
    pointerConfig.offset = 2*4
    pointerConfig.size = 4
    gRam2ShaderAttr(gl, gl.ARRAY_BUFFER, positionsBuffer, 'a_color', pointerConfig, program)


    // draw
    gl.viewport(0, 0, windowW, windowH)
    gl.useProgram(program)
    gl.uniform2f(u_resolutionLoc, windowW, windowH)
    gl.clearColor(r, g, b, a)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, data.length/6)
  }
}

export function glslTest () {
  let scene = new GLDots()

  window.onresize = e => {
    let target = e.target as (typeof window)
    scene.canvas.height = target.innerHeight
    scene.canvas.width = target.innerWidth
  }

  return scene
}