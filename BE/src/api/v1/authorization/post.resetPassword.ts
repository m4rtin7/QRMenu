import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { Transaction } from 'sequelize'

import sequelize from '../../../db/models'

// utils
import { MESSAGE_TYPE } from '../../../utils/enums'
import { createHash } from '../../../utils/auth'
import { passwordRequest } from '../../../utils/joiSchemas'

export const schema = Joi.object({
	body: Joi.object({
		password: passwordRequest
	}),
	query: Joi.object(),
	params: Joi.object()
})

export const responseSchema = Joi.object({
	messages: Joi.array()
		.items(
			Joi.object({
				message: Joi.string().required(),
				type: Joi.string().valid(MESSAGE_TYPE.SUCCESS).required()
			}).required()
		)
		.required()
})

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
	let transaction: Transaction
	try {
		const { body, user: authUser } = req

		const password = await createHash(body.password)

		transaction = await sequelize.transaction()

		await authUser.update(
			{
				hash: password,
				updatedBy: authUser.id
			},
			{
				transaction
			}
		)

		await transaction.commit()

		const messages = [
			{
				message: req.t('translation:Heslo bolo úspešne zmenené'),
				type: MESSAGE_TYPE.SUCCESS
			}
		]

		return res.json({ messages })
	} catch (err) {
		if (transaction) {
			await transaction.rollback()
		}
		return next(err)
	}
}
