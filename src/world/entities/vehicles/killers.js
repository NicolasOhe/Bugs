import WebGlElement from '../../../tools/webglelement'
import { Bug } from './bugs'
import { Guard } from './guards'
import { Ground } from '../ground'
import { generateQuadTree, Rectangle } from '../../../tools/qtree'

export class Killer {
  constructor(team, x, y) {
    this.x = x != null ? x : Math.random()
    this.y = y != null ? y : Math.random()
    this.vX = Math.random() - 0.5
    this.vY = Math.random() - 0.5
    this.energy = Math.random() * 0.8 + 0.2
    this.team = team
    this.home = { x: 0.5, y: this.team === 0 ? 0.2 : 0.8 }
    this.task = Killer.activity.gather
  }

  move() {
    this.x += this.vX / Killer.maxSpeed
    this.y += this.vY / Killer.maxSpeed

    this.energy = this.energy * 0.995 - 0.001

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
    const minTouchDistance = Killer.size / 2 + otherSize / 2
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

  eat(ground) {
    const harvest = ground.collect(this)
    this.energy = Math.min(10, this.energy + harvest)
  }

  work(qtreeBugs, ground) {
    if (this.energy > 2) {
      this.attack(qtreeBugs)
    } else {
      this.task = Killer.activity.gather
      this.findFood(ground)
    }
  }

  attack(qtreeBugs) {
    if (this.target && this.target.energy > 0) {
      this.goTowardsTarget()
    } else {
      const surfaceToSearch = new Rectangle(
        this.x,
        this.y,
        Killer.size * 2,
        Killer.size * 2
      )
      const nearNeighboors = qtreeBugs
        .query(surfaceToSearch)
        .filter((b) => b.team !== this.team)
      //debugger
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

      //console.log(target, dist)
      if (target) {
        this.target = target
        this.goTowardsTarget()
      }
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
      this.task = Bug.activity.gather
      if (this.energy > Bug.energyTransfer) {
        bases.register[this.team].getEnergy(Bug.energyTransfer)
        this.energy -= Bug.energyTransfer
      } else {
        bases.register[this.team].getEnergy(this.energy)
        this.energy = 0
      }
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

Killer.team = { red: 0, blue: 1 }
Killer.activity = { gather: 0, bringFood: 1 }
Killer.energyTransfer = 0.5

export default class Killers extends WebGlElement {
  constructor(population, surface) {
    super()
    this.size = Math.floor(Killer.size * surface)
    this.program = null
    this.vertexBuffer = null
    this.vertexColorBuffer = null
    this.a_position = null
    this.a_Color = null
    this.gl = null
    this.killers = []
    this.colors = []
    this.world = null

    for (let i = 0; i < population; i += 2) {
      this.killers.push(new Killer(Killer.team.red))
      this.killers.push(new Killer(Killer.team.blue))
    }
    console.log('killers:', this.killers.length)
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
        gl_FragColor = vec4(1.-v_Color.g, 0.5, v_Color.g, 1.);
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
    this.killers.forEach((killer) => {
      positions.push(killer.x, killer.y)
    })
    return positions
  }

  getEnergy() {
    const energy = []
    this.killers.forEach((killer) => {
      energy.push(killer.energy)
    })
    return energy
  }
  getTeams() {
    const teams = []
    this.killers.forEach((killer) => {
      teams.push(killer.team)
    })
    return teams
  }

  draw() {
    if (this.killers.length === 0) {
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

    gl.drawArrays(gl.POINTS, 0, this.killers.length)
  }

  create(team, x, y) {
    this.killers.push(new Killer(team, x, y))
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
    return { qtree: generateQuadTree(this.killers, 0, 0, 1, 1) }
  }

  animate(sharedData) {
    const qtreeKillers = sharedData.Killers.qtree
    const qtreeBugs = sharedData.Bugs.qtree
    const qtreeGuards = sharedData.Guards.qtree
    const ground = this.world.register['Ground']
    const bases = this.world.register['Bases']
    this.killers.forEach((k) => k.move())
    this.killers.forEach((k) => k.interact(qtreeKillers, Killer.size))
    this.killers.forEach((k) => k.interact(qtreeGuards, Guard.size))
    this.killers.forEach((k) => k.eat(ground))
    this.killers.forEach((k) => k.work(qtreeBugs, ground))
    this.killers = this.killers.filter((k) => k.energy > 0)
  }
}
