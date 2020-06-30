import Stats from '../tools/stats'
import { Matrix4 } from '../tools/cuon-matrix'
import { Bug } from './entities/vehicles/bugs'

export default class World {
  constructor(surface, selector) {
    this.surface = surface
    this.canvas = document.querySelector(selector)
    this.canvas.width = surface
    this.canvas.height = surface
    this.gl = this.canvas.getContext('webgl', { antialias: true })
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0)
    this.gl.enable(this.gl.BLEND)
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)
    this.gl.enable(this.gl.DEPTH_TEST)
    this.elements = []
    this.register = {}
    this.viewMatrix = new Matrix4().setLookAt(0, 5, 1, 0, 0, 0, 0, 1, 0)
    this.projMatrix = new Matrix4().setPerspective(
      30,
      this.canvas.width / this.canvas.height,
      2,
      100
    )
    this.stats = new Stats(60, '#stats')
  }

  add(element, name) {
    this.elements.push(element)
    this.register[name] = element
    element.setup(this.gl, this)
  }
  draw(time) {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
    this.viewMatrix = new Matrix4().setLookAt(
      3 * Math.cos(time / 40000),
      3,
      3 * Math.sin(time / 40000),
      0,
      0,
      0,
      0,
      1,
      0
    )
    this.elements.forEach((element) => {
      element.draw()
    })
  }

  update() {
    this.elements.forEach((element) => {
      if (element.prepareUpdate) {
        element.prepareUpdate()
      }
    })

    this.elements.forEach((element) => {
      element.update()
    })
  }

  animate(time) {
    requestAnimationFrame(this.animate.bind(this))
    this.generateStats(time)
    this.update()
    this.draw(time)
  }

  generateStats(time) {
    this.stats.tick(time)

    const total = this.register.Bugs.individuals.length
    this.stats.add('bugs', total)
    const reds = this.register.Bugs.individuals.filter(
      (b) => b.team === Bug.team.red
    ).length
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

    this.stats.add(
      'Average energy killers',
      this.register.Killers.individuals.reduce((acc, cur) => {
        acc += cur.energy
        return acc
      }, 0) / this.register.Killers.individuals.length
    )
  }
}
