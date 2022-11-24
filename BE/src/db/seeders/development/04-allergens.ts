import { Op } from 'sequelize'
import { map, find, compact, keyBy, uniq, forEach } from 'lodash'
import bcrypt from 'bcrypt'

import { models } from '../../models'

// utils
import { SYSTEM_USER, PERMISSION, SUPER_ADMIN_EMAIL, DAYS } from '../../../utils/enums'
import { MenuItemModel } from '../../models/menuItem'
import { IOpeningHours } from '../../models/restaurant'
import MenuItemAlergen from '../../models/MenuItemAlergen'

// false or console.log
const logging = false

const now = new Date()

const AllergensData = [
    {
      id: 1,
      name: "Obilniny obsahujúce lepok",
      description: " pšenica, raž, jačmeň, ovos, špalda, kamut alebo ich hybridné odrody",
    },
    {
      id: 2,
      name: "Kôrovce",
    },
    {
      id: 3,
      name: "Vajcia",
    },
    {
      id: 4,
      name: "Ryby",
    },
    {
      id: 5,
      name: "Arašidy",
    },
    {
      id: 6,
      name: "Sójové zrná",
    },
    {
        id: 7,
        name: "Mlieko",
    },
    {
        id: 8,
        name: "Orechy",
        description:"Mandle, lieskové orechy, vlašské orechy, kešu, pekanové orechy, para orechy, pistácie, makadamové orechy a výrobky z nich."
    },
    {
        id: 9,
        name: "Zeler",
    },
    {
        id: 10,
        name: "Horčica",
    },
    {
        id: 11,
        name: "Sezamové semená",
    },
    {
        id: 12,
        name: "Oxid siričitý a siričitany",
    },
    {
        id: 13,
        name: "Vlčí bôb",
    },
    {
        id: 14,
        name: "Mäkkýše",
    }
  ]

export async function up() {
	try {
		const { User, MenuItem, MenuItemAllergen, Allergen } = models

        let menuItem = await MenuItem.findAll({
			attributes: ['id'],
		});

        const menuItemAllergenData: any[] = []

		const systemUser = 
			await User.findOne({
				attributes: ['id'],
				where: {
					email: { [Op.eq]: SYSTEM_USER }
				},
				logging
			})

        const allergensData = AllergensData.map(obj => ({ ...obj, createdBy: systemUser.id }))

        const createdAllergens = await Allergen.bulkCreate(allergensData, {
                logging,
                applicationLogging: false
            })

            forEach(menuItem, (item) => {
                menuItemAllergenData.push({
                menuItemID: item.id,
                allergenID: createdAllergens[4].id,
            })
            menuItemAllergenData.push({
                menuItemID: item.id,
                allergenID: createdAllergens[1].id,
            })
        }
    )

		return Promise.resolve()
	} catch (err) {
		return Promise.reject(err)
	}
}

export function down() {
	throw new Error('Not implemented fuction')
}