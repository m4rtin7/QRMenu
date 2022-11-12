/* eslint-disable import/no-cycle */
import {
	Sequelize,
	DataTypes,
	Model,
	BelongsToManyAddAssociationMixin,
	BelongsToManyAddAssociationMixinOptions,
	BelongsToManyRemoveAssociationMixin,
	BelongsToManyRemoveAssociationMixinOptions,
	BelongsToManySetAssociationsMixin,
	BelongsToManySetAssociationsMixinOptions,
	HasManyGetAssociationsMixin
} from 'sequelize'

import { PermissionModel } from './permission'
import { UserModel } from './user'

export class RoleModel extends Model {
	id: number
	name: string
	// foreign keys
	users: UserModel[]
	permissions: PermissionModel[]
	createdBy: number
	creator: UserModel
	updatedBy: number
	editor: UserModel
	deletedBy: number
	destructor: UserModel
	// metadata
	createdAt: string
	updatedAt: string
	deletedAt: string
	// functions
	addUser: BelongsToManyAddAssociationMixin<UserModel, BelongsToManyAddAssociationMixinOptions>
	removeUser: BelongsToManyRemoveAssociationMixin<UserModel, BelongsToManyRemoveAssociationMixinOptions>
	getPermissions: HasManyGetAssociationsMixin<PermissionModel>
	setPermissions: BelongsToManySetAssociationsMixin<PermissionModel, BelongsToManySetAssociationsMixinOptions>
}

export default (sequelize: Sequelize, modelName: string) => {
	RoleModel.init(
		{
			id: {
				type: DataTypes.BIGINT,
				allowNull: false,
				primaryKey: true,
				unique: true,
				autoIncrement: true
			},
			name: {
				type: DataTypes.TEXT,
				allowNull: false,
				unique: true
			},
			// foreign keys
			createdBy: {
				type: DataTypes.BIGINT,
				allowNull: false
			},
			updatedBy: {
				type: DataTypes.BIGINT,
				allowNull: true
			},
			deletedBy: {
				type: DataTypes.BIGINT,
				allowNull: true
			}
		},
		{
			timestamps: true,
			sequelize,
			modelName,
			tableName: 'roles'
		}
	)

	RoleModel.associate = (models) => {
		RoleModel.belongsTo(models.User, { as: 'creator', foreignKey: 'createdBy' })
		RoleModel.belongsTo(models.User, { as: 'editor', foreignKey: 'updatedBy' })
		RoleModel.belongsTo(models.User, { as: 'destructor', foreignKey: 'deletedBy' })

		RoleModel.belongsToMany(models.User, {
			foreignKey: 'roleID',
			through: {
				model: models.UserRole,
				unique: false
			}
		})
		RoleModel.belongsToMany(models.Permission, {
			foreignKey: 'roleID',
			through: {
				model: models.RolePermission,
				unique: true
			}
		})
	}
	return RoleModel
}
