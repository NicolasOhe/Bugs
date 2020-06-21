import { Killer } from './killers'
import { Vehicle } from './vehicle'
import SpeciesContainer from './speciesContainer'

export class Bug extends Vehicle {
  constructor(world, team, x, y) {
    super(world, team, x, y, Bug.maxSpeed, Bug.energyLimit)
    this.task = Bug.activity.gather
  }

  alter() {
    this.energy = this.energy * 0.995 - 0.001
    return this
  }

  interact(species) {
    const [nearNeighboors, minTouchDistance] = species.getPotentialTouching(
      this
    )

    nearNeighboors.forEach((neighboor) => {
      if (this.getDistance(neighboor) < minTouchDistance) {
        if (neighboor.team !== this.team) {
          this.energy = this.energy * 0.98 - 0.01
        }
      }
    })
    return this
  }

  work() {
    if (this.task === Bug.activity.gather) {
      if (this.energy > 0.9) {
        this.task = Bug.activity.bringFood
      } else {
        this.findFood()
      }
    }
    if (this.task === Bug.activity.bringFood) {
      this.goHome()
    }
    return this
  }

  goHome() {
    const { Bases } = this.world.register
    if (this.getDistance(this.home) < 0.03) {
      this.task = Bug.activity.gather
      if (this.energy > Bug.energyTransfer) {
        Bases.register[this.team].getEnergy(Bug.energyTransfer)
        this.energy -= Bug.energyTransfer
      } else {
        Bases.register[this.team].getEnergy(this.energy / 2)
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

export default class Bugs extends SpeciesContainer {
  constructor(initialPopulation) {
    super(initialPopulation, Bug)
  }

  update() {
    const { Bugs, Killers } = this.world.register
    this.individuals.forEach((b) => b.move())
    this.individuals.forEach((b) =>
      b.alter().interact(Bugs).interact(Killers).eat().work()
    )
    this.individuals = this.individuals.filter((b) => b.energy > 0)
  }
}
