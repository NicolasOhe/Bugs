import WebGlElement from '../../../tools/webglelement'
import { Bug } from './bugs'
import { Guard } from './guards'
import { Ground } from '../ground'
import { generateQuadTree, Rectangle } from '../../../tools/qtree'
import SpeciesContainer from './speciesContainer'
import { Vehicle } from './vehicle'

export class Killer extends Vehicle {
  constructor(world, team, x, y) {
    super(world, team, x, y, Killer.maxSpeed, Killer.energyLimit)
    this.task = Killer.activity.gather
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
    if (this.energy > 2) {
      this.attack()
    } else {
      this.task = Killer.activity.gather
      this.findFood()
    }
    return this
  }

  attack() {
    const qtreeBugs = this.world.register.Bugs.qtree
    if (this.target && this.target.energy > 0) {
      this.goTowardsTarget(this.target)
    } else {
      const surfaceToSearch = new Rectangle(
        this.x,
        this.y,
        Killer.perceptionLimit,
        Killer.perceptionLimit
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

      if (target && dist < Killer.perceptionLimit) {
        this.target = target
        this.goTowardsTarget(target)
      }
    }
  }
}

Killer.team = { red: 0, blue: 1 }
Killer.activity = { gather: 0, bringFood: 1 }
Killer.energyTransfer = 0.5
Killer.energyLimit = 10
Killer.perceptionLimit = 2 * 0.1 //Killer.size

export default class Killers extends SpeciesContainer {
  constructor(initialPopulation) {
    super(initialPopulation, Killer)
  }

  update() {
    const { Guards, Killers } = this.world.register
    this.individuals.forEach((k) => k.move())
    this.individuals.forEach((k) =>
      k.alter().interact(Killers).interact(Guards).eat().work()
    )

    this.individuals = this.individuals.filter((k) => k.energy > 0)
  }
}
