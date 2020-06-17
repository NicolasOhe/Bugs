export default class Stats {
  constructor(range, selector) {
    this.total = 0
    this.elements = []
    this.register = {}
    if (range == null) throw new Error('The stats class needs a range!')
    this.range = range
    this.last = 0
    this.count = 0
    this.domElement = this.linkToDOM(selector)
  }

  linkToDOM(selector) {
    let el = document.querySelector(selector)
    if (!el) {
      console.warn(
        'Stats: no selector was provided. A <p> element was added to the end of <body>'
      )
      el = document.createElement('p')
      document.querySelector('body').appendChild(el)
    }
    return el
  }

  tick(time) {
    if (typeof time !== 'number') return 0
    this.count++
    const change = time - this.last
    this.elements.push(change)

    this.total += change
    this.last = time

    if (this.count > this.range) {
      this.total -= this.elements.shift()
    }

    if (this.count % this.range === 0) {
      this.updateDom()
    }

    return change
  }

  add(name, value) {
    if (typeof value !== 'number') return

    if (!this.register[name]) {
      this.register[name] = { elements: [], last: 0, count: 0, total: 0 }
    }
    const loc = this.register[name]

    loc.elements.push(value)
    loc.total += value
    loc.count++

    if (loc.count > this.range) {
      loc.total -= loc.elements.shift()
      loc.count--
    }
  }

  updateDom() {
    const average = Math.round(1000 / (this.total / this.range))
    let message = `${average} fps`

    for (let prop of Object.keys(this.register)) {
      const loc = this.register[prop]
      const average = Math.round(loc.total / loc.count)
      message = message + `; ${prop}: ${average}`
    }

    this.domElement.innerHTML = message
  }
}
