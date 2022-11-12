import 'dotenv/config'
import { split } from 'lodash'
import { Options } from 'sequelize'

export const development = {
	url: process.env.POSTGRESQL_URL,
	options: <Options>{
		minifyAliases: true,
		logging: false,
		pool: {
			max: 496
		}
	}
}
const url = process.env.POSTGRESQL_URL || 'postgresql://postgres:root@localhost:5432/qrmenu'
const [baseDB, ...base] = split(url, '/').reverse()

export const testDatabaseName = baseDB
export const testDatabseWorkerName = `${baseDB}_${process.pid}`
export const test = {
	url: `${url}_${process.pid}`,
	options: <Options>{
		minifyAliases: true,
		logging: false,
		pool: {
			max: 4
		}
	}
}

export const testMainDB = {
	...test,
	baseUrl: base.reverse().join('/'),
	url
}

export const production = {
	url: process.env.POSTGRESQL_URL,
	options: <Options>{
		minifyAliases: true,
		logging: false,
		pool: {
			max: 4
		}
	}
}
