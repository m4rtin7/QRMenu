/* eslint-disable import/no-cycle */
import { DataTypes, Sequelize, Model, UpdateOptions } from 'sequelize'
import { forEach } from 'lodash'

import { createSlug } from '../../utils/helper'

export class LocalizationValueModel extends Model {
	languageCode: string
	value: string
	valueSlug: string
	// foreign keys
	localizationID: number
	// metadata
	createdAt: string
	updatedAt: string
}

export default (sequelize: Sequelize, modelName: string) => {
	LocalizationValueModel.init(
		{
			localizationID: {
				type: DataTypes.BIGINT,
				primaryKey: true
			},
			languageCode: {
				type: DataTypes.STRING(7),
				primaryKey: true
			},
			value: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			valueSlug: {
				type: DataTypes.TEXT,
				allowNull: false
			}
		},
		{
			timestamps: true,
			sequelize,
			modelName,
			tableName: 'localization_values',
			hooks: {
				beforeValidate: (localizationValue, options) => {
					if (localizationValue.changed('value')) {
						localizationValue.valueSlug = createSlug(localizationValue.value) || null
						options.fields.push('valueSlug')
					}
				},
				beforeCreate: (localizationValue) => {
					if (localizationValue.value) {
						localizationValue.valueSlug = createSlug(localizationValue.value)
					}
				},
				beforeUpdate: (localizationValue) => {
					if (localizationValue.changed('value')) {
						localizationValue.valueSlug = createSlug(localizationValue.value) || null
					}
				},
				beforeBulkCreate: (localizationValues) => {
					forEach(localizationValues, (localizationValue) => {
						if (localizationValue.value) {
							localizationValue.valueSlug = createSlug(localizationValue.value)
						}
					})
				},
				beforeBulkUpdate: (options: UpdateOptions & { attributes: any }) => {
					options.attributes = {
						...options.attributes
					}

					if (options.attributes.value !== undefined) {
						options.attributes.valueSlug = createSlug(options.attributes.value) || null
						options.fields.push('valueSlug')
					}
				}
			}
		}
	)

	LocalizationValueModel.associate = (models) => {
	}

	return LocalizationValueModel
}
