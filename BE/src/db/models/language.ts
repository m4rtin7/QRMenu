/* eslint-disable import/no-cycle */
import { DataTypes, Sequelize, Model } from 'sequelize'

import { UserModel } from './user'

export class LanguageModel extends Model {
	code: string
	name: string
	// foreign keys
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
}

export default (sequelize: Sequelize, modelName: string) => {
	LanguageModel.init(
		{
			code: {
				type: DataTypes.STRING(7),
				primaryKey: true
			},
			name: {
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
			},
			deletedBy: {
				type: DataTypes.BIGINT,
				allowNull: true
			}
		},
		{
			paranoid: true,
			timestamps: true,
			sequelize,
			modelName,
			tableName: 'languages'
		}
	)

	LanguageModel.associate = (models) => {
		LanguageModel.belongsTo(models.User, { as: 'creator', foreignKey: 'createdBy' })
		LanguageModel.belongsTo(models.User, { as: 'editor', foreignKey: 'updatedBy' })
		LanguageModel.belongsTo(models.User, { as: 'destructor', foreignKey: 'deletedBy' })
	}

	return LanguageModel
}
