import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { Op, Transaction } from 'sequelize'
import config from 'config'
import bcrypt from 'bcrypt'
import { isEqual, map, uniq } from 'lodash'

import sequelize from '../../../db/models'

// utils
import { MESSAGE_TYPE, PERMISSION } from '../../../utils/enums'
import ErrorBuilder from '../../../utils/ErrorBuilder'
import renderTemplate from '../../../utils/renderTemplate'
import { createJwt } from '../../../utils/auth'
import { getRandomString, includesRoleWithPermission, isSuperAdmin } from '../../../utils/helper'

// services
import sendEmail from '../../../services/emailService'

// types
import { IServerConfig, IPassportConfig } from '../../../types/interfaces'
import { emailRequest, messagesResponse } from '../../../utils/joiSchemas'
import dayjs from 'dayjs'

const serverConfig: IServerConfig = config.get('server')
const passportConfig: IPassportConfig = config.get('passport')

// NOTE: schema is a function cause of using i18next in it
export const schema = () =>
	Joi.object({
		body: Joi.object({
			email: emailRequest().required(),
			password: Joi.string().min(5).alphanum().required(),
			name: Joi.string().max(255).required().allow(null),
			surname: Joi.string().max(255).required().allow(null),
			phone: Joi.string().max(100).required().allow(null),
			restaurantName: Joi.string().required(),
			city: Joi.string().optional().allow(null),
			address: Joi.string().optional().allow(null),
			zipCode: Joi.string().optional().allow(null),
			websiteURL: Joi.string().optional().allow(null),
			menuURL: Joi.string().optional().allow(null),
		}),
		query: Joi.object(),
		params: Joi.object()
	})

export const responseSchema = Joi.object({
	messages: messagesResponse,
	user: Joi.object({
		id: Joi.number().integer().min(1).required()
	}).required()
})

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
	let transaction: Transaction
	try {
		const { body, user: authUser, models } = req
		const { User, Role, Permission, UserRole, Restaurant } = models

		// if (!isSuperAdmin(authUser)) {
		// 	const resortIDs = uniq(map(body.resorts, 'resortID'))
		// 	// get user roles
		// 	const assignedToSameResort = await UserRole.findAll({
		// 		attributes: ['resortID'],
		// 		where: {
		// 			userID: {
		// 				[Op.eq]: authUser.id
		// 			}
		// 		}
		// 	});
			
		// 	const authUserResortIDs = uniq(map(assignedToSameResort, 'resortID'))
		// 	for (const resortId of resortIDs) {
		// 		if (authUserResortIDs.indexOf(resortId) == -1) {
		// 			throw new ErrorBuilder(409, req.t('error:Nemáte priradený jeden alebo viacej rezortov'))
		// 		}
		// 	}
		// }

		const sameEmailUser = await User.findOne({
			where: {
				email: { [Op.eq]: body.email }
			}
		})

		if (sameEmailUser) {
			throw new ErrorBuilder(409, req.t('error:Používateľ so zadaným emailom už existuje'))
		}

		// const uniqRoleIDs: number[] = uniq(map(body.resorts, 'roleID'))
		// const uniqResortIDs: number[] = uniq(map(body.resorts, 'resortID'))

		// // check if all provided role IDs exist
		// const [roles] = await Promise.all([
		// 	Role.findAll({
		// 		attributes: ['id'],
		// 		where: {
		// 			id: { [Op.in]: uniqRoleIDs }
		// 		},
		// 		include: [
		// 			{
		// 				model: Permission,
		// 				attributes: ['id', 'key']
		// 			}
		// 		]
		// 	})
		// ])

		// if (roles.length !== uniqRoleIDs.length) {
		// 	throw new ErrorBuilder(404, req.t('error:Rola nebola nájdená'))
		// }

		// if (includesRoleWithPermission(roles, PERMISSION.ADMIN) && !isSuperAdmin(authUser)) {
		// 	throw new ErrorBuilder(403, req.t('error:Používateľa s administrátorskym oprávnením môže vytvoriť len superadmin'))
		// }

		const salt = bcrypt.genSaltSync(10)
		const hash = bcrypt.hashSync(body.password, salt)

		transaction = await sequelize.transaction()

		const newUser = await User.create(
			{
				name: body.name,
				surname: body.surname,
				email: body.email,
				phone: body.phone,
				hash: hash,
				createdBy: 1,
				confirmedAt: dayjs().toISOString()
			},
			{
				transaction,
				applicationLogging: false
			}
		)
		const restaurant = await Restaurant.create(
			{
				name: body.restaurantName,
				city: body.city,
				address: body.address,
				zipCode: body.zipCode,
				phone: body.phone,
				contactPerson: newUser.fullName,
				websiteURL: body.websiteURL, 
				menuURL: body.menuURL,
				ownedBy: newUser.id
			}, 
			{
				transaction
			}
		)

		// const resortRoles = [] as {
		// 	userID: number
		// 	resortID: number
		// 	roleID: number
		// }[]

        // const resortsArray = body.resorts;
        // resortsArray.forEach((resort: any) => {
        //     resortRoles.push({
        //         resortID: resort.resortID,
        //         roleID: resort.roleID,
        //         userID: newUser.id
        //     })
        // });

		// await UserRole.bulkCreate(resortRoles, { transaction })
		await transaction.commit()
		transaction = null

		const messages = [
			{
				type: MESSAGE_TYPE.SUCCESS,
				message: req.t('Používateľ bol úspešne vytvorený')
			}
		]

		return res.json({
			messages,
			user: {
				id: newUser.id
			}
		})
	} catch (error) {
		if (transaction) {
			await transaction.rollback()
		}
		return next(error)
	}
}
