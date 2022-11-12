/* eslint-disable import/no-cycle */
import { Sequelize, DataTypes, Model } from 'sequelize'

import {
	PERMISSION, PERMISSIONS, PERMISSION_GROUP, PERMISSION_GROUPS
} from '../../utils/enums'

import { UserModel } from './user'
import { RoleModel } from './role'

export class PermissionModel extends Model {
	id: number
	key: PERMISSION
	groupKey: PERMISSION_GROUP
	// foreign keys
	users: UserModel[]
	roles: RoleModel[]
	// metadata
	createdAt: string
	updatedAt: string
	deletedAt: string
}

export default (sequelize: Sequelize, modelName: string) => {
	PermissionModel.init({
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			unique: true,
			autoIncrement: true
		},
		key: {
			type: DataTypes.ENUM(...PERMISSIONS),
			allowNull: false,
			unique: true
		},
		groupKey: {
			type: DataTypes.ENUM(...PERMISSION_GROUPS),
			allowNull: false
		}
	}, {
		paranoid: true,
		timestamps: true,
		sequelize,
		modelName,
		tableName: 'permissions'
	})

	PermissionModel.associate = (models) => {
		PermissionModel.belongsToMany(models.Role, {
			foreignKey: 'permissionID',
			through: {
				model: models.RolePermission,
				unique: true
			}
		})

	}

	return PermissionModel
}
