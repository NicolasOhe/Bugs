import WebGlElement from '../../../tools/webglelement'
import { generateQuadTree, Rectangle } from '../../../tools/qtree'
import { Killer } from './killers'
import { Base } from '../base'

export class Guard {
  constructor(team, x, y) {
    this.x = x != null ? x : Math.random()
    this.y = y != null ? y : Math.random()
    this.vX = Math.random() - 0.5
    this.vY = Math.random() - 0.5
    this.energy = Math.random() * 0.8 + 0.2
    this.team = team
    this.home = { x: 0.5, y: this.team === 0 ? 0.2 : 0.8 }
    this.task = Guard.activity.gather
  }

  move() {
    this.x += this.vX / Guard.maxSpeed
    this.y += this.vY / Guard.maxSpeed

    this.energy = this.energy - 0.001

    // Check out of borders
    if (this.x < 0) {
      this.vX *= -1
      this.x *= -1
    } else if (this.x > 1) {
      this.vX *= -1
      this.x = -this.x + 2
    }
    if (this.y < 0) {
      this.vY *= -1
      this.y *= -1
    } else if (this.y > 1) {
      this.vY *= -1
      this.y = -this.y + 2
    }
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
      this.goTowardsTarget()
    }
  }

  attack(qtreeKillers) {
    if (this.target && this.target.energy > 0) {
      this.goTowardsTarget()
    } else {
      this.target = null
      this.task = Guard.activity.patrol
    }
  }

  goTowardsTarget() {
    const [vectorX, vectorY] = this.normalize(
      this.target.x - this.x,
      this.target.y - this.y
    )

    const steering = {
      x: vectorX - this.vX,
      y: vectorY - this.vY,
    }

    this.vX += steering.x * 0.01
    this.vY += steering.y * 0.01

    const [vX, vY] = this.normalize(this.vX, this.vY, true)

    this.vX = vX
    this.vY = vY
  }

  findFood(ground) {
    const [xAttraction, yAttraction] = ground.inspectSurroundingFertility(this)
    this.vX += Math.min(1, xAttraction) / 20
    this.vY += Math.min(1, yAttraction) / 20

    const magnitude = this.vX ** 2 + this.vY ** 2
    if (magnitude > 1) {
      this.vX /= magnitude
      this.vY /= magnitude
    }
  }
  goHome(bases) {
    if (this.getDistance(this.home) < 0.03) {
      this.energy += bases.register[this.team].sendEnergy(Guard.energyTransfer)
      this.task = Guard.activity.patrol
      return
    }

    const [homeX, homeY] = this.normalize(
      this.home.x - this.x,
      this.home.y - this.y
    )

    const steering = {
      x: homeX - this.vX,
      y: homeY - this.vY,
    }

    this.vX += steering.x * 0.01
    this.vY += steering.y * 0.01

    const [vX, vY] = this.normalize(this.vX, this.vY, true)

    this.vX = vX
    this.vY = vY
  }

  normalize(x, y, preserveBelowOne = false) {
    const magnitude = x ** 2 + y ** 2
    if (preserveBelowOne && magnitude < 1) {
      return [x, y]
    }
    return [x / magnitude, y / magnitude]
  }

  getDistance(to) {
    return Math.sqrt((to.y - this.y) ** 2 + (to.x - this.x) ** 2)
  }
  getManhattanDistance(to) {
    return (to.y - this.y) ** 2 + (to.x - this.x) ** 2
  }
}

Guard.team = { red: 0, blue: 1 }
Guard.activity = { attack: 0, patrol: 1, goHome: 2 }
Guard.perceptionLimit = 0.1
Guard.energyTransfer = 5

export default class Guards extends WebGlElement {
  constructor(population, surface) {
    super()

    this.size = Math.floor(Guard.size * surface)
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

    const vertexShader = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    void main() {
        gl_Position = a_Position*2.-1.;
        gl_PointSize = ${this.size}.;
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

    let { gl } = this

    gl.useProgram(this.program)
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
    const positions = this.getPositions()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
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
