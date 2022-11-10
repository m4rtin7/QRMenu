import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import config from 'config'
import { includes } from 'lodash'

// utils
import { MESSAGE_TYPE, SYSTEM_USER } from '../../../utils/enums'
import ErrorBuilder from '../../../utils/ErrorBuilder'
import { createJwt } from '../../../utils/auth'
import renderTemplate from '../../../utils/renderTemplate'
import { isAdmin, isSuperAdmin } from '../../../utils/helper'
import { fullMessagesResponse } from '../../../utils/joiSchemas'

// types
import { IServerConfig, IPassportConfig } from '../../../types/interfaces'

// services
import sendEmail from '../../../services/emailService'

const serverConfig: IServerConfig = config.get('server')
const passportConfig: IPassportConfig = config.get('passport')

export const schema = Joi.object({
	body: Joi.object(),
	query: Joi.object(),
	params: Joi.object({
		userID: Joi.number().integer().min(1).required()
	})
})

export const responseSchema = fullMessagesResponse

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { params, user: authUser, models } = req
		const { User, Permission, Role } = models

		const user = await User.findByPk(parseInt(params.userID, 10), {
			include: [
				{
					model: Permission,
					attributes: ['id', 'key']
				},
				{
					model: Role,
					include: [
						{
							model: Permission,
							attributes: ['id', 'key']
						}
					]
				}
			]
		})

		if (!user || includes([SYSTEM_USER], user.email)) {
			throw new ErrorBuilder(404, req.t('error:Používateľ nebol nájdený'))
		}

		if (user.confirmedAt) {
			throw new ErrorBuilder(409, req.t('error:Používateľ už má potvrdený účet'))
		}

		if (isAdmin(user) && !isSuperAdmin(authUser)) {
			throw new ErrorBuilder(403, req.t('error:Používateľ nemá dostatočné oprávnenie'))
		}

		const tokenPayload = {
			uid: user.id
		}

		const tokenOptions = {
			audience: passportConfig.jwt.invitation.audience,
			expiresIn: passportConfig.jwt.invitation.exp
		}

		const invitationToken = await createJwt(tokenPayload, tokenOptions)

		// send email to created user
		const translation = {
			subject: req.t('email:userInvitation.subject'),
			body: req.t('email:userInvitation.body', {
				email: user.email
			}),
			button: req.t('email:userInvitation.button'),
			footer: req.t('email:userInvitation.footer'),
			path: req.t('email:userInvitation.path', {
				token: invitationToken
			})
		}

		const html = await renderTemplate('email.ejs', {
			email: user.email,
			translation,
			link: `${serverConfig.domain}/${translation.path}`
		})
		const emailData = {
			html,
			subject: translation.subject,
			to: user.email
		}
		await sendEmail(emailData)

		const messages = [
			{
				type: MESSAGE_TYPE.SUCCESS,
				message: req.t('Email bol úspešne odoslaný')
			}
		]

		return res.json({ messages })
	} catch (error) {
		return next(error)
	}
}
