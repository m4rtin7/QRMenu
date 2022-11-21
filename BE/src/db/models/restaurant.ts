import { DataTypes, HasOneGetAssociationMixin, Model, Sequelize } from 'sequelize'

import { ILocalizedText, ITimeRange } from '../../types/interfaces'
import { DAY } from '../../utils/enums'
import { FileModel } from './file'
import { UserModel } from './user'

export interface IOpeningHours {
    day: DAY
    note?: string
    timeRanges: ITimeRange[]
}

export class RestaurantModel extends Model {
	id: number
	city: string
	address: string
	zipCode: string
	phone: string
	contactPerson: string
	websiteURL: string
	menuURL: string
	logo: FileModel
	openingHours: IOpeningHours[]

	// foreign keys
	ownedBy: number
	// metadata
	createdAt: string
	updatedAt: string
	deletedAt: string
}

export default (sequelize: Sequelize, modelName: string) => {
	RestaurantModel.init(
		{
			id: {
				type: DataTypes.BIGINT,
				allowNull: false,
				primaryKey: true,
				unique: true,
				autoIncrement: true
			},
			city: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			address: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			zipCode: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			phone: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			openingHours: {
                type: DataTypes.JSONB,
                allowNull: true
            },
			contactPerson: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			websiteURL: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			menuURL: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			// foreign keys
			ownedBy: {
				type: DataTypes.BIGINT,
				allowNull: false
			}
		},
		{
			timestamps: true,
			sequelize,
			modelName,
			tableName: 'restaurants'
		}
	)

	RestaurantModel.associate = (models) => {
		RestaurantModel.belongsTo(models.User, { as: 'owner', foreignKey: 'ownedBy' })
		RestaurantModel.belongsTo(models.File, { as: 'logo', foreignKey: 'logoID' })
	}

	return RestaurantModel
}