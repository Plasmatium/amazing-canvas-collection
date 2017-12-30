import {GLScene, generateGLProgram, jsArr2gRam, gRam2ShaderAttr} from './utils/WebGL'
import { colorArray, TransferParam } from './utils/others'
import { normalize } from 'path';

const vsSrc = `
attribute vec4 a_position;
void main() {
  gl_Position = a_position;
}
`

const fsSrc = `
precision mediump float;
void main() {
  gl_FragColor = vec4(1, 0, 0.5, 1);
}
`

class GLDots extends GLScene {
  constructor (public bgColor: colorArray = [0, 0, 0, 0]) {
    super()
  }
  run () {
    let {gl, bgColor, windowW, windowH} = this
    let [r, g, b, a] = bgColor
    let positions = [
      0, 0,
      0, 0.5,
      0.5, 0.5,
      0.5, 1
    ]
    let program = generateGLProgram(gl, vsSrc, fsSrc)
    let positionsBuffer = gl.createBuffer()
    let pointerConfig = {
      size: 2,
      type: gl.FLOAT,
      normalize: false,
      stride: 0,
      offset: 0
    }
    jsArr2gRam(gl, gl.ARRAY_BUFFER, positionsBuffer, new Float32Array(positions), gl.STATIC_DRAW)
    gRam2ShaderAttr(gl, gl.ARRAY_BUFFER, positionsBuffer, 'a_position', pointerConfig, program)

    // draw
    gl.viewport(0, 0, windowW, windowH)
    gl.useProgram(program)
    gl.clearColor(r, g, b, a)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
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