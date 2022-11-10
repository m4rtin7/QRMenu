import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { includes } from 'lodash'
import { Op } from 'sequelize'
import sequelize from '../../../db/models'
import { ATTRACTION_TYPE, MESSAGE_TYPE, PERMISSION, PERMISSIONS, SERVICE_TYPES, STATUSES } from '../../../utils/enums'
import ErrorBuilder from '../../../utils/ErrorBuilder'
import { fullMessagesResponse, messagesResponse, openingHoursSchema } from '../../../utils/joiSchemas'
import { rolesSystem } from '../../../utils/roleUtil'

export const schema = Joi.object({
    body: Joi.object({
        name: Joi.string().max(255).required(),
        permissions: Joi.array().items(Joi.string().valid(...PERMISSIONS)).required()
    }),
    query: Joi.object(),
    params: Joi.object()
})

export const responseSchema = {
	role: Joi.object({
		id: Joi.number().integer()
	}).required(),
	messages: messagesResponse
}

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
    let transaction
    try {
        const { models, body, user: authUser, params } = req
        const { Role, RolePermission, Permission } = models

        const allPermissions = await Permission.findAll({
            attributes: ['id', 'key'],
        });

        const data = {
			name: body.name,
			createdBy: authUser.id
		}

		transaction = await sequelize.transaction()

		const role = await Role.create(data, {
			transaction
		})

        const applicablePermissions: PERMISSION[] = body.permissions;
        const permissionIds = allPermissions.filter(p => applicablePermissions.indexOf(p.key) > -1);
        const newPermissions = permissionIds.map(p => {
            return {
                roleID: role.id,
                permissionID: p.id
            }
        })

        await RolePermission.bulkCreate(newPermissions, { transaction })
        await transaction.commit()

        const messages = [
            {
                type: MESSAGE_TYPE.SUCCESS,
                message: req.t('Rola bola úspešne vytvorená')
            }
        ]

        return res.json({
			role: {
				id: role.id
			},
			messages
		})
    } catch (error) {
        if (transaction) {
            await transaction.rollback()
        }
        return next(error)
    }
}
