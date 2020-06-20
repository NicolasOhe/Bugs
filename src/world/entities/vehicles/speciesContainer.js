import WebGlElement from '../../../tools/webglelement'
import { generateQuadTree, Rectangle } from '../../../tools/qtree'

export default class SpeciesContainer extends WebGlElement {
  constructor(initialPopulation, entityType) {
    super()
    this.program = null
    this.vertexBuffer = null
    this.vertexColorBuffer = null
    this.a_position = null
    this.a_Color = null
    this.gl = null
    this.individuals = []
    this.colors = []
    this.world = null
    this.qtree = null
    this.initialPopulation = initialPopulation
    this.entityType = entityType
  }

  setup(gl, world) {
    this.gl = gl
    this.world = world

    for (let i = 0; i < this.initialPopulation; i += 2) {
      this.individuals.push(
        new this.entityType(this.world, this.entityType.team.red)
      )
      this.individuals.push(
        new this.entityType(this.world, this.entityType.team.blue)
      )
    }

    const entitySize = Math.floor(this.entityType.size * world.surface)

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
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.getPositions()),
      gl.STATIC_DRAW
    )
    this.a_Position = gl.getAttribLocation(this.program, 'a_Position')

    // setup color buffer
    this.vertexColorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.getEnergy()),
      gl.STATIC_DRAW
    )
    this.a_Color = gl.getAttribLocation(this.program, 'a_Color')
  }

  getPotentialTouching(other) {
    const minTouchDistance =
      this.entityType.size / 2 + other.constructor.size / 2
    const surfaceToSearch = new Rectangle(
      other.x,
      other.y,
      minTouchDistance,
      minTouchDistance
    )
    const nearNeighboors = this.qtree.query(surfaceToSearch)

    return [nearNeighboors, minTouchDistance]
  }

  getPositions() {
    const positions = []
    this.individuals.forEach((i) => {
      positions.push(i.x, i.y)
    })
    return positions
  }

  getEnergy() {
    const energy = []
    this.individuals.forEach((i) => {
      energy.push(i.energy)
    })
    return energy
  }
  getTeams() {
    const teams = []
    this.individuals.forEach((i) => {
      teams.push(i.team)
    })
    return teams
  }

  draw() {
    const { gl, program } = this
    gl.useProgram(program)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.getPositions()),
      gl.STATIC_DRAW
    )
    gl.vertexAttribPointer(this.a_Position, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.a_Position)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer)
    const energy = this.getEnergy()
    const teams = this.getTeams()
    const energyAndTeamColors = energy.reduce((acc, energy, index) => {
      acc.push(energy, teams[index])
      return acc
    }, [])

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(energyAndTeamColors),
      gl.STATIC_DRAW
    )
    gl.vertexAttribPointer(this.a_Color, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.a_Color)

    gl.drawArrays(gl.POINTS, 0, this.individuals.length)
  }

  create(team, x, y) {
    this.individuals.push(new this.entityType(this.world, team, x, y))
  }

  prepareUpdate() {
    this.qtree = generateQuadTree(this.individuals, 0, 0, 1, 1)
  }
}
