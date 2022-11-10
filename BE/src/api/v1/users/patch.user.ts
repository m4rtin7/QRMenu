import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { Op } from 'sequelize'
import { includes, some } from 'lodash'
import sequelize from '../../../db/models'

// utils
import { MESSAGE_TYPE, PERMISSION, SYSTEM_USER } from '../../../utils/enums'
import ErrorBuilder from '../../../utils/ErrorBuilder'
import { isAdmin, isSuperAdmin } from '../../../utils/helper'
import { emailRequest, fullMessagesResponse } from '../../../utils/joiSchemas'

// NOTE: schema is a function cause of using i18next in it
export const schema = () =>
	Joi.object({
		headers: Joi.object({
			'x-resortID': Joi.number().integer().min(1).required()
		}),
		body: Joi.object({
			name: Joi.string().max(255).required().allow(null),
			surname: Joi.string().max(255).required().allow(null),
			email: emailRequest().required(),
			phone: Joi.string().max(100).required().allow(null)
		}),
		query: Joi.object(),
		params: Joi.object({
			userID: Joi.number().integer().min(1).required()
		})
	})

export const responseSchema = fullMessagesResponse

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { params, body, user: authUser, models, resortID } = req
		const { User, Permission, Role, UserRole } = models

		if (!isSuperAdmin(authUser)) {
			// get user roles
			const assignedToSameResort = await UserRole.count({
				attributes: [],
				where: {
					[Op.and]: [
						{
							userID: {
								[Op.eq]: parseInt(params.userID, 10)
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
			if (assignedToSameResort === 0) {
				throw new ErrorBuilder(409, req.t('error:Používateľ nie je priradený k aktualnemu rezortu'))
			}
		}

		const user = await User.findByPk(parseInt(params.userID, 10), {
			include: [
				{
					model: Permission,
					attributes: ['id', 'key']
				},
				{
					model: Role,
					include: [
						{
							model: Permission,
							attributes: ['id', 'key']
						}
					]
				}
			]
		})

		if (!user || includes([SYSTEM_USER], user.email)) {
			throw new ErrorBuilder(404, req.t('error:Používateľ nebol nájdený'))
		}

		// regular user (no admin/superadmin) cannot change email (his email or emails of other users)
		// throw error if email has changed and authUser is not admin or superAdmin
		if (user.email !== body.email && !isAdmin(authUser) && !isSuperAdmin(authUser)) {
			throw new ErrorBuilder(403, req.t('error:Používateľ nemá oprávnenie na zmenu emailovej adresy'))
		}

		// admin user can change his email and email of regular users (he cannot change email of other admin/superadmin users)
		// throw error if email has changed and user is admin but not superadmin and changing user is admin or superadmin and authUser is not chaning himself
		if (user.email !== body.email && isAdmin(authUser) && !isSuperAdmin(authUser) && (isAdmin(user) || isSuperAdmin(user)) && authUser.id !== user.id) {
			throw new ErrorBuilder(403, req.t('error:Používateľ nemá oprávnenie na zmenu emailovej adresy'))
		}

		if (isAdmin(user) && !isSuperAdmin(authUser) && authUser.id !== user.id) {
			throw new ErrorBuilder(403, req.t('error:Používateľ nemá dostatočné oprávnenie'))
		}

		// check if active user with same email exists
		const sameEmailUser = await User.findOne({
			attributes: ['id'],
			where: {
				[Op.and]: [
					{
						email: { [Op.eq]: body.email }
					},
					{
						id: { [Op.not]: user.id }
					}
				]
			}
		})
		if (sameEmailUser) {
			throw new ErrorBuilder(409, req.t('error:Používateľ so zadaným emailom už existuje'))
		}

		const hasPermission = some(authUser.permissions, (permission) => includes([PERMISSION.SUPER_ADMIN, PERMISSION.ADMIN, PERMISSION.USER_EDIT], permission))

		// TODO: toto je dobra podmienka? nechcelo mi to zmenit usera s rovnakym id tak som tam pridal toto
		if (authUser.id !== parseInt(params.userID, 10) && !hasPermission) {
			throw new ErrorBuilder(403, req.t('error:Používateľ nemá dostatočné oprávnenie'))
		}

		const transaction = await sequelize.transaction()

		await user.update(
			{
				name: body.name,
				surname: body.surname,
				email: body.email,
				phone: body.phone,
				updatedBy: authUser.id
			},
			{ transaction }
		)
		await transaction.commit()
		const messages = [
			{
				type: MESSAGE_TYPE.SUCCESS,
				message: req.t('Používateľ bol úspešne upravený')
			}
		]

		return res.json({ messages })
	} catch (error) {
		return next(error)
	}
}
