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

const serverConfig: IServerConfig = config.get('server')

export const schema = Joi.object({
    body: Joi.object(),
    query: Joi.object({
        order: Joi.string().max(255).default('name:asc').optional(),
        limit: Joi.number().integer().valid(25, 50, 100, 500, 1000, 5000, 25000).default(25000).optional(),
        page: Joi.number().integer().min(1).default(1).optional(),
    }),
    params: Joi.object({
    })
})

export const responseSchema = Joi.object({
    allergens: Joi.array()
        .items(
            Joi.array().items({
                id: Joi.number().integer().required(),
                name: Joi.string().required(),
                description: Joi.string().optional()
            })
        )
        .required(),
    pagination: paginationResponse
})

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { models, query, params} = req
        const { Allergen } = models


        const result = await Allergen.findAndCountAll({
        })

        const allergens = result.rows

        return res.json({
            allergens
        })
    } catch (error) {
        return next(error)
    }
}
