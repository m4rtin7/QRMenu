import 'colors'
import http from 'http'
import config from 'config'
import Umzug from 'umzug'
import path from 'path'
import { map, isEmpty, filter, includes, lowerFirst, some, upperFirst, forEach, isArray } from 'lodash'
import fs from 'fs'

import app from './app'
import sequelize, { models } from './db/models'
import { IServerConfig } from './types/interfaces'

const httpServer = http.createServer(app)
const serverConfig: IServerConfig = config.get('server')

// NOTE: ensure files directory exist
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
fs.existsSync(serverConfig.filesPath) || fs.mkdirSync(serverConfig.filesPath)

// NOTE: create file structure for files folder
forEach(serverConfig.filesSubdirs, (subdir) => {
	let absolutePath
	if (isArray(subdir)) {
		absolutePath = path.join(serverConfig.filesPath, ...subdir)
	} else {
		absolutePath = path.join(serverConfig.filesPath, subdir)
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-expressions
	fs.existsSync(absolutePath) || fs.mkdirSync(absolutePath, { recursive: true })
})

if (!String.prototype.replaceAll) {
	String.prototype.replaceAll = function(str, newStr){

		// If a regex pattern
		if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
			return this.replace(str, newStr);
		}

		// If a string
		return this.replace(new RegExp(str, 'g'), newStr);

	};
}

sequelize
	.sync()
	.then(async () => {
		try {
			// run required migrations after sync
			const umzugMigrationsAfterSync = new Umzug({
				storageOptions: {
					sequelize
				},
				storage: 'sequelize',
				migrations: {
					params: [sequelize.getQueryInterface()],
					path: path.resolve('src', 'db', 'migrations', 'afterSyncDb'),
					pattern: /.ts$/
				}
			})
			const migrationsAfterSync = await umzugMigrationsAfterSync.up()

			// run required migrations after sync (logging triggers)
			const umzugMigrationsAfterSyncLoggingTriggres = new Umzug({
				storageOptions: {
					sequelize
				},
				storage: 'sequelize',
				migrations: {
					params: [sequelize.getQueryInterface()],
					path: path.resolve('src', 'db', 'migrations', 'afterSyncDb', 'loggingTriggers'),
					pattern: /.ts$/
				}
			})

			const migrationsAfterSyncLoggingTriggres = await umzugMigrationsAfterSyncLoggingTriggres.up()

			if (isEmpty(migrationsAfterSync) && isEmpty(migrationsAfterSyncLoggingTriggres)) {
				console.log('No migrations were executed, database schema was already up to date')
			} else {
				map([...migrationsAfterSync, ...migrationsAfterSyncLoggingTriggres], (migration) => console.log(`==${migration.file}: migrating =======`))
			}

			// run production seeds
			const umzugProductionSeeds = new Umzug({
				storageOptions: {
					sequelize,
					modelName: 'SequelizeData'
				},
				storage: 'sequelize',
				migrations: {
					params: [sequelize.getQueryInterface()],
					path: path.resolve('src', 'db', 'seeders', 'production'),
					pattern: /.ts$/
				}
			})
			const productionSeeds = await umzugProductionSeeds.up()

			if (isEmpty(productionSeeds)) {
				console.log('No production seeds were executed, database schema was already up to date')
			} else {
				forEach(productionSeeds, (seed) => console.log(`==${seed.file}: seeding =======`))
			}
		} catch (err) {
			console.log(`Unable to perform all migrations and production seeds: ${err}`.red)
		}
	})
	.then(async () => {
		// check if every model (except log models) has logging trigger
		try {
			const files: string[] = await new Promise((resolve, reject) => {
				fs.readdir(path.join(process.cwd(), 'src', 'db', 'migrations', 'afterSyncDb', 'loggingTriggers'), (err, findfiles) => {
					if (err) {
						reject(err)
					}
					resolve(findfiles)
				})
			})
			const noLogModels = filter(Object.keys(models), (modelName) => !includes(modelName, 'Log'))
			const noLogModelNames = map(noLogModels, (modelName) => lowerFirst(modelName))
			let unloggedModelsCount = 0

			forEach(noLogModelNames, (model) => {
				const loggingTriggerRegex = new RegExp(`^[0-9]{14}-dependency-create-(${model})-logging-trigger.ts$`)
				const hasLoggingTrigger = some(files, (file) => file.match(loggingTriggerRegex))

				if (!hasLoggingTrigger) {
					unloggedModelsCount += 1
					console.log(`${upperFirst(model)} model does not have logging trigger`.yellow)
				}
			})
			if (unloggedModelsCount === 0) {
				console.log('All models have logging triggers'.green)
			}
		} catch (err) {
			console.log(`Unable to read migrations/afterSyncDB directory: ${err}`.red)
		}

	})
	.catch((err) => {
		console.log(`Unknown error has occurred: ${err}`.red)
	})

httpServer.listen(serverConfig.port).on('listening', () => {
	console.log(`Server started in ${process.env.NODE_ENV} mode at port ${serverConfig.port}`.green)
})

export default httpServer
