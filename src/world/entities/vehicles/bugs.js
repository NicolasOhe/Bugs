import WebGlElement from '../../../tools/webglelement'
import { generateQuadTree, Rectangle } from '../../../tools/qtree'
import { Killer } from './killers'
import { Vehicle } from './vehicle'

export class Bug extends Vehicle {
  constructor(team, x, y) {
    super(team, x, y, Bug.maxSpeed, Bug.energyLimit)
    this.task = Bug.activity.gather
  }

  alter() {
    this.energy = this.energy * 0.995 - 0.001
  }

  interact(qtree, otherSize) {
    const minTouchDistance = Bug.size / 2 + otherSize / 2
    const surfaceToSearch = new Rectangle(
      this.x,
      this.y,
      minTouchDistance,
      minTouchDistance
    )
    const nearNeighboors = qtree
      .query(surfaceToSearch)
      .filter((n) => n !== this)

    nearNeighboors.forEach((neighboor) => {
      if (this.getDistance(neighboor) < minTouchDistance) {
        if (neighboor.team !== this.team) {
          this.energy = this.energy * 0.98 - 0.01
        }
      }
    })
  }

  work(ground, bases) {
    if (this.task === Bug.activity.gather) {
      if (this.energy > 0.9) {
        this.task = Bug.activity.bringFood
      } else {
        this.findFood(ground)
      }
    }
    if (this.task === Bug.activity.bringFood) {
      this.goHome(bases)
    }
  }

  goHome(bases) {
    if (this.getDistance(this.home) < 0.03) {
      this.task = Bug.activity.gather
      if (this.energy > Bug.energyTransfer) {
        bases.register[this.team].getEnergy(Bug.energyTransfer)
        this.energy -= Bug.energyTransfer
      } else {
        bases.register[this.team].getEnergy(this.energy / 2)
        this.energy /= 2
      }
      return
    }

    super.goHome()
  }
}

Bug.team = { red: 0, blue: 1 }
Bug.activity = { gather: 0, bringFood: 1 }
Bug.energyTransfer = 0.5
Bug.energyLimit = 1

export default class Bugs extends WebGlElement {
  constructor(population) {
    super()
    this.program = null
    this.vertexBuffer = null
    this.vertexColorBuffer = null
    this.a_position = null
    this.a_Color = null
    this.gl = null
    this.bugs = []
    this.colors = []
    this.world = null

    for (let i = 0; i < population; i += 2) {
      this.bugs.push(new Bug(Bug.team.red))
      this.bugs.push(new Bug(Bug.team.blue))
    }
    console.log(this.bugs.length)
  }

  setup(gl, world) {
    this.gl = gl
    this.world = world

    const bugSize = Math.floor(Bug.size * world.surface)

    const vertexShader = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    void main() {
        gl_Position = a_Position*2.-1.;
        gl_PointSize = ${bugSize}.;
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
      new Float32Array(this.getBugsPositions()),
      gl.STATIC_DRAW
    )
    this.a_Position = gl.getAttribLocation(this.program, 'a_Position')

    // setup color buffer
    this.vertexColorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.getBugsEnergy()),
      gl.STATIC_DRAW
    )
    this.a_Color = gl.getAttribLocation(this.program, 'a_Color')
  }

  getBugsPositions() {
    const positions = []
    this.bugs.forEach((bug) => {
      positions.push(bug.x, bug.y)
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
    const bugsTeams = []
    this.bugs.forEach((bug) => {
      bugsTeams.push(bug.team)
    })
    return bugsTeams
  }

  draw() {
    const { gl, program } = this
    gl.useProgram(program)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.getBugsPositions()),
      gl.STATIC_DRAW
    )
    gl.vertexAttribPointer(this.a_Position, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.a_Position)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer)
    const energy = this.getBugsEnergy()
    const teams = this.getBugsTeams()
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

    gl.drawArrays(gl.POINTS, 0, this.bugs.length)
  }

  createBug(team, x, y) {
    this.bugs.push(new Bug(team, x, y))
  }

  update(sharedData) {
    this.animate(sharedData)
  }

  share() {
    return { qtree: generateQuadTree(this.bugs, 0, 0, 1, 1) }
  }

  animate(sharedData) {
    const qtreeBugs = sharedData.Bugs.qtree
    const qtreeKillers = sharedData.Killers.qtree
    const ground = this.world.register['Ground']
    const bases = this.world.register['Bases']
    this.bugs.forEach((b) => b.move())
    this.bugs.forEach((b) => b.alter())
    this.bugs.forEach((b) => b.interact(qtreeBugs, Bug.size))
    this.bugs.forEach((b) => b.interact(qtreeKillers, Killer.size))
    this.bugs.forEach((b) => b.eat(ground))
    this.bugs.forEach((b) => b.work(ground, bases))
    this.bugs = this.bugs.filter((b) => b.energy > 0)
  }
}
