import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'
import { forEach, isEmpty, map, uniq } from 'lodash'
import { Op } from 'sequelize'
import sequelize from '../../../db/models'
import MenuItemAlergen from '../../../db/models/MenuItemAlergen'
import user from '../../../db/models/user'
import { ATTRACTION_TYPE, MESSAGE_TYPE, STATUSES } from '../../../utils/enums'
import ErrorBuilder from '../../../utils/ErrorBuilder'
import { localizedValueSchema, localizedValueSchemaNotMandatory, messagesResponse, openingHoursSchema } from '../../../utils/joiSchemas'

export const schema = Joi.object({
    body: Joi.object({
        name: Joi.string().required(),
		price: Joi.number().min(0).required(),
        category: Joi.string().required(),
        subcategory: Joi.string().optional(),
        description: Joi.string().optional(),
        imageID: Joi.number().integer().optional().min(1),
        allergenIDs: Joi.array().items(Joi.number().integer().min(0)).required(),
    }),
    query: Joi.object(),
    params: Joi.object({
        restaurantID: Joi.number().integer().min(1).required()
    })
})

export const responseSchema = {
    menuItem: Joi.object({
        id: Joi.number().integer()
    }).required(),
    messages: messagesResponse
}

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
    let transaction
    try {
        const { models, body, params, user: authUser } = req
        const { MenuItemAllergen, MenuItem, Restaurant, File, Allergen } = models

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

        if (body.imageID) {
            const foundPhoto = await File.findByPk(parseInt(body.imageID, 10))
        
		    if (!foundPhoto) {
			    throw new ErrorBuilder(404, req.t(`error:Fotka s ID ${body.imageID} nebola nájdená`))
		}
        }

        let data = {
            name: body.name,
            price: body.price,
            category: body.category,
            subcategory: body.subcategory,
            imageID: body?.imageID,
            createdBy: authUser.id,
            restaurantID: restaurant.id,
            description: body.description,
            // categoryID: body.categoryID,
        }

        // const category = await MenuItemCategory.findOne({
        //     where: {
        //         id: {
        //             [Op.eq]: body.categoryID
        //         }
        //     }
        // })

        // if (!category) {
        //     throw new ErrorBuilder(404, req.t('error:Kategoria nebola nájdené'))
        // }

        transaction = await sequelize.transaction()

        const menuItem = await MenuItem.create(data, {
            transaction,
        }) 
        
        const allergensIDs = uniq(body.allergenIDs) as number[]
        if (!isEmpty(allergensIDs)) {
            const allergens = await Allergen.findAll({
                where: {
                    id: {
                        [Op.in]: allergensIDs
                    }
                }
            })

            if (allergens.length != allergensIDs.length) {
                throw new ErrorBuilder(404, req.t('error:Alergeny neboli nájdené'))
            }

            const accessoriesData = map(allergensIDs, (allergenID) => ({
                allergenID,
                menuItemID: menuItem.id
            }))
            await MenuItemAllergen.bulkCreate(accessoriesData, { transaction })
        }

        await transaction.commit()

        const messages = [
            {
                type: MESSAGE_TYPE.SUCCESS,
                message: req.t('Polozka v menu bola úspešne vytvorená')
            }
        ]

        return res.json({
            menuItem: {
                id: menuItem.id
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
