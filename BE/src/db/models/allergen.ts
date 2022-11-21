/* eslint-disable import/no-cycle */
import { DataTypes, Sequelize, Model } from 'sequelize'

import { UserModel } from './user'
import { ATTRACTION_TYPES, ATTRACTION_TYPE } from '../../utils/enums'
import { ILocalizedText } from '../../types/interfaces'

export class AllergenModel extends Model {
	id: number
    name: string
    descripton: string
	// foreign keys
	nameLocalization: ILocalizedText
	createdBy: number

	// metadata
	createdAt: string
	updatedAt: string
	deletedAt: string
}

export default (sequelize: Sequelize, modelName: string) => {
	AllergenModel.init(
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
				allowNull: false
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			// foreign keys
			nameLocalization: {
				type: DataTypes.JSONB,
				allowNull: true
			},
			createdBy: {
				type: DataTypes.BIGINT,
				allowNull: false
			},
		},
		{
			paranoid: true,
			timestamps: true,
			sequelize,
			modelName,
			tableName: 'allergens'
		}
	)

	AllergenModel.associate = (models) => {
		AllergenModel.belongsTo(models.User, { as: 'creator', foreignKey: 'createdBy' })

		AllergenModel.belongsToMany(models.MenuItem, {
			foreignKey: 'allergenID',
			through: {
				model: models.MenuItemAllergen,
				unique: true
			}
		})
	}

	return AllergenModel
}