import { Request } from 'express'
import { Op } from 'sequelize'
import { IVerifyOptions } from 'passport-local'
import bcrypt from 'bcrypt'

// utils
import { SYSTEM_USER } from '../utils/enums'

export default async (req: Request, email: string, password: string, done: (error: any, userCallback?: any, options?: IVerifyOptions) => void) => {
	try {
		const { User } = req.models

		const user = await User.findOne({
			where: {
				[Op.and]: [
					{
						// eliminate SYSTEM_USER user and ONLINE_SALE users
						email: { [Op.notIn]: [SYSTEM_USER] }
					},
					{
						email: { [Op.eq]: email }
					}
				]
			}
		})

		let errorMessage

		if (!user) {
			errorMessage = req.t('error:Nesprávne prihlasovacie údaje')
		} else {
			if (!user.confirmedAt) {
				errorMessage = req.t('error:Účet nie je aktivovaný')
			}

			const passComparation = await bcrypt.compare(password, user.hash)
			if (!passComparation) {
				errorMessage = req.t('error:Nesprávne prihlasovacie údaje')
			}
		}

		if (errorMessage) {
			return done(null, false, { message: errorMessage })
		}

		return done(null, user)
	} catch (e) {
		return done(e)
	}
}
