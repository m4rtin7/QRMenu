import dayjs from 'dayjs'
import { Request } from 'express'
import { Op, Transaction } from 'sequelize'
import sequelize from '../db/models'

export default async (req: Request, token: string, done: (error: any, user?: any, options?: { message: string }) => void) => {
	let transaction: Transaction
	try {
		const { ApiKey } = req.models

		const apiKey = await ApiKey.findOne({
			where: {
				[Op.and]: [
					{
						token: {
							[Op.eq]: token
						}
					},
					{
						allowAccess: {
							[Op.eq]: true
						}
					}
				]
			}
		})

		if (!apiKey) {
			return done(null)
		}

		transaction = await sequelize.transaction()

		await apiKey.update({ lastAccess: dayjs().toISOString() }, { transaction })

		await transaction.commit()

		return done(null, { apiKey: true })
	} catch (e) {
		if (transaction) {
			await transaction.rollback()
		}
		return done(e)
	}
}
