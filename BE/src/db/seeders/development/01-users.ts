import { Op } from 'sequelize'
import { map, find, compact, keyBy } from 'lodash'
import bcrypt from 'bcrypt'

import { models } from '../../models'

// utils
import { SYSTEM_USER, PERMISSION, SUPER_ADMIN_EMAIL } from '../../../utils/enums'

// false or console.log
const logging = false

const now = new Date()

const salt = bcrypt.genSaltSync(10)
const hash = bcrypt.hashSync('Matfyz123.', salt)

const usersData = [
	{
		id: 1,
		name: 'System',
		surname: 'User',
		email: SYSTEM_USER,
		createdBy: 1
	},
	{
		name: 'Super',
		surname: 'Admin',
		email: SUPER_ADMIN_EMAIL,
		hash,
		confirmedAt: now
	},
	{
		name: 'Test',
		surname: 'User',
		email: 'tuser@gmail.com',
		hash,
		confirmedAt: now
	},
	{
		name: 'Test',
		surname: 'ConfirmedUser',
		email: 'test.confirmeduser@goodrequest.com',
		hash,
		confirmedAt: now
	},
	{
		email: 'test.nonconfirmeduser@goodrequest.com',
		hash
	},
	{
		name: 'Test',
		surname: 'DeletedUser',
		email: 'test.deleteduser@goodrequest.com',
		hash,
		destructorEmail: SYSTEM_USER,
		deletedAt: now
	}
]

export async function up() {
	try {
		const { User, Permission,  } = models

		const userEmails = compact(map(usersData, 'destructorEmail'))
		const [systemUser, users] = await Promise.all([
			User.findOne({
				attributes: ['id'],
				where: {
					email: { [Op.eq]: SYSTEM_USER }
				},
				logging
			}),
			User.findAll({
				attributes: ['id', 'email'],
				where: {
					email: { [Op.in]: userEmails }
				},
				logging
			})
		])
		
		const keyedUsers = keyBy(users, 'email')

		const resultUsersData = map(usersData, (user) => ({
			name: user.name || null,
			surname: user.surname || null,
			email: user.email,
			hash: user.hash,
			confirmedAt: user.confirmedAt || null,
			deletedBy: keyedUsers[user.destructorEmail]?.id || null,
			deletedAt: user.deletedAt || null,
			createdBy: systemUser.id
		}))

		const createdUsers = await User.bulkCreate(resultUsersData, {
			logging,
			applicationLogging: false
		})

		return Promise.resolve()
	} catch (err) {
		return Promise.reject(err)
	}
}

export function down() {
	throw new Error('Not implemented fuction')
}
