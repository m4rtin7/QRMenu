/* eslint-disable import/no-cycle */
import { Sequelize, DataTypes, Model } from 'sequelize'

import { UserModel } from './user'
import { RoleModel } from './role'

export class UserRoleModel extends Model {
	// foreign keys
	userID: number
	user: UserModel
	roleID: number
	role: RoleModel
	// metadata
	createdAt: string
	updatedAt: string
}

export default (sequelize: Sequelize, modelName: string) => {
	UserRoleModel.init(
		{
			userID: {
				type: DataTypes.BIGINT
			},
			roleID: {
				type: DataTypes.BIGINT
			},
			resortID: {
				type: DataTypes.BIGINT
			}
		},
		{
			timestamps: true,
			sequelize,
			modelName,
			tableName: 'user_roles',
			indexes: [{ unique: true, name: 'user_role_resort_unique_index', fields: ['userID', 'roleID', 'resortID'] }]
		}
	)

	return UserRoleModel
}
