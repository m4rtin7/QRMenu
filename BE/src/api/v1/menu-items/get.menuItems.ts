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
import restaurant from '../../../db/models/restaurant'
import ErrorBuilder from '../../../utils/ErrorBuilder'
import allergens from '../allergens'

const serverConfig: IServerConfig = config.get('server')

export const schema = Joi.object({
    body: Joi.object(),
    query: Joi.object({
        order: Joi.string().max(255).default('name:asc').optional(),
        limit: Joi.number().integer().valid(25, 50, 100, 500, 1000, 5000, 25000).default(25000).optional(),
        page: Joi.number().integer().min(1).default(1).optional(),
    }),
    params: Joi.object({
        restaurantID: Joi.number().integer().min(1).required()
    })
})

export const responseSchema = Joi.object({
    menuItems: Joi.array()
        .items(
            Joi.array().items({
                id: Joi.number().integer().required(),
                name: Joi.string().required(),
                price: Joi.number().integer().required(),
                description: Joi.string().required(),
                category: Joi.string().required(),
                subcategory: Joi.string().optional(),
                restaurantID: Joi.number().integer().required(),
                categoryID: Joi.number().integer().required(),
                allergens: Joi.array().items({
                    id: Joi.number().integer().required(),
                    name: Joi.string().required(),
                    description: Joi.string().optional()
                }),
                image: Joi.object({
                    id: Joi.number().integer().required(),
                    name: Joi.string().max(1000).required(),
                    title: Joi.string().max(255).optional(),
                }).optional()
            })
        )
        .required(),
    pagination: paginationResponse
})

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { models, query, params} = req
        const { MenuItem, File, Restaurant, Allergen } = models

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

        const restaurant = await Restaurant.findOne({
            where: {
                id: {
                    [Op.eq]: params.restaurantID
                }
            }
        })

        if (!restaurant) {
            throw new ErrorBuilder(404, req.t(`error:Restauracia s id ${params.restaurantID} nebola nájdena`))
        }


        const result = await MenuItem.findAndCountAll({
            order,
            include: [
                {
                    model: Allergen,
                    attributes: [ 'id','name', 'description'],
                },
                {
                    model: File,
                    attributes: ['id', 'name', 'path'],
                    as: 'image',
                }
            ],
            where: {
                restaurantID: {
                    [Op.eq]: params.restaurantID
                }
            }
        })

        // const menuItems: map(result.rows.allergens, (allergen) => {
        //     return {
        //         id: allergen.id,
        //         name: allergen.name
        //         description: allergen.description
        //     }
        // }),

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
