import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { Op, Transaction } from 'sequelize'

import sequelize from '../../../db/models'

// utils
import { MESSAGE_TYPE } from '../../../utils/enums'
import ErrorBuilder from '../../../utils/ErrorBuilder'
import { fullMessagesResponse } from '../../../utils/joiSchemas'

export const schema = Joi.object({
	headers: Joi.object({
		'x-resortID': Joi.number().integer().min(1).required()
	}),
	body: Joi.object(),
	query: Joi.object(),
	params: Joi.object({
		restaurantID: Joi.number().integer().min(1).required()
	})
})

export const responseSchema = fullMessagesResponse

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
	let transaction: Transaction
	try {
		const { params, user: authUser, models, resortID } = req
		const { Restaurant, Attraction } = models

		const restaurant = await Restaurant.findByPk(parseInt(params.restaurantID, 10), {
			paranoid: false,
			include: [
				{
					model: Attraction,
					where: {
						resortID: {
							[Op.eq]: resortID
						}
					}
				}
			]
		})

		if (!restaurant) {
			throw new ErrorBuilder(404, req.t('error:Reštaurácia nebola nájdená'))
		}

		if (restaurant.deletedAt) {
			throw new ErrorBuilder(409, req.t('error:Reštaurácia už bola odstránená'))
		}

		transaction = await sequelize.transaction()

		await restaurant.destroy({ deletedBy: authUser.id, transaction })

		await transaction.commit()

		const messages = [
			{
				type: MESSAGE_TYPE.SUCCESS,
				message: req.t('Reštaurácia bola úspešne odstránená')
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
