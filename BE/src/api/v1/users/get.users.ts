import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { Op, where, fn, col, WhereOptions, WhereValue, Order, literal } from 'sequelize'
import { map, first, last, slice, join } from 'lodash'

// utils
import { createSlug, isSuperAdmin } from '../../../utils/helper'
import { SYSTEM_USER } from '../../../utils/enums'
import createOrder from '../../../utils/createOrder'
import { paginationResponse } from '../../../utils/joiSchemas'

export const schema = Joi.object({
	headers: Joi.object({
		'x-resortID': Joi.number().integer().min(1).required()
	}),
	body: Joi.object(),
	query: Joi.object({
		roleID: Joi.number().integer().min(1).optional(),
		search: Joi.string().max(100).optional().allow('', null),
		order: Joi.string().max(255).default('fullName:asc').optional(),
		limit: Joi.number().integer().valid(25, 50, 100,500,1000,5000,25000).default(25000).optional(),
		page: Joi.number().integer().min(1).default(1).optional()
	}),
	params: Joi.object()
})

export const responseSchema = Joi.object({
	users: Joi.array()
		.items(
			Joi.object({
				id: Joi.number().integer().min(1).required(),
				fullName: Joi.string().required().allow(''),
				email: Joi.string().required(),
				confirmedAt: Joi.date().iso().required().allow(null),
				last: Joi.date().iso().required().allow(null),
				lastLoginAt: Joi.date().iso().required().allow(null),
				lastTokenAt: Joi.date().iso().required().allow(null),
				deletedAt: Joi.date().iso().required().allow(null),
				phone: Joi.string().required().allow(null),
				resorts: Joi.array()
					.items(
						Joi.object({
							id: Joi.number().integer().min(1).required(),
							name: Joi.string().required(),
							roles: Joi.array()
								.items(
									Joi.object({
										id: Joi.number().integer().min(1).required(),
										name: Joi.string().required()
									})
								)
								.required()
						})
					)
					.required()
			})
		)
		.required(),
	pagination: paginationResponse
})

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { query, models, user: authUser } = req
		const { User, Role } = models

		const { limit } = query
		const offset = query.page * limit - limit

		const userConditions: { [Op.and]: WhereOptions[] | WhereValue[] } = {
			[Op.and]: [
				{
					// eliminate SYSTEM_USER user
					email: { [Op.notIn]: [SYSTEM_USER] }
				}
			]
		}

		if (query.search) {
			const slugValue = createSlug(query.search)
			const searchArray = slugValue
				.split('-')
				.map((slug) => where(fn('CONCAT_WS', '-', col('user.nameSlug'), col('user.surnameSlug'), col('user.emailSlug')), { [Op.iLike]: `%${slug}%` }))
			userConditions[Op.and].push({
				[Op.or]: [
					{
						[Op.and]: [...searchArray]
					},
					where(literal('"user"."id"::VARCHAR'), { [Op.eq]: query.search })
				]
			})
		}

		const allowedOrderColumns = {
			fullName: 'userName',
			email: 'email'
		}

		const order = <string[][]>createOrder(query.order, allowedOrderColumns)

		let resultOrder: Order
		if (first(first(order)) === 'userName') {
			const direction = last(first(order))

			const rawResultOrder = `"user"."surname" ${direction}, "user"."name" ASC`

			const splittedLastQueryOrderWithoutDirection = slice(last(order), 0, -1)
			const lastQueryOrder = ` ${join(
				map(splittedLastQueryOrderWithoutDirection, (item) => `"${item}"`),
				'.'
			)} ${last(last(order))}`

			resultOrder = literal(/* SQL */ `${rawResultOrder}, ${lastQueryOrder}`)
		} else {
			resultOrder = <Order>order
		}

		const [users, userCount] = await Promise.all([
			User.findAll({
				paranoid: false,
				attributes: ['id', 'name', 'surname', 'email', 'phone', 'confirmedAt', 'deletedAt', 'lastLoginAt', 'lastTokenAt'],
				where: userConditions,
				offset,
				limit,
				order: resultOrder
			}),
			User.count({
				paranoid: false,
				col: 'id',
				distinct: true,
				where: userConditions
			})
		])

		const resultUsers = map(users, (user) => ({
			id: user.id,
			fullName: user.inverseFullName,
			email: user.email,
			confirmedAt: user.confirmedAt,
			deletedAt: user.deletedAt,
			phone: user.phone,
			lastLoginAt: user.lastLoginAt,
			lastTokenAt: user.lastTokenAt,
		}))

		return res.json({
			users: resultUsers,
			pagination: {
				limit,
				page: query.page,
				totalPages: Math.ceil(userCount / limit) || 0,
				totalCount: userCount
			}
		})
	} catch (error) {
		return next(error)
	}
}
