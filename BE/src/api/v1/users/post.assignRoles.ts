import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { Op, Transaction } from 'sequelize'
import { forEach, includes, map, uniq, isEqual } from 'lodash'

import sequelize from '../../../db/models'

// utils
import ErrorBuilder from '../../../utils/ErrorBuilder'
import { MESSAGE_TYPE, PERMISSION, PERMISSIONS, SYSTEM_USER } from '../../../utils/enums'
import { isSuperAdmin, isAdmin, includesRoleWithPermission } from '../../../utils/helper'
import { fullMessagesResponse } from '../../../utils/joiSchemas'
import role, { RoleModel } from '../../../db/models/role'
import { PermissionModel } from '../../../db/models/permission'

export const schema = Joi.object({
	headers: Joi.object({
		'x-resortID': Joi.number().integer().min(1).required()
	}),
	body: Joi.object({
		resorts: Joi.array()
			.items({
				resortID: Joi.number().integer().min(1).required(),
				roleID: Joi.number().integer().min(1).required()
			})
			.required(),
		permissions: Joi.array().items(Joi.string().valid(...PERMISSIONS)).required()
	}),
	query: Joi.object(),
	params: Joi.object({
		userID: Joi.number().integer().min(1).required()
	})
})

export const responseSchema = fullMessagesResponse

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
	let transaction: Transaction
	try {
		const { params, body, user: authUser, models } = req
		const { User, Role, Permission, UserRole } = models

		const user = await User.findByPk(parseInt(params.userID, 10), {
			include: [
				{
					model: Role,
					include: [
						{
							model: Permission,
							attributes: ['id', 'key']
						}
					]
				},
				{
					model: Permission,
					attributes: ['key', 'groupKey'],
					through: {
						attributes: []
					}
				}
			]
		})

		if (!user || includes([SYSTEM_USER], user.email)) {
			throw new ErrorBuilder(404, req.t('error:Používateľ nebol nájdený'))
		}

		const currentUserPerm: PERMISSION[] = user.permissions.map(p => (p as PermissionModel).key);
		forEach(user.roles, (userRole) => {
			forEach(userRole.permissions, (permission) => {
				currentUserPerm.push(permission.key)
			})
		})

		const currentUser = {
			permissions: currentUserPerm,
			roles: [] as RoleModel[]
		}

		if (user.id === authUser.id && !isSuperAdmin(currentUser)) {
			throw new ErrorBuilder(409, req.t('error:Používateľ nemôže meniť roly sám sebe'))
		}

		if (isAdmin(currentUser) && !isSuperAdmin(authUser)) {
			throw new ErrorBuilder(403, req.t('error:Upraviť role administrátorovi môže len superadmin'))
		}
		const uniqRoleIDs: number[] = uniq(map(body.resorts, 'roleID'))
		const uniqResortIDs: number[] = uniq(map(body.resorts, 'resortID'))

		// check if all provided role IDs exist
		const [roles] = await Promise.all([
			Role.findAll({
				attributes: ['id'],
				where: {
					id: { [Op.in]: uniqRoleIDs }
				},
				include: [
					{
						model: Permission,
						attributes: ['id', 'key']
					}
				]
			})
		])

		if (roles.length !== uniqRoleIDs.length) {
			throw new ErrorBuilder(404, req.t('error:Rola nebola nájdená'))
		}

		// verify admin permission in every role and verify if user has right to do operation
		if (includesRoleWithPermission(roles, PERMISSION.ADMIN) && !isSuperAdmin(authUser)) {
			throw new ErrorBuilder(403, req.t('error:Rolu s administrátorským oprávnením môže len superadmin'))
		}

		// verify generic permissions
		const newPermissions: PERMISSION[] = (body.permissions || []);
		const oldPermissions = user.permissions.map(p => (p as PermissionModel).key);
		newPermissions.sort();
		oldPermissions.sort();
		const permissionsEqual = isEqual(newPermissions, oldPermissions);

		if (!permissionsEqual && !isSuperAdmin(authUser)) {
			throw new ErrorBuilder(403, req.t('error:Upraviť generické oprávnenia používateľovi môže len superadmin'))
		}

		transaction = await sequelize.transaction()

		const resortRoles = [] as {
			userID: number
			resortID: number
			roleID: number
		}[]

		const resortsArray = body.resorts;
		resortsArray.forEach((resort: any) => {
			resortRoles.push({
				resortID: resort.resortID,
				roleID: resort.roleID,
				userID: user.id
			})
		});

		await UserRole.destroy({ transaction, where: { userID: { [Op.eq]: user.id } } })
		await UserRole.bulkCreate(resortRoles, { transaction })

		if (!permissionsEqual) {
			const permissions = await Permission.findAll({
				attributes: ['id', 'key'],
				order: [['id', 'ASC']]
			})

			const userPermissionsData = newPermissions.map(p => {
				return {
					userID: user.id,
					permissionID: permissions.find(perm => perm.key == p).id
				}
			})
				
		}

		await transaction.commit()

		const messages = [
			{
				message: req.t('Roly boli úspešne priradené'),
				type: MESSAGE_TYPE.SUCCESS
			}
		]

		return res.json({ messages })
	} catch (error) {
		if (transaction) {
			await transaction.rollback()
		}
		return next(error)
	}
}


