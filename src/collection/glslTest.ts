import {GLScene, GLProg} from './utils/WebGL'
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
    // add glsl program
    console.log(this.gl)
    let prog = new GLProg(vsSrc, fsSrc, this.gl)
    prog.assignAttrLoc(['a_position'])
    this.addProg('triangle', prog)

    // transfer data to buffer
    let positions = [
      0, 0,
      0, 0.5,
      0.7, 0,
    ]
    this.addArrayBuffer('positions', new Float32Array(positions))

    // set viewport
    let {gl, windowH, windowW} = this
    gl.viewport(0, 0, windowW, windowH)

    let program = this.glPrograms['triangle'].program
    gl.useProgram(program)
    let transferParam: TransferParam = {
      size: 2,
      type: gl.FLOAT,
      normalize: false,
      stride: 0,
      offset: 0
    }
    let buffer = this.bufferPool['positions']
    prog.transferArray('a_position', buffer, transferParam)
  }
  clrscr (bgColor = this.bgColor) {
    let {gl} = this
    let [r, g, b, a] = bgColor
    gl.clearColor(r, g, b, a)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }
  render () {
    let {gl} = this
    let primitiveType = gl.TRIANGLES
    let offset = 0
    let count = 3
    gl.drawArrays(primitiveType, offset, count)
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