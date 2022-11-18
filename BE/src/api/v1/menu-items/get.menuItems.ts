import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { map } from 'lodash'
import config from 'config'
import { col, fn, literal, Op, where, WhereOptions, WhereValue } from 'sequelize'
import createOrder from '../../../utils/createOrder'
import { LANGUAGES, STATUSES } from '../../../utils/enums'
import { createSlug } from '../../../utils/helper'
import { causeSchema, localizedValueSchema, openingHoursSchema, paginationResponse } from '../../../utils/joiSchemas'
import { IServerConfig } from '../../../types/interfaces'
import { getPhotoFullPath } from '../../../utils/photoUtil'

const serverConfig: IServerConfig = config.get('server')

export const schema = Joi.object({
    body: Joi.object(),
    query: Joi.object({
        order: Joi.string().max(255).default('name:asc').optional(),
        limit: Joi.number().integer().valid(25, 50, 100, 500, 1000, 5000, 25000).default(25000).optional(),
        page: Joi.number().integer().min(1).default(1).optional(),
    }),
    params: Joi.object()
})

export const responseSchema = Joi.object({
    menuItems: Joi.array()
        .items(
            Joi.array().items({
                id: Joi.number().integer().required(),
                name: Joi.string().required(),
            })
        )
        .required(),
    pagination: paginationResponse
})

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { models, query } = req
        const { MenuItem, MenuItemCategory, File } = models

        const { limit } = query
        const offset = query.page * limit - limit

        const allowedOrderColumns = {
            name: 'name',
            id: 'id'
        }

		let order = createOrder(query.order, allowedOrderColumns);
		if (order == null) {
			order = [['sortOrder', 'ASC']];
		}

        const whereCondition: { [Op.and]: WhereOptions[] | WhereValue[] } = {
            [Op.and]: []
        }

        const result = await MenuItem.findAndCountAll({
            order,
            include: [
                {
                    model: MenuItemCategory,
                    attributes: [ 'name'],
                },
                {
                    model: File,
                    attributes: ['id', 'name', 'path'],
                    as: 'image',
                }
            ]
        })

        const menuItems = result.rows

        return res.json({
            menuItems,
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
