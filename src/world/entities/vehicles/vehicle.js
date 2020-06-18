import WebGlElement from '../../../tools/webglelement'
import { generateQuadTree, Rectangle } from '../../../tools/qtree'
import { Killer } from './killers'

export class Vehicle {
  constructor(team, x, y, maxSpeed, energyLimit) {
    this.x = x != null ? x : Math.random()
    this.y = y != null ? y : Math.random()
    this.vX = Math.random() - 0.5
    this.vY = Math.random() - 0.5
    this.engergyLimit = energyLimit
    this.energy = Math.random() * 0.8 * energyLimit + 0.2 * energyLimit
    this.team = team
    this.home = { x: 0.5, y: this.team === 0 ? 0.2 : 0.8 }
    this.maxSpeed = maxSpeed
  }

  move() {
    this.x += this.vX / this.maxSpeed
    this.y += this.vY / this.maxSpeed

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

  // interact(qtree, otherSize) {
  //   const minTouchDistance = Bug.size / 2 + otherSize / 2
  //   const surfaceToSearch = new Rectangle(
  //     this.x,
  //     this.y,
  //     minTouchDistance,
  //     minTouchDistance
  //   )
  //   const nearNeighboors = qtree
  //     .query(surfaceToSearch)
  //     .filter((n) => n !== this)

  //   nearNeighboors.forEach((neighboor) => {
  //     if (this.getDistance(neighboor) < minTouchDistance) {
  //       if (neighboor.team !== this.team) {
  //         this.energy = this.energy * 0.98 - 0.01
  //       }
  //     }
  //   })
  // }

  eat(ground) {
    const harvest = ground.collect(this)
    this.energy = Math.min(this.engergyLimit, this.energy + harvest)
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

  goHome() {
    this.goTowardsTarget(this.home)
  }

  goTowardsTarget(target) {
    const [vectorX, vectorY] = this.normalize(
      target.x - this.x,
      target.y - this.y
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

export default class Bugs extends WebGlElement {
  constructor(population, surface) {
    super()

    this.bugSize = Math.floor(Bug.size * surface)
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

    const vertexShader = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    void main() {
        gl_Position = a_Position*2.-1.;
        gl_PointSize = ${this.bugSize}.;
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

    let { gl } = this

    gl.useProgram(this.program)
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

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.getBugsPositions()),
      gl.STATIC_DRAW
    )
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
    this.bugs.forEach((b) => b.interact(qtreeBugs, Bug.size))
    this.bugs.forEach((b) => b.interact(qtreeKillers, Killer.size))
    this.bugs.forEach((b) => b.eat(ground))
    this.bugs.forEach((b) => b.work(ground, bases))
    this.bugs = this.bugs.filter((b) => b.energy > 0)
  }
}
