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
        category: Joi.string().required(),
        subcategory: Joi.string().optional(),
        description: Joi.string().optional(),
        imageID: Joi.number().integer().optional().min(1),
        allergenIDs: Joi.array().items(Joi.number().integer().min(0)).required(),
    }),
    query: Joi.object(),
    params: Joi.object({
        restaurantID: Joi.number().integer().min(1).required(),
        menuItemID: Joi.number().integer().min(1).required(),
    })
})

export const responseSchema = fullMessagesResponse

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
    let transaction
    try {
        const { models, body, params, user: authUser } = req
        const { File, MenuItem, Restaurant, Allergen, MenuItemAllergen } = models

        let data = {
            name: body.name,
            price: body.price,
            category: body.category,
            subcategory: body.subcategory,
            imageID: body.imageID,
            description: body.description,
            // categoryID: body.categoryID,
        }

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

        const foundPhoto = await File.findByPk(parseInt(body.imageID, 10))
        
		if (!foundPhoto) {
			throw new ErrorBuilder(404, req.t(`error:Fotka s ID ${body.imageID} nebola nájdená`))
		}

        transaction = await sequelize.transaction()

        const menuItem = await foundMenuItem.update(data, {
			transaction
		})

        await MenuItemAllergen.destroy({
			where: {
				menuItemID: {
					[Op.eq]: menuItem.id
				}
			},
			transaction
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
                throw new ErrorBuilder(404, req.t('error:Alergen nebolo nájdené'))
            }

            const accessoriesData = map(allergensIDs, (allergenID) => ({
                allergenID,
                menuItemID: foundMenuItem.id
            }))
            await MenuItemAllergen.bulkCreate(accessoriesData, { transaction })
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