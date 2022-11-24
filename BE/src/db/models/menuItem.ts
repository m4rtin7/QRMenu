import { DataTypes, Model, Sequelize, UpdateOptions } from 'sequelize'
import { ILocalizedText } from '../../types/interfaces'
import { AllergenModel } from './allergen'

export class MenuItemModel extends Model {
	id: number
	name: string
	price: number
	description: number
	informationLocalization: ILocalizedText
    nameLocalization: ILocalizedText
	allergens: AllergenModel[]
}
export default (sequelize: Sequelize, modelName: string) => {
	MenuItemModel.init(
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
			price: {
				type: DataTypes.DECIMAL,
				allowNull: false
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			// foreign keys
			createdBy: {
				type: DataTypes.BIGINT,
				allowNull: false
			},
			descriptionLocalization: {
				type: DataTypes.JSONB,
				allowNull: true
			},
            nameLocalization: {
				type: DataTypes.JSONB,
				allowNull: true
			}
		},
		{
			timestamps: true,
			sequelize,
			modelName,
			tableName: 'MenuItem'
		}
	)

	MenuItemModel.associate = (models) => {
		MenuItemModel.belongsTo(models.User, { as: 'creator', foreignKey: 'createdBy' })
		MenuItemModel.belongsTo(models.Restaurant, { foreignKey: 'restaurantID' })
		MenuItemModel.belongsTo(models.MenuItemCategory, { foreignKey: 'categoryID' })
		MenuItemModel.belongsTo(models.File, { as: 'image', foreignKey: 'imageID' })
		MenuItemModel.belongsToMany(models.Allergen, {
			foreignKey: 'menuItemID',
			through: {
				model: models.MenuItemAllergen,
				unique: true
			}
		})
	}

	return MenuItemModel
}
