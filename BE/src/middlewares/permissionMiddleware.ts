import { Request, Response, NextFunction } from 'express'
import { Op } from 'sequelize'
import { get, map, includes, some, join, isNaN } from 'lodash'

// utils
import { PERMISSION } from '../utils/enums'
import ErrorBuilder from '../utils/ErrorBuilder'
import { UserModel } from '../db/models/user'

export default function permissionMiddleware(allowPermissions: PERMISSION[], ownPermission = false, ownParam = 'userID') {
	return async function permission(req: Request, res: Response, next: NextFunction) {
		try {
			const { models } = req
			const { Permission, Role, UserRole } = models

			const authUser = req.user as UserModel | { apiKey: string }

			if (!authUser) {
				throw new Error('Auth user is not provide')
			}

			const resortID = parseInt(<string>req.headers['x-resortid'], 10)

			req.resortID = resortID

			if (authUser instanceof UserModel) {
				const directPermissions = await authUser.getPermissions()

				// Check if user is superadmin
				if (includes(map(directPermissions, 'key'), PERMISSION.SUPER_ADMIN)) {
					// check if user has grant permission
					authUser.permissions = [PERMISSION.SUPER_ADMIN]
					return next()
				}

				if (!resortID || isNaN(resortID)) {
					throw new ErrorBuilder(403, req.t('error:Nedefinovaný resort'))
				}

				// get user roles
				const roles = await UserRole.findAll({
					attributes: ['roleID'],
					where: {
						[Op.and]: [
							{
								userID: {
									[Op.eq]: authUser.id
								}
							},
							{
								resortID: {
									[Op.eq]: resortID
								}
							}
						]
					}
				})
				const rolesID = map(roles, 'roleID')

				// get merged permissions from user.permissions and user.roles.permissions
				const permissions = await Permission.findAll({
					attributes: ['key'],
					include: [
						{
							model: Role,
							attributes: []
						}
					],
					where: {
						'$roles.id$': { [Op.in]: rolesID }
					}
				})

				const permissionEnums = map(permissions, 'key')

				// if paramID is equal to user id then user has permission manipulate on own data
				const reqOwnParamID = get(req, `params.${ownParam}`)

				// eslint-disable-next-line eqeqeq
				if (ownPermission === true && reqOwnParamID == authUser.id) {
					authUser.permissions = permissionEnums
					return next()
				}

				const hasPermission = some(permissionEnums, (permissionName) => includes(allowPermissions, permissionName))

				// check if user has grant permission
				if (hasPermission) {
					authUser.permissions = permissionEnums
					return next()
				}
			} else if (req.method === 'GET' && authUser.apiKey) {
				return next()
			}
			throw new ErrorBuilder(403, req.t('error:Používateľovi chýbajú oprávnenia', { allowPermissions: join(allowPermissions, ', ') }))
		} catch (e) {
			return next(e)
		}
	}
}
