/* eslint-disable import/no-cycle */
import 'colors'
import pg from 'pg'
import path from 'path'
import fs from 'fs'
import highlight from 'cli-highlight'
import { get, some, forEach, find, has, filter, map, isEmpty } from 'lodash'
import {
	Sequelize,
	Model,
	BulkCreateOptions,
	InstanceUpdateOptions,
	UpdateOptions,
	InstanceDestroyOptions,
	DestroyOptions,
	RestoreOptions,
	InstanceRestoreOptions,
	Transaction,
	ModelStatic
} from 'sequelize'

import * as database from '../../../config/database'

// utils
import ErrorBuilder from '../../utils/ErrorBuilder'
import { ENV, SQL_OPERATION } from '../../utils/enums'
import { uglyfyRawSqlQuery } from '../../utils/helper'

// types
import { IRestoreHookFunctions } from '../../types/models'

import { modelsBuilder } from './init'

// NOTE: set true because otherwise BIGINT return string instead of integer https://github.com/sequelize/sequelize/issues/1774
pg.defaults.parseInt8 = true

const env = <ENV>process.env.NODE_ENV || ENV.development

// eslint-disable-next-line import/namespace
const { url, options: dbOptions } = database[env]

if (dbOptions.logging) {
	dbOptions.logging = (log: string) => {
		console.log(highlight(log, { language: 'sql', ignoreIllegals: true, theme: 'code' }))
	}
}

const sequelize = <Sequelize & IRestoreHookFunctions>new Sequelize(url, dbOptions)
sequelize
	.authenticate()
	.then(() => console.log('Database connection has been established successfully'.green))
	.catch((err) => console.log(`Unable to connect to the database: ${err}`.red))

const hasRequiredColumnByInstance = (instance: Model, columnName: string) => {
	const models = get(instance, 'sequelize.models')
	const modelName = get(instance, 'constructor.options.name.singular')
	const model = find(models, (item) => item.name === modelName)

	return has(model, `tableAttributes.${columnName}`)
}

interface ICreateLogReplacements {
	requestID: string
	operation: SQL_OPERATION
	requestUrl: string
	userID: number
	userFullName: string
	affectedItemsPrimaryKeys: number[] | string[]
}

export const createLogs = (baseModelName: string, logModelName: string, baseModelPrimaryKey: string, replacements: ICreateLogReplacements, transaction: Transaction) => {
	const formatedRawQuery = /* SQL */ `
		INSERT INTO "custom_logging"."${logModelName}" ( "logID", "recordID", "operation", "requestUrl", "userID", "userName", "oldValue", "newValue", "createdAt" )
		SELECT
			:requestID AS "logID",
			"${baseModelPrimaryKey}"::TEXT AS "recordID",
			:operation AS "operation",
			:requestUrl AS "requestUrl",
			:userID::BIGINT AS "userID",
			:userFullName AS "userName",
			row_to_json("${baseModelName}") AS "oldValue",
			'{}'::JSON AS "newValue",
			NOW() AS "createdAt"
		FROM "${baseModelName}"
		WHERE
			"${baseModelPrimaryKey}" IN (:affectedItemsPrimaryKeys)`

	const resultRawQuery = uglyfyRawSqlQuery(formatedRawQuery)

	if (!isEmpty(replacements.affectedItemsPrimaryKeys)) {
		return sequelize.query(resultRawQuery, {
			replacements: {
				requestID: replacements.requestID,
				operation: replacements.operation,
				requestUrl: replacements.requestUrl,
				userID: replacements.userID,
				userFullName: replacements.userFullName,
				affectedItemsPrimaryKeys: replacements.affectedItemsPrimaryKeys
			},
			transaction
		})
	}
	return Promise.resolve()
}

interface IUpdateLogReplacements {
	requestID: string
	operation: SQL_OPERATION
}

export const updateLogs = (baseModelName: string, logModelName: string, baseModelPrimaryKey: string, replacements: IUpdateLogReplacements, transaction: Transaction) => {
	const formatedRawQuery = /* SQL */ `
		UPDATE "custom_logging"."${logModelName}" SET
			"newValue" = row_to_json("${baseModelName}")
		FROM "${baseModelName}"
		WHERE
			"logID" = :requestID
			AND "operation" = :operation
			AND "custom_logging"."${logModelName}"."recordID" = "${baseModelName}"."${baseModelPrimaryKey}"::TEXT`

	const resultRawQuery = uglyfyRawSqlQuery(formatedRawQuery)
	return sequelize.query(resultRawQuery, {
		replacements: {
			requestID: replacements.requestID,
			operation: replacements.operation
		},
		transaction
	})
}

