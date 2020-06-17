export default class WebGlElement {
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
