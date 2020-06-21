import WebGlElement from '../../../tools/webglelement'
import { generateQuadTree, Rectangle } from '../../../tools/qtree'

export default class SpeciesContainer extends WebGlElement {
  constructor(initialPopulation, entityType) {
    super()

    this.individuals = []
    this.world = null

    this.initialPopulation = initialPopulation
    this.entityType = entityType
  }

  setup(gl, world) {
    this.world = world

    for (let i = 0; i < this.initialPopulation; i += 2) {
      this.individuals.push(
        new this.entityType(this.world, this.entityType.team.red)
      )
      this.individuals.push(
        new this.entityType(this.world, this.entityType.team.blue)
      )
    }

    const entitySize = Math.floor(this.entityType.size * world.surface)
    super.setup(gl, entitySize)
  }

  getPotentialTouching(other) {
    const minTouchDistance =
      this.entityType.size / 2 + other.constructor.size / 2
    const surfaceToSearch = new Rectangle(
      other.x,
      other.y,
      minTouchDistance,
      minTouchDistance
    )
    const nearNeighboors = this.qtree.query(surfaceToSearch)

    return [nearNeighboors, minTouchDistance]
  }

  getPositions() {
    const positions = []
    this.individuals.forEach((i) => {
      positions.push(i.x, i.y)
    })
    return positions
  }

  getEnergy() {
    const energy = []
    this.individuals.forEach((i) => {
      energy.push(i.energy)
    })
    return energy
  }

  getTeams() {
    const teams = []
    this.individuals.forEach((i) => {
      teams.push(i.team)
    })
    return teams
  }

  draw() {
    const newPositions = this.getPositions()
    const energy = this.getEnergy()
    const teams = this.getTeams()
    const newEnergyAndTeamColors = energy.reduce((acc, energy, index) => {
      acc.push(energy, teams[index])
      return acc
    }, [])
    super.draw(this.individuals.length, newPositions, newEnergyAndTeamColors)
  }

  create(team, x, y) {
    this.individuals.push(new this.entityType(this.world, team, x, y))
  }

  prepareUpdate() {
    this.qtree = generateQuadTree(this.individuals, 0, 0, 1, 1)
  }
}
