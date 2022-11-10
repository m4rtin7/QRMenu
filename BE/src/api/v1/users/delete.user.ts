import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { includes } from 'lodash'
import { Op, Transaction } from 'sequelize'

import sequelize from '../../../db/models'

// utils
import { MESSAGE_TYPE, SYSTEM_USER } from '../../../utils/enums'
import ErrorBuilder from '../../../utils/ErrorBuilder'
import { isSuperAdmin, isAdmin } from '../../../utils/helper'
import { fullMessagesResponse } from '../../../utils/joiSchemas'

export const schema = Joi.object({
	headers: Joi.object({
		'x-resortID': Joi.number().integer().min(1).required()
	}),
	body: Joi.object(),
	query: Joi.object(),
	params: Joi.object({
		userID: Joi.number().integer().min(1).required()
	})
})

export const responseSchema = fullMessagesResponse

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
	let transaction: Transaction
	try {
		const { params, user: authUser, models, resortID } = req
		const { User, Permission, Role, UserRole } = models

		if (parseInt(params.userID, 10) === authUser.id) {
			throw new ErrorBuilder(409, req.t('error:Nie je možné zmazať seba samého'))
		}

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
				throw new ErrorBuilder(404, req.t('error:Používateľ nie je priradený k aktualnemu rezortu'))
			}
		}

		const user = await User.findByPk(parseInt(params.userID, 10), {
			paranoid: false,
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

		if (user.deletedAt) {
			throw new ErrorBuilder(409, req.t('error:Používateľ už bol odstránený'))
		}

		if (isAdmin(user) && !isSuperAdmin(authUser)) {
			throw new ErrorBuilder(403, req.t('error:Používateľ nemá dostatočné oprávnenie'))
		}

		transaction = await sequelize.transaction()

		await user.destroy({ deletedBy: authUser.id, transaction })

		await transaction.commit()

		const messages = [
			{
				type: MESSAGE_TYPE.SUCCESS,
				message: req.t('Používateľ bol úspešne odstránený')
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