// Verify createdBy presence when creating instance
sequelize.beforeCreate((instance: Model) => {
	// do not trigger error if call from umzug
	if (get(instance, 'constructor.options.name.plural') === 'SequelizeMeta' || get(instance, 'constructor.options.name.plural') === 'SequelizeData') {
		return
	}

	const columnName = 'createdBy'
	const hasCreatedBy = hasRequiredColumnByInstance(instance, columnName)

	// check if model has createdBy column and if it is provided
	if (hasCreatedBy && !get(instance, columnName)) {
		throw new ErrorBuilder(500, `${columnName} is missing in attributes`)
	}
})

// Create application log with new values
sequelize.afterCreate(async (instance: Model, options) => {
	try {
		// do not trigger error if call from umzug
		if (get(instance, 'constructor.options.name.plural') === 'SequelizeMeta' || get(instance, 'constructor.options.name.plural') === 'SequelizeData') {
			return await Promise.resolve()
		}

		if (!options.transaction && options.applicationLogging !== false) {
			throw new Error('Missing transaction')
		}

		// check if model has logging model and create log if it does
		const modelName = get(instance, 'constructor.options.name.singular') || ''
		const BaseModel = instance.sequelize.models[modelName]
		const logModelName = `${modelName}Log`
		const LogModel = instance.sequelize.models[logModelName]

		if (LogModel && options.applicationLogging !== false) {
			const { requestID, originalUrl, user: authUser } = instance.req
			const baseModelPrimaryKey = BaseModel.primaryKeyAttribute

			const formatedRawQuery = /* SQL */ `
			INSERT INTO "custom_logging"."${LogModel.tableName}" ( "logID", "recordID", "operation", "requestUrl", "userID", "userName", "oldValue", "newValue", "createdAt" )
			SELECT
				:requestID AS "logID",
				"${baseModelPrimaryKey}"::TEXT AS "recordID",
				:operation AS "operation",
				:requestUrl AS "requestUrl",
				:userID::BIGINT AS "userID",
				:userFullName AS "userName",
				NULL AS "oldValue",
				row_to_json("${BaseModel.tableName}") AS "newValue",
				NOW() AS "createdAt"
			FROM "${BaseModel.tableName}"
			WHERE
				"${baseModelPrimaryKey}" IN (:affectedItemsPrimaryKeys)`

			const resultRawQuery = uglyfyRawSqlQuery(formatedRawQuery)
			await sequelize.query(resultRawQuery, {
				replacements: {
					requestID,
					operation: SQL_OPERATION.INSERT,
					requestUrl: originalUrl,
					userID: authUser.id,
					userFullName: authUser.fullName,
					affectedItemsPrimaryKeys: [get(instance, baseModelPrimaryKey)]
				},
				transaction: options.transaction
			})
		}

		return await Promise.resolve()
	} catch (e) {
		return Promise.reject(e)
	}
})

// Verify createdBy presence when bulk creating
sequelize.beforeBulkCreate(async (instances, options: BulkCreateOptions & { model: typeof Model }) => {
	try {
		if (!options.transaction && options.applicationLogging !== false) {
			throw new Error('Missing transaction')
		}

		const columnName = 'createdBy'
		const hasCreatedBy = has(options, `model.tableAttributes.${columnName}`)

		// check if model has createdBy column and if it is provided
		if (hasCreatedBy && some(instances, (item) => !get(item, columnName))) {
			throw new ErrorBuilder(500, `${columnName} is missing in attributes`)
		}

		if (options.updateOnDuplicate) {
			// check if model has logging model and create logs if it does
			const BaseModel = options.model
			const modelName = BaseModel.name || ''
			const logModelName = `${modelName}Log`
			const LogModel = BaseModel.sequelize.models[logModelName]

			if (LogModel && options.applicationLogging !== false) {
				const { requestID, originalUrl, user: authUser } = <Model['req']>BaseModel.prototype.req
				const baseModelPrimaryKey = BaseModel.primaryKeyAttribute

				const affectedItemsPrimaryKeys = map(instances, baseModelPrimaryKey)

				await createLogs(
					BaseModel.tableName,
					LogModel.tableName,
					baseModelPrimaryKey,
					{
						requestID,
						operation: SQL_OPERATION.UPDATE,
						requestUrl: originalUrl,
						userID: authUser.id,
						userFullName: authUser.fullName,
						affectedItemsPrimaryKeys
					},
					options.transaction
				)
			}
		}

		return await Promise.resolve()
	} catch (e) {
		return Promise.reject(e)
	}
})

