import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { map } from 'lodash'
import createOrder from '../../../utils/createOrder'
import { paginationResponse } from '../../../utils/joiSchemas'

export const schema = Joi.object({
	body: Joi.object(),
	query: Joi.object({
		api_key: Joi.string().optional(),
		includePermissions: Joi.boolean().optional(),
		order: Joi.string().max(255).default('id:asc').optional(),
		limit: Joi.number().integer().valid(25, 50, 100, 500, 1000, 5000, 25000).default(25000).optional(),
		page: Joi.number().integer().min(1).default(1).optional()
	}),
	params: Joi.object()
})

export const responseSchema = Joi.object({
	roles: Joi.array()
		.items(
			Joi.object({
				id: Joi.number().integer().required(),
				name: Joi.string().required(),
				permissions: Joi.array()
					.items({
						key: Joi.string().required(),
						groupKey: Joi.string().required()
					})
					.optional()
			})
		)
		.required(),
	pagination: paginationResponse
})

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { models, query } = req
		const { Role, Permission } = models

		const { limit } = query
		const offset = query.page * limit - limit

		const allowedOrderColumns = {
			name: 'name',
			id: 'id'
		}

		const order = createOrder(query.order, allowedOrderColumns)
		const include = (query.includePermissions != true) ? undefined : [
			{
				model: Permission,
				attributes: ['id', 'key', 'groupKey'],
			}
		];

		const result = await Role.findAndCountAll({
			offset,
			limit,
			order,
			include,
			attributes: [
				'id',
				'name',
				'createdBy'
			],
		})

		const data = result.rows.map((role) => {
			return {
				id: role.id,
				name: role.name,
				createdBy: role.createdBy,
				permissions: (role.permissions || []).map(perm => {
					return {
						id: perm.id,
						key: perm.key,
						groupKey: perm.groupKey
					}
				})
			}
		});

		return res.json({
			roles: data,
			pagination: {
				limit,
				page: query.page,
				totalPages: Math.ceil(result.count / limit) || 0,
				totalCount: result.count
			}
		})
	} catch (error) {
		return next(error)
	}
}
