import { Matrix4, Vector3 } from '../tools/cuon-matrix'
import { vertices, indices, normals } from '../tools/cube'
export default class WebGlElement {
  constructor() {
    this.program = null
    this.vertexBuffer = null
    this.vertexColorBuffer = null
    this.indexBuffer = null
    this.a_position = null
    this.a_Color = null
    this.a_Normal = null
    this.u_MvpMatrix = null
    this.u_Color = null
    this.u_NormalMatrix = null
    this.u_LightColor = null
    this.u_LightDirection = null
    this.u_AmbientLight = null
    this.gl = null
    this.world = null
    this.entitySize = null
  }

  setup(world, entitySize, positions, colors) {
    const gl = world.gl
    this.gl = world.gl
    this.world = world
    this.entitySize = entitySize

    //2D world
    // const vertexShader = `
    //   attribute vec4 a_Position;
    //   attribute vec4 a_Color;
    //   varying vec4 v_Color;
    //   void main() {
    //       gl_Position = a_Position*2.-1.;
    //       gl_PointSize = ${entitySize}.;
    //       v_Color = a_Color;
    //   }
    //   `

    // const fragmentShader = `
    //   precision mediump float;
    //   varying vec4 v_Color;

    //   void main() {
    //     float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
    //     if (dist < 0.5 && dist>0.45-v_Color.r/2.) {
    //       gl_FragColor = vec4(1.-v_Color.g, 0., v_Color.g, 1.);
    //     } else {
    //       discard;
    //     }
    //   }
    //   `

    // 3D world with points
    // const vertexShader = `
    //   attribute vec4 a_Position;
    //   attribute vec4 a_Color;
    //   uniform mat4 u_MvpMatrix;
    //   varying vec4 v_Color;

    //   void main() {
    //       gl_Position = u_MvpMatrix * (vec4(a_Position.x* 2. -1.,0.0,a_Position.y* 2. -1., 1.) );
    //       gl_PointSize = ${entitySize}.;
    //       v_Color = a_Color;
    //   }
    //   `

    // const fragmentShader = `
    //   #ifdef GL_ES
    //   precision mediump float;
    //   #endif
    //   varying vec4 v_Color;

    //   void main() {
    //     float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
    //     if (dist < 0.5 && dist>0.45-v_Color.r/2.) {
    //       gl_FragColor = vec4(1.-v_Color.g, 0., v_Color.g, 1.);
    //     } else {
    //       discard;
    //     }
    //   }
    //   `

    const vertexShader = `
      attribute vec4 a_Position;
      attribute vec4 a_Normal;
      attribute vec4 a_Color;
      uniform mat4 u_MvpMatrix;
      uniform vec4 u_Color;
      uniform mat4 u_NormalMatrix;    // Transformation matrix of normal
      uniform vec3 u_LightColor;      // Light color
      uniform vec3 u_LightDirection;  // World coordinate, normalized
      uniform vec3 u_AmbientLight;    // Ambient light color
      varying vec4 v_Color;

      void main() {
          gl_Position = u_MvpMatrix * a_Position;
          
          // Recalculate normal with normal matrix and make its length 1.0
          vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
      
          // The dot product of the light direction and the normal
          float nDotL = max(dot(u_LightDirection, normal), 0.0);
      
          // Calculate the color due to diffuse reflection
          vec3 diffuse = u_LightColor * u_Color.rgb * nDotL;
      
          // Calculate the color due to ambient reflection
          vec3 ambient = u_AmbientLight * u_Color.rgb;
      
          // Add the surface colors due to diffuse and ambient reflection
          v_Color = vec4(diffuse + ambient, u_Color.a);
      }
      `

    const fragmentShader = `
      #ifdef GL_ES
      precision mediump float;
      #endif
      varying vec4 v_Color;
      
      void main() {
          gl_FragColor = v_Color;
       
      }
      `

    this.program = this.createProgramm(gl, vertexShader, fragmentShader)
    gl.useProgram(this.program)

    // setup vertices buffer
    this.vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
    this.a_Position = gl.getAttribLocation(this.program, 'a_Position')

    // setup indexes buffer
    this.indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

    // setup color buffer
    this.vertexColorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer)
    if (colors) {
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
    }
    this.a_Color = gl.getAttribLocation(this.program, 'a_Color')

