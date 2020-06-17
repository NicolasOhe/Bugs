import Stats from '../tools/stats'
import { Bug } from './entities/vehicles/bugs'

export default class World {
  constructor(surface, selector) {
    this.surface = surface
    this.canvas = document.querySelector(selector)
    this.canvas.width = surface
    this.canvas.height = surface
    this.gl = this.canvas.getContext('webgl', { antialias: false })
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0)
    this.gl.enable(this.gl.BLEND)
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)
    this.elements = []
    this.register = {}
    this.stats = new Stats(60, '#stats')
  }
  add(element) {
    this.elements.push(element)
    this.register[element.constructor.name] = element
    element.setup(this.gl, this)
  }

  draw() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    this.elements.forEach((element) => {
      element.draw()
    })
  }

  update() {
    const temporarySharedData = {}
    this.elements.forEach((element) => {
      if (element.share) {
        temporarySharedData[element.constructor.name] = element.share()
      }
    })

    this.elements.forEach((element) => {
      element.update(temporarySharedData)
    })
  }

  animate(time) {
    requestAnimationFrame(this.animate.bind(this))
    this.generateStats(time)
    this.update()
    this.draw()
  }

  generateStats(time) {
    this.stats.tick(time)
    const total = this.register.Bugs.bugs.length
    this.stats.add('bugs', total)
    const reds = this.register.Bugs.bugs.filter((b) => b.team === Bug.team.red)
      .length
    this.stats.add('Reds', reds)
    this.stats.add('Blues', total - reds)
    this.stats.add(
      'Stock reds',
      this.register.Bases.register[Bug.team.red].energy
    )
    this.stats.add(
      'Stock blues',
      this.register.Bases.register[Bug.team.blue].energy
    )
    // debugger
    this.stats.add(
      'Average energy killers',
      this.register.Killers.killers.reduce((acc, cur) => {
        acc += cur.energy
        return acc
      }, 0) / this.register.Killers.killers.length
    )
  }
}
