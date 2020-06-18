export default class Team {
  constructor(name) {
    this.name = name
    this.members = {}
  }

  register(name, entity) {
    if (this.members[name]) {
      throw new Error(`${name} was already registered`)
    }
    this.members[name] = entity
  }
}