    // setup normals buffer
    this.normalsBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW)
    this.a_Normal = gl.getAttribLocation(this.program, 'a_Normal')

    // setup uniforms
    this.u_NormalMatrix = gl.getUniformLocation(this.program, 'u_NormalMatrix')
    this.u_LightColor = gl.getUniformLocation(this.program, 'u_LightColor')
    this.u_LightDirection = gl.getUniformLocation(
      this.program,
      'u_LightDirection'
    )
    this.u_AmbientLight = gl.getUniformLocation(this.program, 'u_AmbientLight')

    const lightDirection = new Vector3([1.0, 3.0, 4.0])
    lightDirection.normalize() // Normalize
    gl.uniform3fv(this.u_LightDirection, lightDirection.elements)
    gl.uniform3f(this.u_AmbientLight, 0.3, 0.3, 0.3)
    gl.uniform3f(this.u_LightColor, 1.0, 1.0, 1.0)

    this.u_MvpMatrix = gl.getUniformLocation(this.program, 'u_MvpMatrix')
    this.u_Color = gl.getUniformLocation(this.program, 'u_Color')
    //debugger
  }

  // 2D
  // draw(length, newPositions, newColors) {
  //   const { gl, program } = this
  //   gl.useProgram(program)

  //   gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
  //   if (newPositions) {
  //     gl.bufferData(
  //       gl.ARRAY_BUFFER,
  //       new Float32Array(newPositions),
  //       gl.STATIC_DRAW
  //     )
  //   }

  //   gl.vertexAttribPointer(this.a_Position, 2, gl.FLOAT, false, 0, 0)
  //   gl.enableVertexAttribArray(this.a_Position)

  //   gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer)
  //   if (newColors) {
  //     gl.bufferData(
  //       gl.ARRAY_BUFFER,
  //       new Float32Array(newColors),
  //       gl.STATIC_DRAW
  //     )
  //   }
  //   gl.vertexAttribPointer(this.a_Color, 2, gl.FLOAT, false, 0, 0)
  //   gl.enableVertexAttribArray(this.a_Color)

  //   gl.drawArrays(gl.POINTS, 0, length)
  // }

  // // 3D Points
  // draw(length, newPositions, newColors) {
  //   const { gl, program } = this
  //   gl.useProgram(program)

  //   gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
  //   if (newPositions) {
  //     gl.bufferData(
  //       gl.ARRAY_BUFFER,
  //       new Float32Array(newPositions),
  //       gl.STATIC_DRAW
  //     )
  //   }

  //   gl.vertexAttribPointer(this.a_Position, 2, gl.FLOAT, false, 0, 0)
  //   gl.enableVertexAttribArray(this.a_Position)

  //   const mvpMatrix = new Matrix4() // Model view projection matrix
  //   const modelMatrix = new Matrix4() // Model matrix
  //   mvpMatrix
  //     .set(this.world.projMatrix)
  //     .multiply(this.world.viewMatrix)
  //     .multiply(modelMatrix)
  //   // Pass the model view projection matrix to u_MvpMatrix
  //   //debugger
  //   gl.uniformMatrix4fv(this.u_MvpMatrix, false, mvpMatrix.elements)

  //   gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer)
  //   if (newColors) {
  //     gl.bufferData(
  //       gl.ARRAY_BUFFER,
  //       new Float32Array(newColors),
  //       gl.STATIC_DRAW
  //     )
  //   }
  //   gl.vertexAttribPointer(this.a_Color, 2, gl.FLOAT, false, 0, 0)
  //   gl.enableVertexAttribArray(this.a_Color)

  //   gl.drawArrays(gl.POINTS, 0, length)
  // }

  draw(length, newPositions, newColors) {
    const { gl, program } = this
    gl.useProgram(program)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.vertexAttribPointer(this.a_Position, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.a_Position)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer)
    gl.vertexAttribPointer(this.a_Normal, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.a_Normal)

    // gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer)
    // if (newColors) {
    //   gl.bufferData(
    //     gl.ARRAY_BUFFER,
    //     new Float32Array(newColors),
    //     gl.STATIC_DRAW
    //   )
    // }
    // gl.vertexAttribPointer(this.a_Color, 2, gl.FLOAT, false, 0, 0)
    // gl.enableVertexAttribArray(this.a_Color)

    const mvpMatrix = new Matrix4() // Model view projection matrix
    const modelMatrix = new Matrix4() // Model matrix
    const normalMatrix = new Matrix4() // Transformation matrix for normals

    for (let i = 0; i < newPositions.length; i += 2) {
      modelMatrix
        .setTranslate(newPositions[i] * 2 - 1, 0, newPositions[i + 1] * 2 - 1)
        .scale(
          this.entitySize / 1000,
          this.entitySize / 1000,
          this.entitySize / 1000
        )

      mvpMatrix
        .set(this.world.projMatrix)
        .multiply(this.world.viewMatrix)
        .multiply(modelMatrix)

      gl.uniformMatrix4fv(this.u_MvpMatrix, false, mvpMatrix.elements)

      normalMatrix.setInverseOf(modelMatrix)
      normalMatrix.transpose()
      // Pass the transformation matrix for normals to u_NormalMatrix
      gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements)

      gl.uniform4fv(
        this.u_Color,
        new Float32Array([newColors[i], newColors[i + 1], 0, 1])
      )

      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0)
    }
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
