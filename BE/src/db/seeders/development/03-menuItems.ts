import { Op } from 'sequelize'
import { map, find, compact, keyBy, uniq } from 'lodash'
import bcrypt from 'bcrypt'

import { models } from '../../models'

// utils
import { SYSTEM_USER, PERMISSION, SUPER_ADMIN_EMAIL } from '../../../utils/enums'
import { MenuItemModel } from '../../models/menuItem'

// false or console.log
const logging = false

const now = new Date()

const MenuItemsData = [
    {
      id: 1,
      name: "Schnitzel",
      category: "Main",
      subcategory: "Meat",
      desc: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      price: 9.99,
      alergens: ["a1", "a2"],
      img: "images/schnitzel.jpg"
    },
    {
      id: 2,
      name: "Pizza Salame",
      category: "Main",
      subcategory: "Pizza",
      desc: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
      price: 7.99,
      alergens: ["a1", "a2"],
      img: "images/pizza.jpg"
    },
    {
      id: 3,
      name: "Pizza Margherita",
      category: "Main",
      subcategory: "Pizza",
      desc: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
      price: 6.99,
      alergens: ["a1", "a2"],
      img: "images/pizza-margherita.jpg"
    },
    {
      id: 4,
      name: "French fries",
      category: "Extra",
      subcategory: "",
      desc: "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
      price: 3.99,
      alergens: ["a1", "a2"],
      img: "images/fries.jpg"
    },
    {
      id: 5,
      name: "Raspberry cake",
      category: "Desert",
      subcategory: "",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      price: 5.99,
      alergens: ["a1", "a2"],
      img: "images/desert1.jpeg"
    },
    {
      id: 6,
      name: "Cola",
      category: "Drink",
      subcategory: "",
      desc: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      price: 5.99,
      alergens: ["a1", "a2"],
      img: "images/cola.png"
    }
  ]

export async function up() {
	try {
		const { User, MenuItem, MenuItemCategory  } = models

		const systemUser = 
			await User.findOne({
				attributes: ['id'],
				where: {
					email: { [Op.eq]: SYSTEM_USER }
				},
				logging
			})


        const menuItemsCategories = uniq(map(MenuItemsData, (item) => ({
                name: item.category || null,
                createdBy: systemUser.id
            })))

        const createdCategories = await MenuItemCategory.bulkCreate(menuItemsCategories, {
                logging,
                applicationLogging: false
            })

		const menuItemsData = map(MenuItemsData, (item) => ({
			name: item.name || null,
            description: item.desc,
            categoryID: createdCategories.find( e => e.name === item.category).id || null,
			price: item.price || null,
			createdBy: systemUser.id
		}))

		const createdUsers = await MenuItem.bulkCreate(menuItemsData, {
			logging,
			applicationLogging: false
		})

		return Promise.resolve()
	} catch (err) {
		return Promise.reject(err)
	}
}

export function down() {
	throw new Error('Not implemented fuction')
}