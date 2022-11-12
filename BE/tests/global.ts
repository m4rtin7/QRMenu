import config from 'config'
import path from 'path'
import dayjs from 'dayjs'
import utcPlugin from 'dayjs/plugin/utc'
import timezonePlugin from 'dayjs/plugin/timezone'
import isSameOrAfterPlugin from 'dayjs/plugin/isSameOrAfter'
import isSameOrBeforePlugin from 'dayjs/plugin/isSameOrBefore'
import isoWeekPlugin from 'dayjs/plugin/isoWeek'
import rewiremock from 'rewiremock'
import { Sequelize } from 'sequelize'
import { forEach, every, map } from 'lodash'

import { createJwt } from '../src/utils/auth'
import { IPassportConfig } from '../src/types/interfaces'

import { testDatabaseName, testDatabseWorkerName, testMainDB } from '../config/database'
import { modelsBuilder } from '../src/db/models/init'

const passportConfig: IPassportConfig = config.get('passport')

dayjs.extend(utcPlugin)
dayjs.extend(timezonePlugin)
dayjs.extend(isSameOrAfterPlugin)
dayjs.extend(isSameOrBeforePlugin)
dayjs.extend(isoWeekPlugin)

const { env } = <any>process

rewiremock('nodemailer').with(require('./__mocks__/nodemailer'))

const connection = new Sequelize(`${testMainDB.baseUrl}/postgres`, testMainDB.options)

export const mochaGlobalSetup = async () => {
	try {
		rewiremock.enable()

		const seq = new Sequelize(testMainDB.url, testMainDB.options)
		await Promise.all([connection.authenticate(), seq.authenticate()])
		const models = modelsBuilder(seq)

		forEach(models, (model) => {
			if (model.associate) {
				model.associate(models)
			}
		})

		rewiremock(path.join(process.cwd(), 'src', 'db', 'models', 'index.ts')).with({
			default: seq,
			models
		})

		// run required migrations after sync
		const customLoggingSchemaMigration = require('../src/db/migrations/beforeSyncDb/20200701123900-dependency-create-custom-logging-schema')

		await Promise.all([customLoggingSchemaMigration.up(seq.getQueryInterface())])

		// sync db
		await seq.sync({ force: true })

		// run production/development seeds in sequence (some seeds depend on others)
		const developmentSeeds = require('../src/db/seeders/development').default

		await [ ...developmentSeeds].reduce(
			(promise: Promise<any>, seed: Function): Promise<any> => promise.then(() => seed(seq.getQueryInterface())),
			Promise.resolve()
		)

		await seq.close()
		rewiremock(path.join(process.cwd(), 'src', 'db', 'models', 'index.ts')).disable()

		return Promise.resolve()
	} catch (err) {
		console.log('mochaGlobalSetup error: ', err)
		return Promise.reject(err)
	}
}

export async function mochaGlobalTeardown() {
	try {
		// remove test databases after all test finished
		const [testDatabases]: [any[], any] = await connection.query(`select datname from pg_database where datname like '${testDatabaseName}_%'`)
		await Promise.all(map(testDatabases, (testDatabase) => connection.query(/* SQL */ `DROP DATABASE IF EXISTS ${testDatabase.datname} WITH (FORCE);`)))

		await connection.close()

		return Promise.resolve()
	} catch (err) {
		console.log('mochaGlobalTeardown error: ', err)
		return Promise.reject(err)
	}
}

export const mochaHooks = async () => {
	// create jwt tokens
	const [jwtSuperAdmin, jwtAdmin, jwtManager, jwtNonConfirmedUser, jwtDeletedUser, jwtManager4] = await Promise.all([
		createJwt({ uid: 2 }, { audience: passportConfig.jwt.api.audience }),
		createJwt({ uid: 3 }, { audience: passportConfig.jwt.api.audience }),
		createJwt({ uid: 4 }, { audience: passportConfig.jwt.api.audience }),
		createJwt({ uid: 5 }, { audience: passportConfig.jwt.api.audience }),
		createJwt({ uid: 6 }, { audience: passportConfig.jwt.api.audience }),
		createJwt({ uid: 7 }, { audience: passportConfig.jwt.api.audience })
	])

	env.jwtSuperAdmin = jwtSuperAdmin
	env.jwtAdmin = jwtAdmin
	env.jwtManager = jwtManager
	env.jwtNonConfirmedUser = jwtNonConfirmedUser
	env.jwtDeletedUser = jwtDeletedUser
	env.jwtManager4 = jwtManager4

	return {
		async beforeAll() {
			try {
				rewiremock.enable()

				const isUnitTest = every(this.test.parent.suites, (el) => /unit.test/.test(el.file))
				if (!isUnitTest) {
					// drop test database for worker
					await connection.query(/* SQL */ `DROP DATABASE IF EXISTS ${testDatabseWorkerName} WITH (FORCE);`)

					// create test database for worker
					await connection.query(/* SQL */ `CREATE DATABASE ${testDatabseWorkerName} TEMPLATE ${testDatabaseName};`)
				}

				return Promise.resolve()
			} catch (err) {
				console.log('beforeAll error: ', err)
				return Promise.reject(err)
			}
		},
		async afterAll() {
			try {
				rewiremock.disable()

				return Promise.resolve()
			} catch (err) {
				console.log('afterAll error: ', err)
				return Promise.reject(err)
			}
		}
	}
}
