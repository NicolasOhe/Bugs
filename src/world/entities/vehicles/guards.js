import WebGlElement from '../../../tools/webglelement'
import { generateQuadTree, Rectangle } from '../../../tools/qtree'
import { Killer } from './killers'
import { Base } from '../base'
import { Vehicle } from './vehicle'

export class Guard extends Vehicle {
  constructor(team, x, y) {
    super(team, x, y, Guard.maxSpeed, Guard.energyLimit)
    this.task = Guard.activity.gather
  }

  alter() {
    this.energy = this.energy - 0.001
  }

  interact(qtree, otherSize) {
    const minTouchDistance = Guard.size / 2 + otherSize / 2
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
          if (neighboor.constructor.name === 'Killer') {
            this.energy = this.energy * 0.99 - 0.008
          } else {
            this.energy = this.energy * 0.98 - 0.01
          }
        }
      }
    })
  }

  work(qtreeKillers, bases) {
    if (this.energy > 2) {
      if (this.task === Guard.activity.attack) {
        this.attack(qtreeKillers)
      } else {
        this.patrol(qtreeKillers)
      }
    } else {
      this.task = Guard.activity.goHome
      this.goHome(bases)
    }
  }

  patrol(qtreeKillers) {
    const surfaceToSearch = new Rectangle(
      this.home.x,
      this.home.y,
      Base.defenseArea,
      Base.defenseArea
    )

    const nearNeighboors = qtreeKillers
      .query(surfaceToSearch)
      .filter((k) => k.team !== this.team)
      .filter((k) => k.getDistance(this.home) < Base.defenseArea)

    const [target, dist] = nearNeighboors.reduce(
      (nearest, cur) => {
        const dist = this.getDistance(cur)
        if (dist < nearest[1]) {
          nearest = [cur, dist]
        }
        return nearest
      },
      [null, Infinity]
    )

    if (target) {
      this.target = target
      this.task = Guard.activity.attack
      this.goTowardsTarget(this.target)
    }
  }

  attack(qtreeKillers) {
    if (this.target && this.target.energy > 0) {
      this.goTowardsTarget(this.target)
    } else {
      this.target = null
      this.task = Guard.activity.patrol
    }
  }

  goHome(bases) {
    if (this.getDistance(this.home) < 0.03) {
      this.energy += bases.register[this.team].sendEnergy(Guard.energyTransfer)
      this.task = Guard.activity.patrol
      return
    }
    super.goHome()
  }
}

Guard.team = { red: 0, blue: 1 }
Guard.activity = { attack: 0, patrol: 1, goHome: 2 }
Guard.perceptionLimit = 0.1
Guard.energyTransfer = 5
Guard.energyLimit = 10

export default class Guards extends WebGlElement {
  constructor(population) {
    super()

    this.program = null
    this.vertexBuffer = null
    this.vertexColorBuffer = null
    this.a_position = null
    this.a_Color = null
    this.gl = null
    this.guards = []
    this.colors = []
    this.world = null

    for (let i = 0; i < population; i += 2) {
      this.guards.push(new Guard(Guard.team.red, 0.5, 0.2))
      this.guards.push(new Guard(Guard.team.blue, 0.5, 0.8))
    }
    console.log('guards:', this.guards.length)
  }

  setup(gl, world) {
    this.gl = gl
    this.world = world
    const size = Math.floor(Guard.size * world.surface)
    const vertexShader = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    void main() {
        gl_Position = a_Position*2.-1.;
        gl_PointSize = ${size}.;
        v_Color = a_Color;
    }
    `

    const fragmentShader = `
    precision mediump float;
    varying vec4 v_Color;
    
    void main() {
      float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
      if (dist < 0.5 && dist>0.45-v_Color.r/2.) {
        gl_FragColor = vec4(1.-v_Color.g, 0.4, v_Color.g, 1.);
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

  getPositions() {
    const positions = []
    this.guards.forEach((guard) => {
      positions.push(guard.x, guard.y)
    })
    return positions
  }

  getEnergy() {
    const energy = []
    this.guards.forEach((guard) => {
      energy.push(guard.energy)
    })
    return energy
  }
  getTeams() {
    const teams = []
    this.guards.forEach((guard) => {
      teams.push(guard.team)
    })
    return teams
  }

  draw() {
    if (this.guards.length === 0) {
      return
    }
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

    gl.drawArrays(gl.POINTS, 0, this.guards.length)
  }

  create(team, x, y) {
    this.guards.push(new Guard(team, x, y))
  }

  update(sharedData) {
    this.animate(sharedData)
  }

  share() {
    return { qtree: generateQuadTree(this.guards, 0, 0, 1, 1) }
  }

  animate(sharedData) {
    const qtreeGuards = sharedData.Guards.qtree
    const qtreeKillers = sharedData.Killers.qtree
    const ground = this.world.register['Ground']
    const bases = this.world.register['Bases']
    this.guards.forEach((k) => k.move())
    this.guards.forEach((k) => k.alter())
    this.guards.forEach((k) => k.interact(qtreeGuards, Guard.size))
    this.guards.forEach((k) => k.interact(qtreeKillers, Killer.size))
    //this.guards.forEach((k) => k.eat(ground))
    this.guards.forEach((k) => k.work(qtreeKillers, bases))
    this.guards = this.guards.filter((k) => k.energy > 0)

    if (!this.guards.some((g) => g.team === Guard.team.red)) {
      bases.bases.find((b) => b.team === Guard.team.red).saveForGuard = true
    }
    if (!this.guards.some((g) => g.team === Guard.team.blue)) {
      bases.bases.find((b) => b.team === Guard.team.blue).saveForGuard = true
    }
  }
}
