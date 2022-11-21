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
	dataType: FILE_DATA_TYPE
	path: string
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
			dataType: {
				type: DataTypes.ENUM(...FILE_DATA_TYPES),
				allowNull: false
			},
			path: {
				type: DataTypes.TEXT,
				allowNull: false,
				unique: true
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
		}
	)

	FileModel.associate = (models) => {
		FileModel.belongsTo(models.User, { as: 'creator', foreignKey: 'createdBy' })
		FileModel.belongsTo(models.User, { as: 'editor', foreignKey: 'updatedBy' })
	}

	return FileModel
}
