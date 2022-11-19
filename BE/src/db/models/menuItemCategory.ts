import { DataTypes, Model, Sequelize } from 'sequelize'

export class MenuItemCategoryModel extends Model {
	id: number
	name: string
}
export default (sequelize: Sequelize, modelName: string) => {
	MenuItemCategoryModel.init(
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
			}
		},
		{
			timestamps: true,
			sequelize,
			modelName,
			tableName: 'MenuItemCategory'
		}
	)

	return MenuItemCategoryModel
}