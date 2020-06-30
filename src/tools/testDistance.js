const { performance } = require('perf_hooks')

const population = 50000

const Bug = {
  x: Math.random(),
  y: Math.random(),
  getDistance(to) {
    return Math.sqrt((to.y - this.y) ** 2 + (to.x - this.x) ** 2)
  },
  getManhattanDistance(to) {
    return (to.y - this.y) ** 2 + (to.x - this.x) ** 2
  },
}

const container = []

for (let i = 0; i < population; i++) {
  container.push(Object.create(Bug))
}

const start = performance.now()
container.forEach((bug0) => {
  container.forEach((bug1) => {
    bug0.getDistance(bug1)
  })
})

const end = performance.now()
console.log(end - start)
