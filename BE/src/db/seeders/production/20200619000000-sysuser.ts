import { models } from '../../models'
import { Op, QueryInterface } from 'sequelize'
import { maxBy } from 'lodash'

// utils
import { SYSTEM_USER } from '../../../utils/enums'

// false or console.log
const logging = false

export const usersData = [{
	id: 1,
	name: 'System',
	surname: 'User',
	email: SYSTEM_USER,
	createdBy: 1
}]

export async function up(queryInterface: QueryInterface) {
	try {
		const { User } = models
		let writeData = [...usersData] as any[];

		await User.bulkCreate(writeData, { applicationLogging: false })
		const maxItemID = maxBy(writeData, 'id')

		await queryInterface.sequelize.query(`ALTER SEQUENCE "public"."${User.tableName}_id_seq" RESTART WITH ${maxItemID.id + 1};`)
		return await Promise.resolve();
	} catch (err) {
		return Promise.reject(err)
	}
}

export function down() {
	throw new Error('Not implemented fuction')
}
