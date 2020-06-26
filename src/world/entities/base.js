import WebGlElement from '../../tools/webglelement'
import { Bug } from './vehicles/bugs'

export class Base {
  constructor(world, team, x, y, energy) {
    this.x = x != null ? x : Math.random()
    this.y = y != null ? y : Math.random()
    this.world = world
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

  work() {
    const { Bugs, Killers, Guards } = this.world.register
    if (!this.saveForKiller && !this.saveForGuard) {
      if (this.energy > Base.energyBuffer) {
        Bugs.create(this.team, this.x, this.y)
        this.energy--
      }
    } else {
      if (this.saveForKiller && this.energy > 10) {
        Killers.create(this.team, this.x, this.y)
        this.energy -= 10
        this.saveForKiller = false
      }
      if (this.saveForGuard && this.energy > 40) {
        Guards.create(this.team, this.x, this.y)
        this.energy -= 40
        this.saveForGuard = false
      }
    }
    if (this.reserves > 10) {
      Killers.create(this.team, this.x, this.y)
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
    this.elements = []
    this.register = {}
    this.world = null
  }

  setup(gl, world) {
    this.world = world

    const blue = new Base(this.world, Bug.team.blue, 0.5, 0.8, 30)
    this.elements.push(blue)
    this.register[Bug.team.blue] = blue

    const red = new Base(this.world, Bug.team.red, 0.5, 0.2, 30)
    this.elements.push(red)
    this.register[Bug.team.red] = red

    window.addEventListener('click', () => {
      red.saveForKiller = true
    })

    const entitySize = Base.size * world.surface
    const positions = this.getBasesPositions()
    const colors = this.getBugsTeams()
    super.setup(world, entitySize, positions, colors)
  }

  getBasesPositions() {
    const positions = []
    this.elements.forEach((base) => {
      positions.push(base.x, base.y)
    })
    return positions
  }

  getBugsTeams() {
    const teams = []
    this.elements.forEach((base) => {
      teams.push(1, base.team)
    })
    return teams
  }

  draw() {
    //super.draw(this.elements.length)
  }

  update() {
    this.elements.forEach((b) => b.work())
  }
}
