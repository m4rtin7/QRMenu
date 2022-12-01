import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { Op, Transaction } from 'sequelize'

import sequelize from '../../../db/models'

// utils
import { MESSAGE_TYPE } from '../../../utils/enums'
import ErrorBuilder from '../../../utils/ErrorBuilder'
import { fullMessagesResponse } from '../../../utils/joiSchemas'

export const schema = Joi.object({
	body: Joi.object(),
	query: Joi.object(),
	params: Joi.object({
		restaurantID: Joi.number().integer().min(1).required(),
		menuItemID: Joi.number().integer().min(1).required()
	})
})

export const responseSchema = fullMessagesResponse

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
	let transaction: Transaction
	try {
		const { params, user: authUser, models, resortID } = req
		const { MenuItem, Restaurant } = models

		const restaurant = await Restaurant.findOne({
            where: {
                id: {
                    [Op.eq]: params.restaurantID
                }
            }
        })

        if (!restaurant) {
            throw new ErrorBuilder(404, req.t(`error:Restauracia s id ${params.restaurantID} nebola naidena`))
        }
        if (restaurant.ownedBy !== authUser.id) {
            throw new ErrorBuilder(404, req.t(`error:Restauracia s id ${params.restaurantID} nepatri prihlasenmu uzivatelovi`))
        }

		const foundMenuItem = await MenuItem.findByPk(parseInt(params.menuItemID, 10))

		if (!foundMenuItem) {
			throw new ErrorBuilder(404, req.t('error:Polozka menu nebola nájdená'))
		}

		transaction = await sequelize.transaction()

		await foundMenuItem.destroy({ deletedBy: authUser.id, transaction })

		await transaction.commit()

		const messages = [
			{
				type: MESSAGE_TYPE.SUCCESS,
				message: req.t('Reštaurácia bola úspešne odstránená')
			}
		]

		return res.json({ messages })
	} catch (error) {
		if (transaction) {
			await transaction.rollback()
		}
		return next(error)
	}
}
