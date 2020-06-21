export default class WebGlElement {
  constructor() {
    this.program = null
    this.vertexBuffer = null
    this.vertexColorBuffer = null
    this.a_position = null
    this.a_Color = null
    this.gl = null
  }

  setup(gl, entitySize, positions, colors) {
    this.gl = gl

    const vertexShader = `
      attribute vec4 a_Position;
      attribute vec4 a_Color;
      varying vec4 v_Color;
      void main() {
          gl_Position = a_Position*2.-1.;
          gl_PointSize = ${entitySize}.;
          v_Color = a_Color;
      }
      `

    const fragmentShader = `
      precision mediump float;
      varying vec4 v_Color;
      
      void main() {
        float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
        if (dist < 0.5 && dist>0.45-v_Color.r/2.) {
          gl_FragColor = vec4(1.-v_Color.g, 0., v_Color.g, 1.);
        } else {
          discard;
        }
      }
      `

    this.program = this.createProgramm(gl, vertexShader, fragmentShader)
    gl.useProgram(this.program)

    // setup vertices buffer
    this.vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    if (positions) {
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW
      )
    }

    this.a_Position = gl.getAttribLocation(this.program, 'a_Position')

    // setup color buffer
    this.vertexColorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer)
    if (colors) {
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
    }

    this.a_Color = gl.getAttribLocation(this.program, 'a_Color')
  }

  draw(length, newPositions, newColors) {
    const { gl, program } = this
    gl.useProgram(program)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    if (newPositions) {
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(newPositions),
        gl.STATIC_DRAW
      )
    }

    gl.vertexAttribPointer(this.a_Position, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.a_Position)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer)
    if (newColors) {
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(newColors),
        gl.STATIC_DRAW
      )
    }
    gl.vertexAttribPointer(this.a_Color, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.a_Color)

    gl.drawArrays(gl.POINTS, 0, length)
  }

  createProgramm(gl, vertexShaderSource, fragmentShaderSource) {
    const vertexShader = this.loadShader(
      gl,
      gl.VERTEX_SHADER,
      vertexShaderSource
    )
    const fragmentShader = this.loadShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    )

    const program = gl.createProgram()

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)

    gl.linkProgram(program)

    return program
  }

  loadShader(gl, type, source) {
    const shader = gl.createShader(type)

    gl.shaderSource(shader, source)

    gl.compileShader(shader)

    const isCompiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (!isCompiled) {
      const decodedType =
        type === gl.VERTEX_SHADER
          ? 'vertex'
          : type === gl.FRAGMENT_SHADER
          ? 'fragment'
          : 'unknown type'
      console.error(`The ${decodedType} shader could not be compiled`)
    }

    return shader
  }

  initAttributeVariable(gl, a_attribute, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0)
    gl.enableVertexAttribArray(a_attribute)
  }
}
