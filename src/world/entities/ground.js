import WebGlElement from '../../tools/webglelement'
import { Matrix4 } from '../../tools/cuon-matrix'
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
    this.u_MvpMatrix = null
    this.gl = null
    this.ground = []
    this.colors = []
    this.world = null
  }

  generateVerticesGround() {
    const vertices = []
    const tileSize = this.tileSize
    const height = -0.03

    for (let iz = 0; iz < this.itemsPerLine; iz++) {
      for (let ix = 0; ix < this.itemsPerLine; ix++) {
        //bottom left
        let x = ix * tileSize * 2 - 1
        let z = iz * tileSize * 2 - 1
        vertices.push(x, height, z)

        // top left
        x = ix * tileSize * 2 - 1
        z = (iz + 1) * tileSize * 2 - 1
        vertices.push(x, height, z)

        //top right
        x = (ix + 1) * tileSize * 2 - 1
        z = (iz + 1) * tileSize * 2 - 1
        vertices.push(x, height, z)

        //bottom left
        x = ix * tileSize * 2 - 1
        z = iz * tileSize * 2 - 1
        vertices.push(x, height, z)

        //top right
        x = (ix + 1) * tileSize * 2 - 1
        z = (iz + 1) * tileSize * 2 - 1
        vertices.push(x, height, z)

        //bottom right
        x = (ix + 1) * tileSize * 2 - 1
        z = iz * tileSize * 2 - 1
        vertices.push(x, height, z)
      }
    }
    return vertices
  }

  setup(gl, world) {
    this.gl = gl
    this.world = world

    for (let iy = 0; iy < this.itemsPerLine; iy++) {
      for (let ix = 0; ix < this.itemsPerLine; ix++) {
        // const x = (ix + 0.5) * this.tileSize * 2 - 1
        // const y = (iy + 0.5) * this.tileSize * 2 - 1
        // this.ground.push(x, y)
        this.colors.push(Math.random() * 0.5 + 0.1)
      }
    }
    this.ground = this.generateVerticesGround()
    //this.generateGround()
    //console.table(this.ground)

    // const vertexShader = `
    // attribute vec4 a_Position;
    // attribute vec4 a_Color;
    // varying vec4 v_Color;
    // void main() {
    //     gl_Position = a_Position;
    //     gl_PointSize = ${Math.round(this.tileSize * world.surface)}.;
    //     v_Color = a_Color;
    // }
    // `

    // const fragmentShader = `
    // precision mediump float;
    // varying vec4 v_Color;

    // void main() {
    //     gl_FragColor = vec4(v_Color.r*0.2, v_Color.r, v_Color.r*0.3, 1.0);

    // }
    // `

    const vertexShader = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_MvpMatrix;
    varying vec4 v_Color;
    void main() {
        gl_Position = u_MvpMatrix * a_Position;
        //gl_Position = u_MvpMatrix * vec4(a_Position.x,0.0,a_Position.y, 1.0);
        gl_PointSize = ${Math.round(this.tileSize * world.surface)}.;
        v_Color = a_Color;
    }
    `

    const fragmentShader = `
    precision mediump float;
    varying vec4 v_Color;
    
    void main() {
        gl_FragColor = vec4(v_Color.r*0.2, v_Color.r, v_Color.r*0.3, 1.0);
       
    }
    `

    this.program = this.createProgramm(gl, vertexShader, fragmentShader)
    gl.useProgram(this.program)

    // setup vertices buffer
    this.vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.ground),
      gl.STATIC_DRAW
    )
    this.a_Position = gl.getAttribLocation(this.program, 'a_Position')

    this.u_MvpMatrix = gl.getUniformLocation(this.program, 'u_MvpMatrix')

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
    gl.vertexAttribPointer(this.a_Position, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.a_Position)

    const colorForEachVertice = []
    this.colors.forEach((c) => {
      colorForEachVertice.push(c, c, c, c, c, c)
    })
    //console.log(colorForEachVertice.length, this.ground.length)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(colorForEachVertice),
      gl.STATIC_DRAW
    )
    gl.vertexAttribPointer(this.a_Color, 1, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.a_Color)

    const mvpMatrix = new Matrix4() // Model view projection matrix
    const modelMatrix = new Matrix4() // Model matrix
    mvpMatrix
      .set(this.world.projMatrix)
      .multiply(this.world.viewMatrix)
      .multiply(modelMatrix)
    // Pass the model view projection matrix to u_MvpMatrix
    //debugger
    gl.uniformMatrix4fv(this.u_MvpMatrix, false, mvpMatrix.elements)

    gl.drawArrays(gl.TRIANGLES, 0, this.ground.length / 3)
  }

  update() {
    for (let i = 0; i < this.colors.length; i++) {
      this.colors[i] = Math.max(
        0,
        Math.min(this.colors[i] + Math.random() / 2000, 1)
      )
    }
  }

  getColorIndex({ x, y }) {
    const column = Math.floor(x / this.tileSize)
    const row = Math.floor(y / this.tileSize)
    const index = row * this.itemsPerLine + column
    return index
  }

  collect(vehicule) {
    const index = this.getColorIndex(vehicule)
    const value = this.colors[index]
    if (value > 0.05) {
      const harvest = this.colors[index] * 0.03
      this.colors[index] -= harvest
      return harvest
    }
    return 0
  }

  inspectSurroundingFertility(vehicule) {
    const index = this.getColorIndex(vehicule)
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
