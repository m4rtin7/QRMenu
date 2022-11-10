import supertest from 'supertest'
import { expect } from 'chai'
import config from 'config'
import _ from 'lodash'
import { models } from '../../../../../src/db/models'
import { createJwt } from '../../../../../src/utils/auth'
import { IPassportConfig } from '../../../../../src/types/interfaces'
import { responseSchema } from '../../../../../src/api/v1/users/post.userConfirm'

const passportConfig: IPassportConfig = config.get('passport')

const endpoint = '/api/v1/users/confirm'

describe(`[POST] ${endpoint})`, () => {
	let invitationToken: string
	let malformedToken: string

	before(async () => {
		const { User } = models
		const noExistUserId = _.max((await User.findAll()).map(({ id }): number => id)) + 1

		const tokenOptions = {
			audience: passportConfig.jwt.invitation.audience,
			expiresIn: passportConfig.jwt.invitation.exp
		}
		invitationToken = await createJwt({ uid: 5 }, tokenOptions)
		malformedToken = await createJwt({ uid: noExistUserId }, tokenOptions)
	})

	it('Should response code 401 - No invitation token', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
		const { body, status } = response
		expect(body).to.deep.equal({})
		expect(status).to.eq(401)
	})

	it('Should response code 401 - Bad invitation token', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer dsjbsdkhsjdhvbjhv`)
		const { body, status } = response
		expect(body).to.deep.equal({})
		expect(status).to.eq(401)
	})

	it('Should response code 401 - Bad invitation token - user does not exist', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${malformedToken}`)
		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [
				{
					message: 'Používateľ neexistuje',
					type: 'ERROR'
				}
			]
		})
		expect(status).to.eq(401)
	})

	it('Should response code 400 - no name, surname and password in body', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${invitationToken}`)
		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [
				{ message: '"body.name" is required', path: 'body.name', type: 'ERROR' },
				{ message: '"body.surname" is required', path: 'body.surname', type: 'ERROR' },
				{ message: '"body.password" is required', path: 'body.password', type: 'ERROR' }
			]
		})
		expect(status).to.eq(400)
	})

	it('Should response code 400 - no surname and password in body', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${invitationToken}`)
			.send({ name: 'Some' })

		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [
				{ message: '"body.surname" is required', path: 'body.surname', type: 'ERROR' },
				{ message: '"body.password" is required', path: 'body.password', type: 'ERROR' }
			]
		})
		expect(status).to.eq(400)
	})

	it('Should response code 400 - weak password in body', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${invitationToken}`)
			.send({ name: 'Some', surname: 'Testuser', password: 'test' })

		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [
				{
					message: '"body.password" with value "********" fails to match the required pattern: /(?=.{8,})^(?=.*[a-z]+)(?=.*[A-Z]+)(?=.*\\d+)/',
					path: 'body.password',
					type: 'ERROR'
				}
			]
		})
		expect(status).to.eq(400)
	})

	it('Should response code 400 - weak password in body', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${invitationToken}`)
			.send({ name: 'Some', surname: 'Testuser', password: 'test' })

		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [
				{
					message: '"body.password" with value "********" fails to match the required pattern: /(?=.{8,})^(?=.*[a-z]+)(?=.*[A-Z]+)(?=.*\\d+)/',
					path: 'body.password',
					type: 'ERROR'
				}
			]
		})
		expect(status).to.eq(400)
	})

	it('Should response code 200 - user confirmed', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${invitationToken}`)
			.send({ name: 'Some', surname: 'Testuser', password: '123Test*' })

		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [{ message: 'Používateľ bol úspešne vytvorený', type: 'SUCCESS' }]
		})
		expect(status).to.eq(200)
		const validationResult = responseSchema.validate(response.body)
		expect(validationResult.error).to.eq(undefined)
	})
})