// Create application logs with new values
sequelize.afterBulkCreate(async (instances, options: BulkCreateOptions & { model: typeof Model }) => {
	try {
		if (!options.transaction && options.applicationLogging !== false) {
			throw new Error('Missing transaction')
		}

		const columnName = 'createdBy'
		const hasCreatedBy = has(options, `model.tableAttributes.${columnName}`)

		// check if model has createdBy column and if it is provided
		if (hasCreatedBy && some(instances, (item) => !get(item, columnName))) {
			throw new ErrorBuilder(500, `${columnName} is missing in attributes`)
		}

		// check if model has logging model and create logs if it does
		const BaseModel = options.model
		const modelName = BaseModel.name || ''
		const logModelName = `${modelName}Log`
		const LogModel = BaseModel.sequelize.models[logModelName]

		if (LogModel && options.applicationLogging !== false) {
			const { requestID, originalUrl, user: authUser } = <Model['req']>BaseModel.prototype.req
			const baseModelPrimaryKey = BaseModel.primaryKeyAttribute

			if (options.updateOnDuplicate) {
				await updateLogs(
					BaseModel.tableName,
					LogModel.tableName,
					baseModelPrimaryKey,
					{
						requestID,
						operation: SQL_OPERATION.UPDATE
					},
					options.transaction
				)
			} else {
				const affectedItemsPrimaryKeys = map(instances, baseModelPrimaryKey)

				const formatedRawQuery = /* SQL */ `
					INSERT INTO "custom_logging"."${LogModel.tableName}" ( "logID", "recordID", "operation", "requestUrl", "userID", "userName", "oldValue", "newValue", "createdAt" )
					SELECT
						:requestID AS "logID",
						"${baseModelPrimaryKey}"::TEXT AS "recordID",
						:operation AS "operation",
						:requestUrl AS "requestUrl",
						:userID::BIGINT AS "userID",
						:userFullName AS "userName",
						NULL AS "oldValue",
						row_to_json("${BaseModel.tableName}") AS "newValue",
						NOW() AS "createdAt"
					FROM "${BaseModel.tableName}"
					WHERE
						"${baseModelPrimaryKey}" IN (:affectedItemsPrimaryKeys)`

				const resultRawQuery = uglyfyRawSqlQuery(formatedRawQuery)

				await sequelize.query(resultRawQuery, {
					replacements: {
						requestID,
						operation: SQL_OPERATION.INSERT,
						requestUrl: originalUrl,
						userID: authUser.id,
						userFullName: authUser.fullName,
						affectedItemsPrimaryKeys
					},
					transaction: options.transaction
				})
			}
		}

		return await Promise.resolve()
	} catch (e) {
		return Promise.reject(e)
	}
})

// Verify updatedBy presence when updating instance and create application log with old values
sequelize.beforeUpdate(async (instance: Model, options: InstanceUpdateOptions) => {
	try {
		if (!options.transaction && options.applicationLogging !== false) {
			throw new Error('Missing transaction')
		}

		const columnName = 'updatedBy'
		const hasUpdatedBy = hasRequiredColumnByInstance(instance, columnName)

		// check if model has updatedBy column and if it is provided
		if (hasUpdatedBy && !get(instance, columnName)) {
			throw new ErrorBuilder(500, `${columnName} is missing in attributes`)
		}

		// check if model has logging model and create log if it does
		const modelName = get(instance, 'constructor.options.name.singular') || ''
		const BaseModel = instance.sequelize.models[modelName]
		const logModelName = `${modelName}Log`
		const LogModel = instance.sequelize.models[logModelName]

		if (LogModel && options.applicationLogging !== false) {
			const { requestID, originalUrl, user: authUser } = instance.req

			const baseModelPrimaryKey = BaseModel.primaryKeyAttribute

			await createLogs(
				BaseModel.tableName,
				LogModel.tableName,
				baseModelPrimaryKey,
				{
					requestID,
					operation: SQL_OPERATION.UPDATE,
					requestUrl: originalUrl,
					userID: authUser.id,
					userFullName: authUser.fullName,
					affectedItemsPrimaryKeys: [get(instance, baseModelPrimaryKey)]
				},
				options.transaction
			)
		}

		return await Promise.resolve()
	} catch (e) {
		return Promise.reject(e)
	}
})

