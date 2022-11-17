import { Model } from 'sequelize'

export default class MenuItemModel extends Model {
	id: number
	name: string
	price: number
	desc: string
	categoryId: number
}
