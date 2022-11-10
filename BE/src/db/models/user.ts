/* eslint-disable import/no-cycle */
import {
	DataTypes,
	Sequelize,
	Model,
	UpdateOptions,
	HasManyGetAssociationsMixin,
	BelongsToManySetAssociationsMixin,
	BelongsToManySetAssociationsMixinOptions,
	BelongsToManyAddAssociationsMixin,
	BelongsToManyAddAssociationsMixinOptions
} from 'sequelize'
import { forEach, join, first, upperCase } from 'lodash'

import { PERMISSION } from '../../utils/enums'
import { createSlug } from '../../utils/helper'

import { PermissionModel } from './permission'
import { RoleModel } from './role'

export class UserModel extends Model {
	id: number
	name: string
	nameSlug: string
	surname: string
	surnameSlug: string
	phone: string
	email: string
	emailSlug: string
	hash: string
	lastLoginAt: string
	lastTokenAt: string
	confirmedAt: string
	// foreign keys
	permissions: PermissionModel[] | PERMISSION[]
	roles: RoleModel[]
	createdBy: number
	// eslint-disable-next-line no-use-before-define
	creator: UserModel
	updatedBy: number
	// eslint-disable-next-line no-use-before-define
	editor: UserModel
	deletedBy: number
	// eslint-disable-next-line no-use-before-define
	destructor: UserModel
	// metadata
	createdAt: string
	updatedAt: string
	deletedAt: string
	// virtual attributes
	initials: string
	fullName: string
	inverseFullName: string
	// functions
	setPermissions: BelongsToManySetAssociationsMixin<PermissionModel, BelongsToManySetAssociationsMixinOptions>
	getPermissions: HasManyGetAssociationsMixin<PermissionModel>
	getRoles: HasManyGetAssociationsMixin<RoleModel>
	setRoles: BelongsToManySetAssociationsMixin<RoleModel, BelongsToManySetAssociationsMixinOptions>
	addRoles: BelongsToManyAddAssociationsMixin<RoleModel, BelongsToManyAddAssociationsMixinOptions>
}

export default (sequelize: Sequelize, modelName: string) => {
	UserModel.init(
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
				allowNull: true
			},
			nameSlug: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			phone: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			surname: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			surnameSlug: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			email: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			emailSlug: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			hash: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			lastLoginAt: {
				type: DataTypes.DATE,
				allowNull: true
			},
			lastTokenAt: {
				type: DataTypes.DATE,
				allowNull: true
			},
			confirmedAt: {
				type: DataTypes.DATE,
				allowNull: true
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
			},
			// virtual attributes
			initials: {
				type: DataTypes.VIRTUAL,
				get() {
					return `${first(upperCase(this.name))}${first(upperCase(this.surname))}`
				}
			},
			fullName: {
				type: DataTypes.VIRTUAL,
				get() {
					return join([this.name, this.surname], ' ').trim()
				}
			},
			inverseFullName: {
				type: DataTypes.VIRTUAL,
				get() {
					return join([this.surname, this.name], ' ').trim()
				}
			}
		},
		{
			paranoid: true,
			timestamps: true,
			sequelize,
			modelName,
			tableName: 'users',
			hooks: {
				beforeValidate: (user, options) => {
					if (user.changed('name')) {
						user.nameSlug = createSlug(user.name) || null
						options.fields.push('nameSlug')
					}

					if (user.changed('surname')) {
						user.surnameSlug = createSlug(user.surname) || null
						options.fields.push('surnameSlug')
					}

					if (user.changed('email')) {
						user.emailSlug = createSlug(user.email) || null
						options.fields.push('emailSlug')
					}
				},
				beforeCreate: (user) => {
					if (user.name) {
						user.nameSlug = createSlug(user.name)
					}

					if (user.surname) {
						user.surnameSlug = createSlug(user.surname)
					}

					if (user.email) {
						user.emailSlug = createSlug(user.email)
					}
				},
				beforeUpdate: (user) => {
					if (user.changed('name')) {
						user.nameSlug = createSlug(user.name) || null
					}

					if (user.changed('surname')) {
						user.surnameSlug = createSlug(user.surname) || null
					}

					if (user.changed('email')) {
						user.emailSlug = createSlug(user.email) || null
					}
				},
				beforeBulkCreate: (users) => {
					forEach(users, (user) => {
						if (user.name) {
							user.nameSlug = createSlug(user.name)
						}

						if (user.surname) {
							user.surnameSlug = createSlug(user.surname)
						}

						if (user.email) {
							user.emailSlug = createSlug(user.email)
						}
					})
				},
				beforeBulkUpdate: (options: UpdateOptions & { attributes: any }) => {
					options.attributes = {
						...options.attributes
					}

					if (options.attributes.name !== undefined) {
						options.attributes.nameSlug = createSlug(options.attributes.name) || null
						options.fields.push('nameSlug')
					}

					if (options.attributes.surname !== undefined) {
						options.attributes.surnameSlug = createSlug(options.attributes.surname) || null
						options.fields.push('surnameSlug')
					}

					if (options.attributes.email !== undefined) {
						options.attributes.emailSlug = createSlug(options.attributes.email) || null
						options.fields.push('emailSlug')
					}
				}
			}
		}
	)

	UserModel.associate = (models) => {
		UserModel.belongsTo(models.User, { as: 'creator', foreignKey: 'createdBy' })
		UserModel.belongsTo(models.User, { as: 'editor', foreignKey: 'updatedBy' })
		UserModel.belongsTo(models.User, { as: 'destructor', foreignKey: 'deletedBy' })

		UserModel.belongsToMany(models.Role, {
			foreignKey: 'userID',
			through: {
				model: models.UserRole,
				unique: false
			}
		})
	}

	return UserModel
}
