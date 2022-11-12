import { Op } from 'sequelize'
import { filter, find, forEach, keyBy } from 'lodash'

import { models } from '../../models'

// utils
import { SYSTEM_USER, PERMISSION } from '../../../utils/enums'

// false or console.log
const logging = false


export async function up() {
	try {
		const { User, Role, UserRole, RolePermission, Permission } = models

		const allRoles = await Role.findAll();
		const allUserRoles = (await UserRole.findAll()).map(p => p.userID);
		const keyedRoles = keyBy(allRoles, 'name')
		

		let usersWithoutSystemUser = await User.findAll({
			attributes: ['id', 'email'],
			where: {
				email: { [Op.ne]: SYSTEM_USER }
			},
			order: [['id', 'ASC']],
			include: [

			]
		});

		usersWithoutSystemUser = usersWithoutSystemUser.filter(p => allUserRoles.indexOf(p.id) == -1);

		const adminDevelopmentUsers = filter(usersWithoutSystemUser, (user) => !user.email.startsWith('test') && !user.email.startsWith('sadmin') && user.email !== 'kello@tmr.sk')
		const userRolesData: any[] = []

		// assign first role (ADMINISTRATOR) to all admin development users for all resorts
		forEach(adminDevelopmentUsers, (adminDevelopmentUser) => {

				userRolesData.push({
					userID: adminDevelopmentUser.id,
					roleID: keyedRoles.ADMINISTRATOR?.id || null,
				})
		})

		await UserRole.bulkCreate(userRolesData, {
			applicationLogging: false
		})

		return await Promise.resolve()
	} catch (err) {
		console.log(err)
		return Promise.reject(err)
	}
}

export function down() {
	throw new Error('Not implemented fuction')
}
