export function generateQuadTree(bugs, minX, minY, maxX, maxY) {
  const boundary = Qtree.getBoundary(minX, minY, maxX, maxY)

  const qt = new Qtree(boundary)
  for (let bug of bugs) {
    qt.insert(bug)
  }

  return qt
}

export class Qtree {
  static getBoundary(minX, minY, maxX, maxY) {
    const halfWidth = (maxX - minX) / 2
    const halfHeight = (maxY - minY) / 2
    const centerX = maxX - halfWidth
    const centerY = maxY - halfHeight

    const [x, y, w, h] = [centerX, centerY, halfWidth, halfHeight]

    return new Rectangle(x, y, w, h)
  }

  static getQuerySurface(x, y, w, h) {
    return new Rectangle(x, y, w / 2, h / 2)
  }

  constructor(boundary) {
    this.boundary = boundary
    this.bucket = []
    this.regions = {}
    this.divided = false
    this.gathered = []
  }

  insert(bug) {
    if (!this.boundary.contains(bug)) {
      return false
    }
    if (!this.divided) {
      if (this.bucket.length < Qtree.capacity) {
        this.bucket.push(bug)
        return true
      }
      this.subdivide()
      this.transferBucket()
    }

    this.passToChild(bug)
  }

  passToChild(bug) {
    if (bug.x > this.boundary.x) {
      if (bug.y > this.boundary.y) {
        return this.regions.se.insert(bug)
      } else {
        return this.regions.ne.insert(bug)
      }
    } else {
      if (bug.y > this.boundary.y) {
        return this.regions.sw.insert(bug)
      } else {
        return this.regions.nw.insert(bug)
      }
    }
  }

  subdivide() {
    const { x, y } = this.boundary
    const [hW, hH] = [this.boundary.w / 2, this.boundary.h / 2]
    const nwSpace = new Rectangle(x - hW, y - hH, hW, hH)
    const neSpace = new Rectangle(x + hW, y - hH, hW, hH)
    const swSpace = new Rectangle(x - hW, y + hH, hW, hH)
    const seSpace = new Rectangle(x + hW, y + hH, hW, hH)

    this.regions.nw = new Qtree(nwSpace, Qtree.capacity)
    this.regions.ne = new Qtree(neSpace, Qtree.capacity)
    this.regions.sw = new Qtree(swSpace, Qtree.capacity)
    this.regions.se = new Qtree(seSpace, Qtree.capacity)

    this.divided = true
  }

  transferBucket() {
    this.bucket.forEach((bug) => {
      this.passToChild(bug)
    })
    this.bucket = null
  }

  query(rect) {
    if (!this.boundary.intersects(rect)) {
      return []
    }

    if (rect.encompasses(this.boundary)) {
      return this.gather(rect)
    }

    if (this.divided) {
      return [
        ...this.regions.nw.query(rect),
        ...this.regions.ne.query(rect),
        ...this.regions.sw.query(rect),
        ...this.regions.se.query(rect),
      ]
    } else {
      return this.bucket
    }
  }

  gather(rect) {
    if (this.divided) {
      return [
        ...this.regions.nw.gather(rect),
        ...this.regions.ne.gather(rect),
        ...this.regions.sw.gather(rect),
        ...this.regions.se.gather(rect),
      ]
    } else {
      return this.bucket
    }
  }
}

export class Rectangle {
  constructor(x, y, w, h) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }

  contains(point) {
    const r = this
    return (
      point.x > r.x - r.w &&
      point.x < r.x + r.w &&
      point.y > r.y - r.h &&
      point.y < r.y + r.h
    )
  }

  intersects(rect) {
    const r = this
    return !(
      rect.x - rect.w > r.x + r.w ||
      rect.x + rect.w < r.x - r.w ||
      rect.y - rect.h > r.y + r.h ||
      rect.y + rect.h < r.y - r.h
    )
  }

  encompasses(rect) {
    const r = this
    return (
      rect.x - rect.w >= r.x - r.w &&
      rect.x + rect.w <= r.x + r.w &&
      rect.y - rect.h >= r.y - r.h &&
      rect.y + rect.h <= r.y + r.h
    )
  }
}

Qtree.capacity = 4
