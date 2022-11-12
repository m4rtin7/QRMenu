import { Sequelize, DataTypes, Model } from 'sequelize'

import { SQL_OPERATION, SQL_OPERATIONS, CUSTOM_LOGGING_SCHEMA } from '../../../utils/enums'

class RoleLogModel extends Model {
	id: number
	logID: string
	recordID: string
	operation: SQL_OPERATION
	requestUrl: string
	userID: number
	userName: string
	oldValue: Object
	newValue: Object
}

export default (sequelize: Sequelize, modelName: string) => {
	RoleLogModel.init({
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			unique: true,
			autoIncrement: true
		},
		logID: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		recordID: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		operation: {
			type: DataTypes.ENUM(...SQL_OPERATIONS),
			allowNull: false
		},
		requestUrl: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		userID: {
			type: DataTypes.BIGINT,
			allowNull: false
		},
		userName: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		oldValue: {
			type: DataTypes.JSONB,
			allowNull: true
		},
		newValue: {
			type: DataTypes.JSONB,
			allowNull: true
		}
	}, {
		sequelize,
		timestamps: true,
		updatedAt: false,
		modelName,
		tableName: 'roleLogs',
		schema: CUSTOM_LOGGING_SCHEMA
	})

	return RoleLogModel
}
