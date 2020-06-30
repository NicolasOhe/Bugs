import World from './world/world'
import Ground from './world/entities/ground'
import Bases, { Base } from './world/entities/base'
import Bugs, { Bug } from './world/entities/vehicles/bugs'
import Killers, { Killer } from './world/entities/vehicles/killers'
import Guards, { Guard } from './world/entities/vehicles/guards'

const surface = 800
const itemsPerLine = 200
Bug.size = 1 / 50
Bug.maxSpeed = 700
Killer.size = 1 / 30
Killer.maxSpeed = 500
Guard.size = 1 / 20
Guard.maxSpeed = 440
Base.size = 1 / 10
Base.savingRate = 0.1
Base.energyBuffer = 5
Base.defenseArea = 0.3

const world = new World(surface, 'canvas')
window.world = world
const ground = new Ground(itemsPerLine)

const bases = new Bases()
const bugs = new Bugs(100)
const killers = new Killers(2)
const guards = new Guards(2)

world.add(ground, 'Ground')
world.add(bugs, 'Bugs')
world.add(killers, 'Killers')
world.add(guards, 'Guards')
world.add(bases, 'Bases')

world.animate()
