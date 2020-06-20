import WebGlElement from '../../../tools/webglelement'
import { generateQuadTree, Rectangle } from '../../../tools/qtree'
import { Killer } from './killers'

export class Vehicle {
  constructor(world, team, x, y, maxSpeed, energyLimit) {
    this.x = x != null ? x : Math.random()
    this.y = y != null ? y : Math.random()
    this.vX = Math.random() - 0.5
    this.vY = Math.random() - 0.5
    this.engergyLimit = energyLimit
    this.energy = Math.random() * 0.8 * energyLimit + 0.2 * energyLimit
    this.team = team
    this.home = { x: 0.5, y: this.team === 0 ? 0.2 : 0.8 }
    this.maxSpeed = maxSpeed
    this.world = world
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

  eat() {
    const ground = this.world.register.Ground
    const harvest = ground.collect(this)
    this.energy = Math.min(this.engergyLimit, this.energy + harvest)
  }

  findFood() {
    const ground = this.world.register.Ground
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
