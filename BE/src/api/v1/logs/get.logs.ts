import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { map } from 'lodash'
import { where, col, fn, Op, WhereOptions } from 'sequelize'
import createOrder from '../../../utils/createOrder'
import { SQL_OPERATIONS } from '../../../utils/enums'
import { paginationResponse } from '../../../utils/joiSchemas'

export const schema = Joi.object({
    body: Joi.object(),
    query: Joi.object({
        api_key: Joi.string().optional(),
        searchName: Joi.string().max(100).optional().allow('', null),
        searchTable: Joi.string().max(100).optional().allow('', null),
        searchFullText: Joi.string().max(100).optional().allow('', null),
        order: Joi.string().max(255).default('id:desc').optional(),
        limit: Joi.number().integer().valid(25, 50, 100, 500, 1000, 5000, 25000).default(25000).optional(),
        page: Joi.number().integer().min(1).default(1).optional()
    }),
    params: Joi.object()
})

export const responseSchema = Joi.object({
    logs: Joi.array()
        .items(
            Joi.object({
                id: Joi.number().integer().required(),
                userName: Joi.string().required(),
                timestamp: Joi.string().required(),
                tableName: Joi.string().required(),
                operation: Joi.string().valid(...SQL_OPERATIONS).required(),
            })
        )
        .required(),
    pagination: paginationResponse
})

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { models, query } = req
        const { Log } = models

        const { limit } = query
        const offset = query.page * limit - limit

        const allowedOrderColumns = {
            id: 'id',
            userName: 'userName',
            tableName: 'tableName',
            timestamp: 'timestamp'
        }

        const order = createOrder(query.order, allowedOrderColumns)

        let whereBuilder: any = null;
        if (query.searchName != null && query.searchName.length > 0) {
            whereBuilder = whereBuilder ?? {};
            whereBuilder.userName = where(fn('LOWER', col('userName')), 'LIKE', '%' + query.searchName + '%');
        }

        if (query.searchTable != null && query.searchTable.length > 0) {
            whereBuilder = whereBuilder ?? {};
            whereBuilder.tableName = where(fn('LOWER', col('tableName')), 'LIKE', '%' + query.searchTable + '%');
        }

        const result = await Log.findAndCountAll({
            offset,
            limit,
            order,
            where: whereBuilder,
            attributes: [
                'id',
                'userName',
                'timestamp',
                'tableName',
                'operation'
            ],
        
        })

        const data = map(result.rows, (log) => {
            return {
                id: log.id,
                userName: log.userName,
                timestamp: log.timestamp,
                tableName: log.tableName,
                operation: log.operation
            }
        })

        return res.json({
            logs: data,
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
