import { Op } from 'sequelize'
import { map, find, compact, keyBy, uniq } from 'lodash'
import bcrypt from 'bcrypt'

import { models } from '../../models'

// utils
import { SYSTEM_USER, PERMISSION, SUPER_ADMIN_EMAIL, DAYS } from '../../../utils/enums'
import { MenuItemModel } from '../../models/menuItem'
import { IOpeningHours } from '../../models/restaurant'

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

  const testRestaurant = {
    city: "Bratislava",
    address: "Zochova 45",
    zipCode: "03108",
    phone: "+421906785",
    contactPerson: "Robo Struk",
    websiteURL: "https://qrmenu-asdit.herokuapp.com/1",
    menuURL: "https://qrmenu-asdit.herokuapp.com/1",
    // foreign keys
    ownedBy: 4
  }

export async function up() {
	try {
		const { User, MenuItem,  Restaurant } = models

		const systemUser = 
			await User.findOne({
				attributes: ['id'],
				where: {
					email: { [Op.eq]: SYSTEM_USER }
				},
				logging
			})

      const restaurant = await Restaurant.create(testRestaurant, {
        logging,
        applicationLogging: false
    })

    restaurant.openingHours = seedReportParseOpeningHours(["9:00","15:00"]);


        const menuItemsCategories = uniq(map(MenuItemsData, (item) => ({
                name: item.category || null,
                createdBy: systemUser.id
            })))

        // const createdCategories = await MenuItemCategory.bulkCreate(menuItemsCategories, {
        //         logging,
        //         applicationLogging: false
        //     })

		const menuItemsData = map(MenuItemsData, (item) => ({
			name: item.name || null,
            description: item.desc,
            category: item.category,
            subcategory: item.subcategory,
			price: item.price || null,
      restaurantID: restaurant.id,
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

export const seedReportParseOpeningHours = (openingHours: string[]): IOpeningHours[] => {
  if (openingHours == null || openingHours.length == 0) {
      return null;
  }

  const parseTimeItem = (timeItem: string): string => {
      const splitArr = timeItem.split(':');
      let hours = Number(splitArr[0]);

      if (splitArr[1].indexOf('PM') > -1) {
          hours += 12;
      }

      let minutes = Number(splitArr[1].replace('AM', '').replace('PM', '').trim());
      return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
  }

  const timeFrom = parseTimeItem(openingHours[0]);
  const timeTo = parseTimeItem(openingHours[1]);

  return DAYS.map((day) => ({
      day,
      timeRanges: [
          {
              timeFrom,
              timeTo
          }
      ]
  }))
}
