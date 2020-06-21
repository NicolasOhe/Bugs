import WebGlElement from '../../../tools/webglelement'
import { generateQuadTree, Rectangle } from '../../../tools/qtree'
import { Killer } from './killers'
import { Base } from '../base'
import { Vehicle } from './vehicle'
import SpeciesContainer from './speciesContainer'

export class Guard extends Vehicle {
  constructor(world, team, x, y) {
    super(world, team, x, y, Guard.maxSpeed, Guard.energyLimit)
    this.task = Guard.activity.gather
  }

  alter() {
    this.energy = this.energy - 0.001
    return this
  }

  interact(species) {
    const [nearNeighboors, minTouchDistance] = species.getPotentialTouching(
      this
    )

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
    return this
  }

  work() {
    if (this.energy > 2) {
      if (this.task === Guard.activity.attack) {
        this.attack()
      } else {
        this.patrol()
      }
    } else {
      this.task = Guard.activity.goHome
      this.goHome()
    }
    return this
  }

  patrol() {
    const qtreeKillers = this.world.register.Killers.qtree
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

  attack() {
    if (this.target && this.target.energy > 0) {
      this.goTowardsTarget(this.target)
    } else {
      this.target = null
      this.task = Guard.activity.patrol
    }
  }

  goHome() {
    const Bases = this.world.register.Bases
    if (this.getDistance(this.home) < 0.03) {
      this.energy += Bases.register[this.team].sendEnergy(Guard.energyTransfer)
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

export default class Guards extends SpeciesContainer {
  constructor(initialPopulation) {
    super(initialPopulation, Guard)
  }

  update() {
    const { Guards, Killers, Bases } = this.world.register

    this.individuals.forEach((k) => k.move())
    this.individuals.forEach((k) => {
      k.alter().interact(Guards).interact(Killers).work()
    })

    this.individuals = this.individuals.filter((k) => k.energy > 0)

    if (!this.individuals.some((g) => g.team === Guard.team.red)) {
      Bases.elements.find((b) => b.team === Guard.team.red).saveForGuard = true
    }
    if (!this.individuals.some((g) => g.team === Guard.team.blue)) {
      Bases.elements.find((b) => b.team === Guard.team.blue).saveForGuard = true
    }
  }
}
