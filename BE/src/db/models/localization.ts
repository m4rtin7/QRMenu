/* eslint-disable import/no-cycle */
import { DataTypes, Sequelize, Model } from 'sequelize'

import { LocalizationValueModel } from './localizationValue'

export class LocalizationModel extends Model {
	id: number
	// foreign keys
	values: LocalizationValueModel[]
	// metadata
	createdAt: string
	updatedAt: string
}

export default (sequelize: Sequelize, modelName: string) => {
	LocalizationModel.init(
		{
			id: {
				type: DataTypes.BIGINT,
				autoIncrement: true,
				primaryKey: true,
				unique: true
			}
		},
		{
			timestamps: true,
			sequelize,
			modelName,
			tableName: 'localizations'
		}
	)

	LocalizationModel.associate = (models) => {
	}

	return LocalizationModel
}
