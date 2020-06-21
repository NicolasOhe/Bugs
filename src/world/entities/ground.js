import WebGlElement from '../../tools/webglelement'

export default class Ground extends WebGlElement {
  constructor(itemsPerLine) {
    super()
    this.itemsPerLine = itemsPerLine
    this.tileSize = 1 / itemsPerLine
    this.program = null
    this.vertexBuffer = null
    this.vertexColorBuffer = null
    this.a_position = null
    this.a_Color = null
    this.gl = null
    this.ground = []
    this.colors = []
    this.world = null

    for (let iy = 0; iy < itemsPerLine; iy++) {
      for (let ix = 0; ix < itemsPerLine; ix++) {
        const x = (ix + 0.5) * this.tileSize * 2 - 1
        const y = (iy + 0.5) * this.tileSize * 2 - 1
        this.ground.push(x, y)
        this.colors.push(Math.random() * 0.5 + 0.1)
      }
    }
  }

  setup(gl, world) {
    this.gl = gl
    this.world = world

    const vertexShader = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = ${Math.round(this.tileSize * world.surface)}.;
        v_Color = a_Color;
    }
    `

    const fragmentShader = `
    precision mediump float;
    uniform vec4 u_Color;
    uniform vec2 u_Canvas;
    varying vec4 v_Color;
    
    void main() {
        gl_FragColor = vec4(v_Color.r*0.2, v_Color.r, v_Color.r*0.3, 1.0);
       
    }
    `

    this.program = this.createProgramm(gl, vertexShader, fragmentShader)
    gl.useProgram(this.program)

    const u_Color = gl.getUniformLocation(this.program, 'u_Color')
    gl.uniform4f(u_Color, 0.0, 1.0, 0.0, 1.0)

    const u_Canvas = gl.getUniformLocation(this.program, 'u_Canvas')
    gl.uniform2f(u_Canvas, world.canvas.width, world.canvas.height)

    // setup vertices buffer
    this.vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.ground),
      gl.STATIC_DRAW
    )
    this.a_Position = gl.getAttribLocation(this.program, 'a_Position')

    // setup color buffer
    this.vertexColorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.colors),
      gl.STATIC_DRAW
    )
    this.a_Color = gl.getAttribLocation(this.program, 'a_Color')
  }

  draw() {
    const { gl, program } = this
    gl.useProgram(program)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.vertexAttribPointer(this.a_Position, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.a_Position)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.colors),
      gl.STATIC_DRAW
    )
    gl.vertexAttribPointer(this.a_Color, 1, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.a_Color)

    gl.drawArrays(gl.POINTS, 0, this.ground.length / 2)
  }

  update() {
    for (let i = 0; i < this.colors.length; i++) {
      this.colors[i] = Math.max(
        0,
        Math.min(this.colors[i] + Math.random() / 2000, 1)
      )
    }
  }

  collect({ x, y }) {
    const column = Math.floor(x / this.tileSize)
    const row = Math.floor(y / this.tileSize)
    const index = row * this.itemsPerLine + column
    const value = this.colors[index]
    if (value > 0.05) {
      const harvest = this.colors[index] * 0.03
      this.colors[index] -= harvest
      return harvest
    }
    return 0
  }

  inspectSurroundingFertility(vehicule) {
    const { x, y } = vehicule
    const column = Math.floor(x / this.tileSize)
    const row = Math.floor(y / this.tileSize)
    const index = row * this.itemsPerLine + column
    let top = 0
    let bottom = 0
    let right = 0
    let left = 0

    bottom =
      (this.colors[index - this.itemsPerLine - 1] || 0) +
      (this.colors[index - this.itemsPerLine] || 0) +
      (this.colors[index - this.itemsPerLine + 1] || 0)

    top =
      (this.colors[index + this.itemsPerLine - 1] || 0) +
      (this.colors[index + this.itemsPerLine] || 0) +
      (this.colors[index + this.itemsPerLine + 1] || 0)

    left =
      (this.colors[index - this.itemsPerLine - 1] || 0) +
      (this.colors[index - 1] || 0) +
      (this.colors[index + this.itemsPerLine - 1] || 0)

    right =
      (this.colors[index - this.itemsPerLine + 1] || 0) +
      (this.colors[index + 1] || 0) +
      (this.colors[index + this.itemsPerLine + 1] || 0)

    const attractionX = right - left
    const attractionY = top - bottom

    return [attractionX, attractionY]
  }
}
