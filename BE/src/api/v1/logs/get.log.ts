import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { SQL_OPERATIONS } from '../../../utils/enums'
import { paginationResponse } from '../../../utils/joiSchemas'

export const schema = Joi.object({
    body: Joi.object(),
    query: Joi.object({
        api_key: Joi.string().optional(),
        order: Joi.string().max(255).default('id:asc').optional(),
        limit: Joi.number().integer().valid(25, 50, 100, 500, 1000, 5000, 25000).default(25000).optional(),
        page: Joi.number().integer().min(1).default(1).optional()
    }),
    params: Joi.object({
        logID: Joi.number().integer().required()
    })
})

export const responseSchema = Joi.object({
    log:
        Joi.object({
            id: Joi.number().integer().required(),
            userName: Joi.string().required(),
            timestamp: Joi.string().required(),
            tableName: Joi.string().required(),
            operation: Joi.string().valid(...SQL_OPERATIONS).required(),
            newValue: Joi.string().required().allow(null),
            oldValue: Joi.string().required().allow(null)


        })
            .required(),
    pagination: paginationResponse
})

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { models, params } = req
        const { Log } = models

        const log = await Log.findByPk(parseInt(params.logID, 10), {
            attributes: [
                'id',
                'userName',
                'timestamp',
                'tableName',
                'operation',
                'newValue',
                'oldValue'
            ],
        })

        return res.json({
            log
        })
    } catch (error) {
        return next(error)
    }
}
