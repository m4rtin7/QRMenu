// eslint-disable-next-line max-classes-per-file
import generator from '@goodrequest/express-joi-to-swagger'
import path from 'path'
import rewiremock from 'rewiremock'
import config from 'config'
import {
	name, version, author, license
} from '../package.json'
import { IServerConfig } from '../src/types/interfaces'

const serverConfig: IServerConfig = config.get('server')
/* eslint-disable */
class Model {
	static init() { }
	static belongsTo() { }
	static belongsToMany() { }
	static hasOne() { }
	static hasMany() { }
}
class Sequelize {
	async authenticate() { }
	beforeCreate() { }
	afterCreate() { }
	beforeBulkCreate() { }
	afterBulkCreate() { }
	beforeUpdate() { }
	afterUpdate() { }
	beforeBulkUpdate() { }
	afterBulkUpdate() { }
	beforeDestroy() { }
	afterDestroy() { }
	beforeBulkDestroy() { }
	afterBulkDestroy() { }
	beforeRestore() { }
	afterRestore() { }
	beforeBulkRestore() { }
	afterBulkRestore() { }
}

class Redis {
	on() {}
}

/* eslint-enable */
rewiremock('sequelize').with({
	Model,
	Sequelize,
	DataTypes: {
		ENUM: () => { },
		ARRAY: () => { },
		STRING: () => { },
		CHAR: () => { }
	},
	literal() { }
})
rewiremock('@sentry/node').with({
	init: () => { },
	Handlers: {
		requestHandler: () => () => { },
		errorHandler: () => () => { },
		tracingHandler: () => () => { }
	},
	Integrations: {
		// eslint-disable-next-line
		Http: function() { }
	}
})

rewiremock('@sentry/tracing').with({
	Integrations: {
		// eslint-disable-next-line
		Express: function() { },
		// eslint-disable-next-line
		Postgres: function() { }
	}
})

rewiremock('ioredis').with(Redis)

rewiremock.enable()
// eslint-disable-next-line
import app from '../src/app'

export default (async () => {
	try {
		await generator(app, {
			businessLogicName: 'workflow',
			generateUI: true,
			outputPath: path.join(process.cwd(), 'apidoc'),
			permissions: {
				closure: 'permissionMiddleware',
				middlewareName: 'permission',
				paramName: 'allowPermissions'
			},
			requestSchemaName: 'schema',
			responseSchemaName: 'responseSchema',
			swaggerInitInfo: {
				servers: [{
					url: 'http://localhost:3001'
				}],
				info: {
					title: name,
					version,
					description: 'TMR datawarehouse BE',
					contact: {
						email: author
					},
					license: {
						name: license,
						url: ''
					}
				}
			}
		})
	} catch (e) {
		console.log(e)
		process.exit(1)
	} finally {
		rewiremock.disable()
	}
})()
