import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { Op } from 'sequelize'
import config from 'config'

// utils
import { MESSAGE_TYPE, SYSTEM_USER } from '../../../utils/enums'
import { createJwt } from '../../../utils/auth'
import renderTemplate from '../../../utils/renderTemplate'
import { emailRequest, fullMessagesResponse } from '../../../utils/joiSchemas'

// types
import { IPassportConfig, IServerConfig } from '../../../types/interfaces'

// services
import sendEmail from '../../../services/emailService'

const serverConfig: IServerConfig = config.get('server')
const passportConfig: IPassportConfig = config.get('passport')

// NOTE: schema is a function cause of using i18next in it
export const schema = () =>
	Joi.object({
		body: Joi.object({
			email: emailRequest().required()
		}),
		query: Joi.object(),
		params: Joi.object()
	})

export const responseSchema = Joi.object({
	messages: Joi.array()
		.items(
			Joi.object({
				message: Joi.string().required(),
				forgottenPasswordToken: Joi.string().required(),
				type: Joi.string().valid(MESSAGE_TYPE.SUCCESS).required()
			}).required()
		)
		.required()
})

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { body, models } = req
		const { User } = models

		const user = await User.findOne({
			where: {
				[Op.and]: [
					{
						email: { [Op.notIn]: [SYSTEM_USER] }
					},
					{
						email: { [Op.eq]: body.email }
					},
					{
						confirmedAt: { [Op.not]: null }
					}
				]
			}
		})
		let forgottenPasswordToken: string
		if (user) {
			const tokenPayload = {
				uid: user.id
			}

			const tokenOptions = {
				audience: passportConfig.jwt.forgottenPassword.audience,
				expiresIn: passportConfig.jwt.forgottenPassword.exp
			}

			const tokenSecret = `${passportConfig.jwt.secretOrKey}${user.hash}`
			forgottenPasswordToken = await createJwt(tokenPayload, tokenOptions, tokenSecret)

			// send email to user
			const translation = {
				subject: req.t('email:userForgotPassword.subject'),
				body: req.t('email:userForgotPassword.body'),
				button: req.t('email:userForgotPassword.button'),
				footer: req.t('email:userForgotPassword.footer', {
					email: body.email
				}),
				path: req.t('email:userForgotPassword.path', {
					token: forgottenPasswordToken
				})
			}

			const html = await renderTemplate('email.ejs', {
				email: body.email,
				translation,
				link: `${serverConfig.domain}/reset-password?token=${forgottenPasswordToken}`
			})

			await sendEmail({
				html,
				subject: translation.subject,
				to: body.email
			})
		}

		const messages = [
			{
				message: req.t('translation:Na zadanú e-mailovú adresu Vám bol zaslaný odkaz na zmenu hesla'),
				forgottenPasswordToken,
				type: MESSAGE_TYPE.SUCCESS
			}
		]

		return res.json({ messages })
	} catch (err) {
		return next(err)
	}
}
