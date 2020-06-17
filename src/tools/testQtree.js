const qtr = require('./qtree.js')

const population = 10000
const perceptionDistance = 0.1

console.log('qtr', qtr)

const bugs = []
for (let i = 0; i < population; i++) {
  bugs.push({ x: Math.random(), y: Math.random() })
}

const tree = qtr.generateQuadTree(bugs, 0, 0, 1, 1)
let anomalies = 0

bugs.forEach((bug) => {
  const surfaceToSearch = new qtr.Rectangle(
    bug.x,
    bug.y,
    perceptionDistance,
    perceptionDistance
  )
  const nearNeighboorsApprox = tree
    .query(surfaceToSearch)
    .filter((neighboor) => neighboor !== bug)

  let nearNeighboors = []
  nearNeighboorsApprox.forEach((n) => {
    const d = getDistance(bug, n)
    if (d < perceptionDistance) {
      nearNeighboors.push(n)
    }
  })

  let nearNeighboors2 = []
  bugs.forEach((bug2) => {
    const d = getDistance(bug, bug2)
    if (d < perceptionDistance) {
      nearNeighboors2.push(bug2)
    }
  })
  nearNeighboors2 = nearNeighboors2.filter((neighboor) => neighboor !== bug)

  if (nearNeighboors2.length !== nearNeighboors.length) {
    anomalies++
  }
})

console.log('anomalies:', anomalies)

function getDistance(from, to) {
  return Math.sqrt((to.y - from.y) ** 2 + (to.x - from.x) ** 2)
}
