import { up as usersUp } from './01-users'
import { up as rolesUp } from './02-roles'
import { up as menuItemsUp } from './02-roles'

export const up = () => Promise.resolve()
export const down = () => Promise.resolve()

export default [usersUp, rolesUp, menuItemsUp]
