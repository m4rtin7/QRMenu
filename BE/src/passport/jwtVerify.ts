import { Request } from 'express'
import { Op } from 'sequelize'
import jwt from 'jsonwebtoken'
import { VerifiedCallback } from 'passport-jwt'
import config from 'config'

// utils
import { IJwtPayload, IPassportConfig } from '../types/interfaces'
import ErrorBuilder from '../utils/ErrorBuilder'

const passportConfig: IPassportConfig = config.get('passport')

export const jwtVerifyUserApi = async (req: Request, payload: IJwtPayload, done: VerifiedCallback) => {
	try {
		const { User } = req.models

		const user = await User.findOne({
			where: {
				id: { [Op.eq]: payload.uid }
			}
		})

		if (!user) {
			throw new ErrorBuilder(401, req.t('error:Používateľ neexistuje'))
		}

		return done(null, user)
	} catch (e) {
		return done(e)
	}
}

export const jwtVerifyForgotPassword = async (req: Request, payload: IJwtPayload, done: VerifiedCallback) => {
	try {
		const { User } = req.models
		const user = await User.findOne({
			where: {
				[Op.and]: [
					{
						id: { [Op.eq]: payload.uid }
					},
					{
						confirmedAt: { [Op.not]: null }
					}
				]
			}
		})

		if (!user) {
			throw new ErrorBuilder(401, req.t('error:Používateľ neexistuje'))
		}

		return done(null, user)
	} catch (err) {
		return done(err)
	}
}

export const jwtVerifyInvitation = async (req: Request, payload: IJwtPayload, done: VerifiedCallback) => {
	try {
		const { User } = req.models
		const user = await User.findOne({
			where: {
				[Op.and]: [
					{
						id: { [Op.eq]: payload.uid }
					},
					{
						confirmedAt: { [Op.eq]: null }
					}
				]
			}
		})

		if (!user) {
			throw new ErrorBuilder(401, req.t('error:Používateľ neexistuje'))
		}

		return done(null, user)
	} catch (e) {
		return done(e)
	}
}

// get custom secret (hash + secret) for forgot-password token
export const secretOrKeyProvider = async (req: Request, rawJwtToken: string, done: any) => {
	try {
		const { User } = req.models
		const decodedToken: any = jwt.decode(rawJwtToken)

		const user = await User.findOne({
			where: {
				[Op.and]: [
					{
						id: { [Op.eq]: decodedToken.uid }
					},
					{
						confirmedAt: { [Op.not]: null }
					}
				]
			}
		})

		if (!user) {
			return done(null, false)
		}

		const userSecret = `${passportConfig.jwt.secretOrKey}${user.hash}`
		return done(null, userSecret)
	} catch (err) {
		return done(err)
	}
}
