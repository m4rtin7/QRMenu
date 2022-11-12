import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { includes } from 'lodash'
import { Op } from 'sequelize'
import sequelize from '../../../db/models'
import { ATTRACTION_TYPE, MESSAGE_TYPE, PERMISSION, PERMISSIONS, SERVICE_TYPES, STATUSES } from '../../../utils/enums'
import ErrorBuilder from '../../../utils/ErrorBuilder'
import { fullMessagesResponse, openingHoursSchema } from '../../../utils/joiSchemas'
import { rolesSystem } from '../../../utils/roleUtil'

export const schema = Joi.object({
    body: Joi.object({
        name: Joi.string().max(255).required(),
        permissions: Joi.array().items(Joi.string().valid(...PERMISSIONS)).required()
    }),
    query: Joi.object(),
    params: Joi.object()
})

export const responseSchema = fullMessagesResponse

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
    let transaction
    try {
        const { models, body, user: authUser, params } = req
        const { Role, RolePermission, Permission } = models

        const role = await Role.findByPk(parseInt(params.roleID, 10))

        if (!role) {
            throw new ErrorBuilder(404, req.t('error:Rola nebola nájdená'))
        }

        if (role.id <= rolesSystem.length) {
            throw new ErrorBuilder(400, req.t('error:Nemožno upravovať systémovú rolu'))
        }

        const allPermissions = await Permission.findAll({
            attributes: ['id', 'key'],
        });

        const applicablePermissions: PERMISSION[] = body.permissions;
        const permissionIds = allPermissions.filter(p => applicablePermissions.indexOf(p.key) > -1);
        const newPermissions = permissionIds.map(p => {
            return {
                roleID: role.id,
                permissionID: p.id
            }
        })

        transaction = await sequelize.transaction()

        await RolePermission.destroy({
            where: {
                roleID: {
                    [Op.eq]: role.id
                }
            },
            transaction
        });

        await role.update({ name: body.name, updatedBy: authUser.id }, {
            transaction
        })

        await RolePermission.bulkCreate(newPermissions, { transaction })
        await transaction.commit()

        const messages = [
            {
                type: MESSAGE_TYPE.SUCCESS,
                message: req.t('Rola bola úspešne upravená')
            }
        ]

        return res.json({
            messages
        })
    } catch (error) {
        if (transaction) {
            await transaction.rollback()
        }
        return next(error)
    }
}
