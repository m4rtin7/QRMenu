import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { Transaction } from 'sequelize'

import sequelize from '../../../db/models'

// utils
import { MESSAGE_TYPE } from '../../../utils/enums'
import { createHash } from '../../../utils/auth'
import { fullMessagesResponse, passwordRequest } from '../../../utils/joiSchemas'

export const schema = Joi.object({
	body: Joi.object({
		name: Joi.string().max(255).required(),
		surname: Joi.string().max(255).required(),
		password: passwordRequest
	}),
	query: Joi.object(),
	params: Joi.object()
})

export const responseSchema = fullMessagesResponse

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
	let transaction: Transaction
	try {
		const { body, user: authUser } = req

		const password = await createHash(body.password)

		transaction = await sequelize.transaction()

		await authUser.update(
			{
				name: body.name,
				surname: body.surname,
				hash: password,
				confirmedAt: new Date(),
				updatedBy: authUser.id
			},
			{
				transaction
			}
		)

		await transaction.commit()

		const messages = [
			{
				message: req.t('translation:Používateľ bol úspešne vytvorený'),
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
