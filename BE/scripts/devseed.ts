import { isEmpty, map } from 'lodash'
import Umzug from 'umzug'
import path from 'path'

import sequelize from '../src/db/models'

import developmentSeeds from '../src/db/seeders/development'
import productionSeeds from '../src/db/seeders/production'

export default (async () => {
	try {
		// run required migrations before sync
		const umzugMigrationsBeforeSync = new Umzug({
			storageOptions: {
				sequelize
			},
			storage: 'sequelize',
			migrations: {
				params: [sequelize.getQueryInterface()],
				path: path.resolve('src', 'db', 'migrations', 'beforeSyncDb'),
				pattern: /.ts$/
			}
		})
		const migrationsBeforeSync = await umzugMigrationsBeforeSync.up()

		if (isEmpty(migrationsBeforeSync)) {
			console.log('No migrations were executed, database schema was already up to date.')
		} else {
			map(migrationsBeforeSync, (migration) => console.log(`==${migration.file}: migrating =======`))
		}

		// sync db
		await sequelize.sync({ force: true })

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
			console.log('No migrations were executed, database schema was already up to date.')
		} else {
			map([...migrationsAfterSync, ...migrationsAfterSyncLoggingTriggres], (migration) => console.log(`==${migration.file}: migrating =======`))
		}

		// run production/development seeds in sequence (some seeds depend on others)
		await [...productionSeeds, ...developmentSeeds].reduce((promise: Promise<any>, seed: Function): Promise<any> => promise.then(() => seed(sequelize.getQueryInterface())), Promise.resolve())

		console.log('Database was successfully builded')
	} catch (err) {
		console.log(err)
	}
})()
