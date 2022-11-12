import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'
import ErrorBuilder from '../../../utils/ErrorBuilder'

export const schema = Joi.object({
    body: Joi.object(),
    query: Joi.object({
        api_key: Joi.string().optional(),
        includePermissions: Joi.boolean().optional(),
    }),
    params: Joi.object({
        roleID: Joi.number().integer().required()
    })
})

export const responseSchema = Joi.object({
    role: Joi.object({
        id: Joi.number().integer().required(),
        name: Joi.string().required(),
        permissions: Joi.array()
            .items({
                key: Joi.string().required(),
                groupKey: Joi.string().required()
            })
            .optional()
    }).required()
})

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { models, params, query } = req
        const { Role, Permission } = models

        const include = (query.includePermissions != true) ? undefined : [
            {
                model: Permission,
                attributes: ['id', 'key', 'groupKey'],
            }
        ];

        const result = await Role.findByPk(parseInt(params.roleID, 10), {
            include
        })

        if (!result) {
            throw new ErrorBuilder(404, req.t('error:Rola nebola nájdená'))
        }

        const role = {
            id: result.id,
            name: result.name,
            createdBy: result.createdBy,
            permissions: (result.permissions || []).map(perm => {
                return {
                    id: perm.id,
                    key: perm.key,
                    groupKey: perm.groupKey
                }
            })
        }


        return res.json({
            role
        })
    } catch (error) {
        return next(error)
    }
}