// Update application log by adding new values
sequelize.afterUpdate(async (instance: Model, options: InstanceUpdateOptions) => {
	try {
		if (!options.transaction && options.applicationLogging !== false) {
			throw new Error('Missing transaction')
		}

		// check if model has logging model and update log if it does
		const modelName = get(instance, 'constructor.options.name.singular') || ''
		const BaseModel = instance.sequelize.models[modelName]
		const logModelName = `${modelName}Log`
		const LogModel = instance.sequelize.models[logModelName]

		if (LogModel && options.applicationLogging !== false) {
			const { requestID } = instance.req
			const baseModelPrimaryKey = BaseModel.primaryKeyAttribute

			await updateLogs(
				BaseModel.tableName,
				LogModel.tableName,
				baseModelPrimaryKey,
				{
					requestID,
					operation: SQL_OPERATION.UPDATE
				},
				options.transaction
			)
		}

		return await Promise.resolve()
	} catch (e) {
		return Promise.reject(e)
	}
})

// Verify updatedBy presence when bulk updating and create application logs with old values
sequelize.beforeBulkUpdate(async (options: UpdateOptions & { model: ModelStatic<Model<unknown, unknown>> & typeof Model & { prototype: any } }) => {
	try {
		if (!options.transaction && options.applicationLogging !== false) {
			throw new Error('Missing transaction')
		}

		const columnNameUpdatedBy = 'updatedBy'
		const columnNameDeletedBy = 'deletedBy'
		const hasUpdatedBy = has(options, `model.tableAttributes.${columnNameUpdatedBy}`)
		const isUpdate = !has(options, `attributes.${columnNameDeletedBy}`)

		// check if model has updatedBy column and if it is provided (check it only on update, do not check it on delete/restore)
		if (isUpdate && hasUpdatedBy && !get(options, `attributes.${columnNameUpdatedBy}`)) {
			throw new ErrorBuilder(500, `${columnNameUpdatedBy} is missing in attributes`)
		}

		// check if model has logging model and create logs if it does
		const BaseModel = options.model
		const modelName = BaseModel.name || ''
		const logModelName = `${modelName}Log`
		const LogModel = BaseModel.sequelize.models[logModelName]

		if (LogModel && isUpdate) {
			const { requestID, originalUrl, user: authUser } = <Model['req']>BaseModel.prototype.req
			const baseModelPrimaryKey = BaseModel.primaryKeyAttribute

			const affectedItems = await BaseModel.findAll({
				raw: true,
				attributes: [baseModelPrimaryKey],
				where: options.where,
				transaction: options.transaction
			})
			const affectedItemsPrimaryKeys = map(affectedItems, baseModelPrimaryKey)

			await createLogs(
				BaseModel.tableName,
				LogModel.tableName,
				baseModelPrimaryKey,
				{
					requestID,
					operation: SQL_OPERATION.UPDATE,
					requestUrl: originalUrl,
					userID: authUser.id,
					userFullName: authUser.fullName,
					affectedItemsPrimaryKeys
				},
				options.transaction
			)
		}

		return await Promise.resolve()
	} catch (e) {
		return Promise.reject(e)
	}
})

// Update application logs by adding new values
sequelize.afterBulkUpdate(async (options: UpdateOptions & { model: ModelStatic<Model<unknown, unknown>> & typeof Model & { prototype: any } }) => {
	try {
		if (!options.transaction && options.applicationLogging !== false) {
			throw new Error('Missing transaction')
		}

		const columnNameDeletedBy = 'deletedBy'
		const isUpdate = !has(options, `attributes.${columnNameDeletedBy}`)

		// check if model has logging model and update logs if it does
		const BaseModel = options.model
		const modelName = get(options, 'model.name') || ''
		const logModelName = `${modelName}Log`
		const LogModel = options.model.sequelize.models[logModelName]

		if (LogModel && isUpdate) {
			const { requestID } = <Model['req']>BaseModel.prototype.req
			const baseModelPrimaryKey = BaseModel.primaryKeyAttribute

			await updateLogs(
				BaseModel.tableName,
				LogModel.tableName,
				baseModelPrimaryKey,
				{
					requestID,
					operation: SQL_OPERATION.UPDATE
				},
				options.transaction
			)
		}

		return await Promise.resolve()
	} catch (e) {
		return Promise.reject(e)
	}
})

