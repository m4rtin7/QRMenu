import { forEach, keyBy } from 'lodash'

import { models } from '../../models'

// utils
import { PERMISSION } from '../../../utils/enums'
import { rolesSystem } from '../../../utils/roleUtil'

// false or console.log
const logging = false



export async function up() {
	try {
		const { Role, RolePermission, Permission } = models

		const createdRoles = await Role.bulkCreate(rolesSystem, {
			logging,
			applicationLogging: false
		})


		const keyedRoles = keyBy(createdRoles, 'name') 
        const allPermissions = await Permission.findAll({
			attributes: ['id', 'key'],
		});

		const nonSuperAdminPermissions = allPermissions.filter(p => p.key != PERMISSION.SUPER_ADMIN);
		const userPermissions = nonSuperAdminPermissions.filter(p => p.key != PERMISSION.ADMIN);
		const rolePermissionsData: any[] = []

		forEach(allPermissions, (permission) => {
			rolePermissionsData.push({
				roleID: keyedRoles.SUPERADMIN?.id || null,
				permissionID: permission.id
			})
		});

        forEach(nonSuperAdminPermissions, (permission) => { 
			rolePermissionsData.push({
				roleID: keyedRoles.ADMINISTRATOR?.id || null,
				permissionID: permission.id
			})
		})

		forEach(userPermissions, (permission) => { 
			rolePermissionsData.push({
				roleID: keyedRoles.USER?.id || null,
				permissionID: permission.id
			})
		})

		await RolePermission.bulkCreate(rolePermissionsData, {
			logging,
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
