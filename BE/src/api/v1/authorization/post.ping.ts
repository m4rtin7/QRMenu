import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import config from 'config'
import { Transaction } from 'sequelize'
import sequelize from '../../../db/models'

// utils
import { createJwt } from '../../../utils/auth'

// types
import { IPassportConfig } from '../../../types/interfaces'

const passportConfig: IPassportConfig = config.get('passport')

export const schema = Joi.object({
	body: Joi.object(),
	query: Joi.object(),
	params: Joi.object()
})

export const responseSchema = Joi.object({
	accessToken: Joi.string().required()
})

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
	let transaction: Transaction
	try {
		const { user: authUser } = req
		transaction = await sequelize.transaction()

		const [accessToken] = await Promise.all([
			createJwt({ uid: authUser.id }, { audience: passportConfig.jwt.api.audience, expiresIn: passportConfig.jwt.api.exp }),
			// set lastToken timestamp
			authUser.update(
				{
					lastTokenAt: new Date()
				},
				{
					transaction
				}
			)
		])

		await transaction.commit()

		return res.json({ accessToken })
	} catch (error) {
		if (transaction) {
			await transaction.rollback()
		}

		return next(error)
	}
}