// Verify deletedBy presence when deleting instance and create application log with old values
sequelize.beforeDestroy(async (instance: Model & { deletedBy?: number }, options: InstanceDestroyOptions) => {
	try {
		if (!options.transaction && options.applicationLogging !== false) {
			throw new Error('Missing transaction')
		}

		const columnName = 'deletedBy'
		const hasDeletedBy = hasRequiredColumnByInstance(instance, columnName)

		// check if model has deletedBy column and if it is provided
		if (hasDeletedBy && !options.force) {
			if (!options.deletedBy) {
				throw new ErrorBuilder(500, `${columnName} is missing in attributes`)
			}

			// set deletedBy value to instance
			instance.setDataValue(columnName, options.deletedBy)
			instance.changed(columnName, true)
		}

		// check if model has logging model and create log if it does
		const modelName = get(instance, 'constructor.options.name.singular') || ''
		const BaseModel = instance.sequelize.models[modelName]
		const logModelName = `${modelName}Log`
		const LogModel = instance.sequelize.models[logModelName]

		if (LogModel && options.applicationLogging !== false) {
			const { requestID, originalUrl, user: authUser } = instance.req

			const baseModelPrimaryKey = BaseModel.primaryKeyAttribute

			await createLogs(
				BaseModel.tableName,
				LogModel.tableName,
				baseModelPrimaryKey,
				{
					requestID,
					operation: SQL_OPERATION.DELETE,
					requestUrl: originalUrl,
					userID: authUser.id,
					userFullName: authUser.fullName,
					affectedItemsPrimaryKeys: [get(instance, baseModelPrimaryKey)]
				},
				options.transaction
			)
		}

		return await Promise.resolve()
	} catch (e) {
		return Promise.reject(e)
	}
})

// Update application log by adding new values
sequelize.afterDestroy(async (instance: Model & { deletedBy?: number }, options: InstanceDestroyOptions) => {
	try {
		if (!options.transaction && options.applicationLogging !== false) {
			throw new Error('Missing transaction')
		}

		// check if model has logging model and create log if it does
		const modelName = get(instance, 'constructor.options.name.singular') || ''
		const BaseModel = instance.sequelize.models[modelName]
		const logModelName = `${modelName}Log`
		const LogModel = instance.sequelize.models[logModelName]

		if (LogModel && options.applicationLogging !== false) {
			const { requestID } = instance.req
			const baseModelPrimaryKey = BaseModel.primaryKeyAttribute

			await updateLogs(
				BaseModel.tableName,
				LogModel.tableName,
				baseModelPrimaryKey,
				{
					requestID,
					operation: SQL_OPERATION.DELETE
				},
				options.transaction
			)
		}

		return await Promise.resolve()
	} catch (e) {
		return Promise.reject(e)
	}
})

