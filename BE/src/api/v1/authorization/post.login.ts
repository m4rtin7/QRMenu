import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import config from 'config'
import { Op, Transaction } from 'sequelize'

import sequelize from '../../../db/models'

// utils
import { createJwt } from '../../../utils/auth'

// types
import { IPassportConfig } from '../../../types/interfaces'
import { getUserById, responseSchema as userModelSchema } from '../users/get.user'
import { UserModel } from '../../../db/models/user'

const passportConfig: IPassportConfig = config.get('passport')

export const schema = Joi.object({
	body: Joi.object({
		email: Joi.string().max(255).required(),
		password: Joi.string().max(255).required(),
		//extendedProfile: Joi.boolean().optional()
	}),
	query: Joi.object(),
	params: Joi.object()
})

export const responseSchema = Joi.object({
	accessToken: Joi.string().required(),
	extendedProfile: userModelSchema.optional(),
	profile: Joi.object({
		id: Joi.number().integer().min(1).required(),
		fullname: Joi.string().required(),
		restaurant: Joi.object({
            id: Joi.number().integer().min(1).required(),
            city: Joi.string().required(),
            address: Joi.string().required(),
            zipCode: Joi.string().required(),
            phone: Joi.string().required(),
            contactPerson: Joi.string().required(),
            websiteURL: Joi.string().required(),
            menuURL: Joi.string().required(),
			}).required()
	}).required()
})

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
	let transaction: Transaction
	try {
		const { user: authUser, models, body } = req
		const includeExtendedProfile = (body.extendedProfile == true);

		transaction = await sequelize.transaction()

		const [accessToken] = await Promise.all([
			createJwt({ uid: authUser.id }, { audience: passportConfig.jwt.api.audience, expiresIn: passportConfig.jwt.api.exp }),
			// set lastLogin timestamp
			authUser.update(
				{
					lastLoginAt: new Date(),
					lastTokenAt: new Date(),
					updatedBy: authUser.id
				},
				{
					transaction
				}
			)
		])

		await transaction.commit()

		const { Restaurant } = models

		let extendedProfile: UserModel
		if (includeExtendedProfile) {
			extendedProfile = await getUserById(models, authUser.id);
		}

		const restaurant = await Restaurant.findOne({
            where: {
                ownedBy: {
                    [Op.eq]: authUser.id
                }
            }
        })

		const profile = {
			id: authUser.id,
			fullname: authUser.fullName,
			restaurant,
		}

		return res.json({ accessToken, profile })
	} catch (error) {
		if (transaction) {
			await transaction.rollback()
		}
		return next(error)
	}
}
