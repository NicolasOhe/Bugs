import WebGlElement from '../../tools/webglelement'
import { Bug } from './vehicles/bugs'

export class Base {
  constructor(team, x, y, energy) {
    this.x = x != null ? x : Math.random()
    this.y = y != null ? y : Math.random()

    this.energy = energy || 0
    this.reserves = 0
    this.team = team
    this.saveForKiller = false
    this.saveForGuard = false
  }

  getEnergy(energy) {
    this.energy += energy * (1 - Base.savingRate)
    this.reserves += energy * Base.savingRate
  }

  sendEnergy(amount) {
    let energy = 0
    if (this.energy > amount) {
      energy = amount
      this.energy -= amount
    } else {
      energy = this.energy
      this.energy = 0
    }
    return energy
  }

  work(bugs, killers, guards) {
    if (!this.saveForKiller && !this.saveForGuard) {
      if (this.energy > Base.energyBuffer) {
        bugs.createBug(this.team, this.x, this.y)
        this.energy--
      }
    } else {
      if (this.saveForKiller && this.energy > 10) {
        killers.create(this.team, this.x, this.y)
        this.energy -= 10
        this.saveForKiller = false
      }
      if (this.saveForGuard && this.energy > 40) {
        guards.create(this.team, this.x, this.y)
        this.energy -= 40
        this.saveForGuard = false
      }
    }
    if (this.reserves > 10) {
      killers.create(this.team, this.x, this.y)
      this.reserves -= 10
    }
  }

  getDistance(to) {
    return Math.sqrt((to.y - this.y) ** 2 + (to.x - this.x) ** 2)
  }
  getManhattanDistance(to) {
    return (to.y - this.y) ** 2 + (to.x - this.x) ** 2
  }
}

export default class Bases extends WebGlElement {
  constructor() {
    super()
    this.program = null
    this.vertexBuffer = null
    this.vertexColorBuffer = null
    this.a_position = null
    this.a_Color = null
    this.gl = null
    this.bases = []
    this.register = {}
    this.colors = []
    this.world = null

    const blue = new Base(Bug.team.blue, 0.5, 0.8, 30)
    this.bases.push(blue)
    this.register[Bug.team.blue] = blue

    const red = new Base(Bug.team.red, 0.5, 0.2, 30)
    this.bases.push(red)
    this.register[Bug.team.red] = red
    window.addEventListener('click', () => {
      red.saveForKiller = true
    })
  }

  setup(gl, world) {
    this.gl = gl
    this.world = world

    const vertexShader = `
    attribute vec4 a_Position;
     attribute vec4 a_Color;
     varying vec4 v_Color;
    void main() {
        gl_Position = a_Position*2.-1.;
        gl_PointSize = ${Bases.size}.;
        v_Color = a_Color;
    }
    `

    const fragmentShader = `
    precision mediump float;
    varying vec4 v_Color;
    
    void main() {
      float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
      if (dist < 0.5 ) {
        //float intensity = smoothstep(0.6,0.8,1.-dist);
        vec4 color = vec4(1.-v_Color.r, 0., v_Color.r, 1.);
        gl_FragColor = color;
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
      new Float32Array(this.getBasesPositions()),
      gl.STATIC_DRAW
    )
    this.a_Position = gl.getAttribLocation(this.program, 'a_Position')

    // setup color buffer
    this.vertexColorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.getBugsTeams()),
      gl.STATIC_DRAW
    )
    this.a_Color = gl.getAttribLocation(this.program, 'a_Color')
  }

  getBasesPositions() {
    const positions = []
    this.bases.forEach((base) => {
      positions.push(base.x, base.y)
    })
    return positions
  }

  getBugsEnergy() {
    const bugsEnergy = []
    this.bugs.forEach((bug) => {
      bugsEnergy.push(bug.energy)
    })
    return bugsEnergy
  }

  getBugsTeams() {
    const teams = []
    this.bases.forEach((base) => {
      teams.push(base.team)
    })
    return teams
  }

  draw() {
    const { gl, program } = this
    gl.useProgram(program)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.vertexAttribPointer(this.a_Position, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.a_Position)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer)
    gl.vertexAttribPointer(this.a_Color, 1, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.a_Color)

    gl.drawArrays(gl.POINTS, 0, this.bases.length)
  }

  update() {
    this.animate()
  }

  animate() {
    const bugs = this.world.register['Bugs']
    const killers = this.world.register['Killers']
    const guards = this.world.register['Guards']
    this.bases.forEach((b) => b.work(bugs, killers, guards))
  }
}