// Verify deletedBy presence when bulk deleting and create application logs with old values
sequelize.beforeBulkDestroy(async (options: DestroyOptions & { model: ModelStatic<Model<unknown, unknown>> & typeof Model & { prototype: any } }) => {
	try {
		if (!options.transaction && options.applicationLogging !== false) {
			throw new Error('Missing transaction')
		}

		const columnName = 'deletedBy'
		const hasDeletedBy = has(options, `model.tableAttributes.${columnName}`)

		// check if model has deletedBy column and if it is provided
		if (hasDeletedBy && !options.force) {
			if (!options.deletedBy) {
				throw new ErrorBuilder(500, `${columnName} is missing in attributes`)
			}
		}

		// check if model has logging model and create logs if it does
		const BaseModel = options.model
		const modelName = BaseModel.name || ''
		const logModelName = `${modelName}Log`
		const LogModel = BaseModel.sequelize.models[logModelName]

		if (LogModel && options.applicationLogging !== false) {
			const { requestID, originalUrl, user: authUser } = <Model['req']>BaseModel.prototype.req
			const baseModelPrimaryKey = BaseModel.primaryKeyAttribute

			const affectedItems = await BaseModel.findAll({
				raw: true,
				attributes: [baseModelPrimaryKey],
				where: options.where,
				transaction: options.transaction
			})
			const affectedItemsPrimaryKeys = map(affectedItems, baseModelPrimaryKey)

			await createLogs(
				BaseModel.tableName,
				LogModel.tableName,
				baseModelPrimaryKey,
				{
					requestID,
					operation: SQL_OPERATION.DELETE,
					requestUrl: originalUrl,
					userID: authUser.id,
					userFullName: authUser.fullName,
					affectedItemsPrimaryKeys
				},
				options.transaction
			)
		}

		// set deletedBy attribute
		if (hasDeletedBy && !options.force) {
			await BaseModel.update(
				{
					deletedBy: options.deletedBy
				},
				{
					silent: true,
					where: options.where,
					transaction: options.transaction
				}
			)
		}

		return await Promise.resolve()
	} catch (e) {
		return Promise.reject(e)
	}
})

// Update application logs by adding new values
sequelize.afterBulkDestroy(async (options: DestroyOptions & { model: typeof Model & { prototype: any } }) => {
	try {
		if (!options.transaction && options.applicationLogging !== false) {
			throw new Error('Missing transaction')
		}

		// check if model has logging model and update logs if it does
		const BaseModel = options.model
		const modelName = get(options, 'model.name') || ''
		const logModelName = `${modelName}Log`
		const LogModel = options.model.sequelize.models[logModelName]

		if (LogModel && options.applicationLogging !== false) {
			const { requestID } = <Model['req']>BaseModel.prototype.req
			const baseModelPrimaryKey = BaseModel.primaryKeyAttribute

			await updateLogs(
				BaseModel.tableName,
				LogModel.tableName,
				baseModelPrimaryKey,
				{
					requestID,
					operation: SQL_OPERATION.DELETE
				},
				options.transaction
			)
		}

		return await Promise.resolve()
	} catch (e) {
		return Promise.reject(e)
	}
})

// Remove deletedBy when restoring instance and create application log with old values
sequelize.beforeRestore(async (instance: Model & { deletedBy?: number }, options: InstanceRestoreOptions) => {
	try {
		if (!options.transaction && options.applicationLogging !== false) {
			throw new Error('Missing transaction')
		}

		const columnName = 'deletedBy'
		const hasDeletedBy = hasRequiredColumnByInstance(instance, columnName)

		// check if model has deletedBy column
		if (hasDeletedBy) {
			// set deletedBy to null value for instance
			instance.setDataValue(columnName, null)
			instance.changed(columnName, true)
		}

		// check if model has logging model and create log if it does
		const modelName = get(instance, '_modelOptions.name.singular') || ''
		const BaseModel = instance.sequelize.models[modelName]
		const logModelName = `${modelName}Log`
		const LogModel = instance.sequelize.models[logModelName]

		if (LogModel && options.applicationLogging !== false) {
			const { requestID, originalUrl, user: authUser } = instance.req

			const baseModelPrimaryKey = BaseModel.primaryKeyAttribute

			await createLogs(
				BaseModel.tableName,
				LogModel.tableName,
				baseModelPrimaryKey,
				{
					requestID,
					operation: SQL_OPERATION.RESTORE,
					requestUrl: originalUrl,
					userID: authUser.id,
					userFullName: authUser.fullName,
					affectedItemsPrimaryKeys: [get(instance, baseModelPrimaryKey)]
				},
				options.transaction
			)
		}

		return await Promise.resolve()
	} catch (e) {
		return Promise.reject(e)
	}
})

// Update application log by adding new values
sequelize.afterRestore(async (instance: Model & { deletedBy?: number }, options: InstanceRestoreOptions) => {
	try {
		if (!options.transaction && options.applicationLogging !== false) {
			throw new Error('Missing transaction')
		}

		// check if model has logging model and update log if it does
		const modelName = get(instance, '_modelOptions.name.singular') || ''
		const BaseModel = instance.sequelize.models[modelName]
		const logModelName = `${modelName}Log`
		const LogModel = instance.sequelize.models[logModelName]

		if (LogModel && options.applicationLogging !== false) {
			const { requestID } = instance.req
			const baseModelPrimaryKey = BaseModel.primaryKeyAttribute

			await updateLogs(
				BaseModel.tableName,
				LogModel.tableName,
				baseModelPrimaryKey,
				{
					requestID,
					operation: SQL_OPERATION.RESTORE
				},
				options.transaction
			)
		}

		return await Promise.resolve()
	} catch (e) {
		return Promise.reject(e)
	}
})

