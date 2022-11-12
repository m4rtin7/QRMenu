import { up as prod1Up } from './20200619000000-sysuser'

export const up = () => Promise.resolve()
export const down = () => Promise.resolve()

export default [
	prod1Up,
]
