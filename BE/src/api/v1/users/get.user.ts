import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { ModelsType } from '../../../db/models'
import { UserModel } from '../../../db/models/user'
import ErrorBuilder from '../../../utils/ErrorBuilder'

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

export const responseSchema = Joi.object({
	fullName: Joi.string().required().allow(null),
	id: Joi.number().integer().min(1).required(),
	name: Joi.string().required().allow(null),
	surname: Joi.string().required().allow(null),
	email: Joi.string().required(),
	phone: Joi.string().required().allow(null),
	confirmedAt: Joi.string().isoDate().required().allow(null),
	deletedAt: Joi.string().isoDate().required().allow(null),
	lastLoginAt: Joi.string().isoDate().required().allow(null),
	lastTokenAt: Joi.string().isoDate().required().allow(null),
	resorts: Joi.array()
		.items({
			id: Joi.number().integer().min(1).required(),
			name: Joi.string().required(),
			roles: Joi.array()
				.items({
					id: Joi.number().integer().min(1).required(),
					name: Joi.string().required(),
					permissions: Joi.array()
						.items({
							key: Joi.string().required(),
							groupKey: Joi.string().required()			
						})
						.required()
				})
				.required()
		})
		.required()
})

export const getUserById = async (models: ModelsType, userId: number): Promise<UserModel> => {
	const { User, Role, Permission,  } = models
	return await User.findByPk(userId, {
		paranoid: true,
		attributes: ['id', 'name', 'fullName', 'surname', 'email', 'phone', 'confirmedAt', 'deletedAt', 'lastLoginAt', 'lastTokenAt'],
		include: [
			{
				include: [
					{
						model: Role,
						attributes: ['id', 'name'],
						through: {
                            where: { userID: userId }
						},
						include: [
							{
								model: Permission,
								attributes: ['key', 'groupKey'],
								through: {
									attributes: []
								}
							}
						]
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
}

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { models, params } = req
		const user = await getUserById(models, parseInt(params.userID, 10));

		if (user === null) {
			throw new ErrorBuilder(404, req.t('error:Používateľ nie je priradený k aktualnemu rezortu'))
		}

		return res.json(user)
	} catch (error) {
		return next(error)
	}
}
