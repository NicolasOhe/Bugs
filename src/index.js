import World from './world/world'
import Ground from './world/entities/ground'
import Bases from './world/entities/base'
import Bugs from './world/entities/vehicles/bugs'
import Killers from './world/entities/vehicles/killers'
import Guards from './world/entities/vehicles/guards'
import { Bug } from './world/entities/vehicles/bugs'
import { Killer } from './world/entities/vehicles/killers'
import { Guard } from './world/entities/vehicles/guards'
import { Base } from './world/entities/base'

const surface = 800
const itemsPerLine = 120
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

const ground = new Ground(itemsPerLine)
const bases = new Bases(surface)
const bugs = new Bugs(100, surface)
const killers = new Killers(2, surface)
const guards = new Guards(2, surface)

world.add(ground)
world.add(bugs)
world.add(killers)
world.add(guards)
world.add(bases)

world.animate()
