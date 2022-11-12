/* eslint-disable import/no-cycle */
import { DataTypes, Sequelize, Model, UpdateOptions } from 'sequelize'
import { forEach } from 'lodash'
import path from 'path'

import { createSlug } from '../../utils/helper'
import { FILE_DATA_TYPE, FILE_DATA_TYPES } from '../../utils/enums'

import { UserModel } from './user'

export class FileModel extends Model {
	id: number
	name: string
	nameSlug: string
	dataType: FILE_DATA_TYPE
	path: string
	pathSlug: string
	size: number
	title: string
	altText: string
	description: string
	pathFileName: string
	mimeType: string

	// foreign keys
	createdBy: number
	creator: UserModel
	updatedBy: number
	editor: UserModel
	// metadata
	createdAt: string
	updatedAt: string
}

export default (sequelize: Sequelize, modelName: string) => {
	FileModel.init(
		{
			id: {
				type: DataTypes.BIGINT,
				autoIncrement: true,
				primaryKey: true,
				unique: true
			},
			name: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			nameSlug: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			dataType: {
				type: DataTypes.ENUM(...FILE_DATA_TYPES),
				allowNull: false
			},
			path: {
				type: DataTypes.TEXT,
				allowNull: false,
				unique: true
			},
			pathSlug: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			size: {
				type: DataTypes.FLOAT,
				allowNull: true
			},
			title: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			altText: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			mimeType: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			pathFileName: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			// foreign keys
			createdBy: {
				type: DataTypes.BIGINT,
				allowNull: false
			},
			updatedBy: {
				type: DataTypes.BIGINT,
				allowNull: true
			}
		},
		{
			timestamps: true,
			sequelize,
			modelName,
			tableName: 'files',
			hooks: {
				beforeValidate: (file, options) => {
					if (file.changed('name')) {
						file.nameSlug = createSlug(file.name) || null
						options.fields.push('nameSlug')
					}

					if (file.changed('path')) {
						file.pathSlug = createSlug(file.path) || null
						file.pathFileName = file.path ? path.basename(file.path) : null
						options.fields.push('pathFileName')
						options.fields.push('pathSlug')
					}
				},
				beforeCreate: (file) => {
					if (file.name) {
						file.nameSlug = createSlug(file.name)
					}

					if (file.path) {
						file.pathSlug = createSlug(file.path)
						file.pathFileName = path.basename(file.path)
					}
				},
				beforeUpdate: (file) => {
					if (file.changed('name')) {
						file.nameSlug = createSlug(file.name) || null
					}

					if (file.changed('path')) {
						file.pathSlug = createSlug(file.path) || null
						file.pathFileName = file.path ? path.basename(file.path) : null
					}
				},
				beforeBulkCreate: (files) => {
					forEach(files, (file) => {
						if (file.name) {
							file.nameSlug = createSlug(file.name)
						}

						if (file.path) {
							file.pathSlug = createSlug(file.path)
							file.pathFileName = path.basename(file.path)
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

					if (options.attributes.path !== undefined) {
						options.attributes.pathSlug = createSlug(options.attributes.path) || null
						options.attributes.pathFileName = options.attributes.path ? path.basename(options.attributes.path) : null
						options.fields.push('pathSlug')
						options.fields.push('pathFileName')
					}
				}
			}
		}
	)

	FileModel.associate = (models) => {
		FileModel.belongsTo(models.User, { as: 'creator', foreignKey: 'createdBy' })
		FileModel.belongsTo(models.User, { as: 'editor', foreignKey: 'updatedBy' })
	}

	return FileModel
}
