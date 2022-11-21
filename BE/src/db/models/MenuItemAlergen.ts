/* eslint-disable import/no-cycle */
import { DataTypes, Sequelize, Model } from 'sequelize'

export class MenuItemAllergenModel extends Model {
	menuItemID: number
	attractionID: number
	// metadata
	createdAt: string
	updatedAt: string
}

export default (sequelize: Sequelize, modelName: string) => {
	MenuItemAllergenModel.init(
		{
			menuItemID: {
				type: DataTypes.BIGINT,
				primaryKey: true
			},
			allergenID: {
				type: DataTypes.BIGINT,
				primaryKey: true
			}
		},
		{
			timestamps: true,
			sequelize,
			modelName,
			tableName: 'menuItem_allergens'
		}
	)

	MenuItemAllergenModel.associate = (models) => {
		MenuItemAllergenModel.belongsTo(models.MenuItem, { foreignKey: 'menuItemID' })
		MenuItemAllergenModel.belongsTo(models.Allergen, { foreignKey: 'allergenID' })
	}

	return MenuItemAllergenModel
}