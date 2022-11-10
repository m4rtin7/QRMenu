/* eslint-disable import/no-cycle */
import { Sequelize, DataTypes, Model } from 'sequelize'

import { RoleModel } from './role'
import { PermissionModel } from './permission'

export class RolePermissionModel extends Model {
	// foreign keys
	roleID: number
	role: RoleModel
	permissionID: number
	permission: PermissionModel
	resortID: number
	// metadata
	createdAt: string
	updatedAt: string
}

export default (sequelize: Sequelize, modelName: string) => {
	RolePermissionModel.init(
		{
			roleID: {
				type: DataTypes.BIGINT,
				primaryKey: true
			},
			permissionID: {
				type: DataTypes.BIGINT,
				primaryKey: true
			}
		},
		{
			timestamps: true,
			sequelize,
			modelName,
			tableName: 'role_permissions'
		}
	)

	return RolePermissionModel
}
