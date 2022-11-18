import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'
import { forEach, includes, isEmpty, map, uniq } from 'lodash'
import { Op } from 'sequelize'
import sequelize from '../../../db/models'
import { buildAttractionDataFromBody } from '../../../utils/attractionUtil'
import { ATTRACTION_TYPE, MESSAGE_TYPE, STATUSES } from '../../../utils/enums'
import ErrorBuilder from '../../../utils/ErrorBuilder'
import { fullMessagesResponse, localizedValueSchema, localizedValueSchemaNotMandatory, openingHoursSchema } from '../../../utils/joiSchemas'

export const schema = Joi.object({
    body: Joi.object({
        name: Joi.string().required(),
		price: Joi.number().min(0).required(),
        categoryID: Joi.number().integer().required().min(1)
    }),
    query: Joi.object(),
    params: Joi.object()
})

export const responseSchema = fullMessagesResponse

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
    let transaction
    try {
        const { models, body, params, user: authUser } = req
        const { File, MenuItem, MenuItemCategory } = models

        let data = {
            name: body.name,
            price: body.price,
            categoryID: body.categoryID,
        }

		const foundMenuItem = await MenuItem.findByPk(parseInt(params.menuItemID, 10))

		if (!foundMenuItem) {
			throw new ErrorBuilder(404, req.t('error:Polozka menu nebola nájdená'))
		}

        const category = await MenuItemCategory.findOne({
            where: {
                id: {
                    [Op.eq]: body.categoryID
                }
            }
        })

        if (!category) {
            throw new ErrorBuilder(404, req.t('error:Kategoria nebola nájdené'))
        }

        transaction = await sequelize.transaction()


		await foundMenuItem.update(data, {
			transaction
		})
		
        await transaction.commit()

        const messages = [
            {
                type: MESSAGE_TYPE.SUCCESS,
                message: req.t('Polozka v menu bola úspešne updatovana')
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