// Remove deletedBy when bulk restoring and create application logs with old values
sequelize.beforeBulkRestore(async (options: RestoreOptions & { model: ModelStatic<Model<unknown, unknown>> & typeof Model & { prototype: any } }) => {
	if (!options.transaction && options.applicationLogging !== false) {
		throw new Error('Missing transaction')
	}

	// check if model has logging model and create logs if it does
	const BaseModel = options.model
	const modelName = BaseModel.name || ''
	const logModelName = `${modelName}Log`
	const LogModel = BaseModel.sequelize.models[logModelName]

	if (LogModel && options.applicationLogging !== false) {
		const { requestID, originalUrl, user: authUser } = <Model['req']>BaseModel.prototype.req
		const baseModelPrimaryKey = BaseModel.primaryKeyAttribute

		const affectedItems = await BaseModel.findAll({
			paranoid: false,
			raw: true,
			attributes: [baseModelPrimaryKey],
			where: options.where,
			transaction: options.transaction
		})
		const affectedItemsPrimaryKeys = map(affectedItems, baseModelPrimaryKey)

		await createLogs(
			BaseModel.tableName,
			LogModel.tableName,
			baseModelPrimaryKey,
			{
				requestID,
				operation: SQL_OPERATION.RESTORE,
				requestUrl: originalUrl,
				userID: authUser.id,
				userFullName: authUser.fullName,
				affectedItemsPrimaryKeys
			},
			options.transaction
		)
	}

	const columnName = 'deletedBy'
	const hasDeletedBy = has(options, `model.tableAttributes.${columnName}`)

	// set deletedBy attribute if model has it
	if (hasDeletedBy) {
		// call update to set deletedBy to null value
		await options.model.update(
			{
				deletedBy: null
			},
			{
				paranoid: false,
				silent: true,
				where: options.where,
				transaction: options.transaction
			}
		)
	}
})

// Update application logs by adding new values
sequelize.afterBulkRestore(async (options: RestoreOptions & { model: typeof Model & { prototype: any } }) => {
	try {
		if (!options.transaction && options.applicationLogging !== false) {
			throw new Error('Missing transaction')
		}

		// check if model has logging model and update logs if it does
		const BaseModel = options.model
		const modelName = get(options, 'model.name') || ''
		const logModelName = `${modelName}Log`
		const LogModel = options.model.sequelize.models[logModelName]

		if (LogModel && options.applicationLogging !== false) {
			const { requestID } = <Model['req']>BaseModel.prototype.req
			const baseModelPrimaryKey = BaseModel.primaryKeyAttribute

			await updateLogs(
				BaseModel.tableName,
				LogModel.tableName,
				baseModelPrimaryKey,
				{
					requestID,
					operation: SQL_OPERATION.RESTORE
				},
				options.transaction
			)
		}

		return await Promise.resolve()
	} catch (e) {
		return Promise.reject(e)
	}
})

const buildModels = () => {
	const models = modelsBuilder(sequelize)

	// get all models
	const modelsEntities = fs.readdirSync(__dirname, { withFileTypes: true })
	const modelsFiles = filter(modelsEntities, (modelsEntity) => modelsEntity.isFile())
	const modelsLogsFiles = fs.readdirSync(path.join(__dirname, 'logs'))

	// check if every model is imported (-2 because index.ts and init.ts can not be counted)
	if ([...Object.keys(models)].length !== modelsFiles.length + modelsLogsFiles.length - 2) {
		console.log([...Object.keys(models)].length, modelsFiles.length + modelsLogsFiles.length - 2);
		
		throw new Error('You probably forgot import database model!')
	}

	forEach(models, (model) => {
		if (model.associate) {
			model.associate(models)
		}
	})
	return models
}

const models = buildModels()
type ModelsType = typeof models

export { models }
export type { ModelsType }
export default sequelize
