import { expect } from 'chai'
import config from 'config'
import supertest from 'supertest'
import { models } from '../../../../../src/db/models'
import { createJwt } from '../../../../../src/utils/auth'
import { IPassportConfig } from '../../../../../src/types/interfaces'
import { responseSchema } from '../../../../../src/api/v1/authorization/post.resetPassword'

const passportConfig: IPassportConfig = config.get('passport')

const endpoint = '/api/v1/authorization/reset-password'

describe(`[POST] ${endpoint})`, () => {
	let forgottenPasswordToken: string
	before(async () => {
		const { User } = models
		const user = await User.findByPk(4)
		const tokenOptions = {
			audience: passportConfig.jwt.forgottenPassword.audience,
			expiresIn: passportConfig.jwt.forgottenPassword.exp
		}
		const tokenSecret = `${passportConfig.jwt.secretOrKey}${user.hash}`
		forgottenPasswordToken = await createJwt({ uid: user.id }, tokenOptions, tokenSecret)
	})
	it('Should response 401 - no token', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
		expect(response.status).to.eq(401)
	})
	it('Should response 401 - bad token', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtUser}`)
		expect(response.status).to.eq(401)
	})
	it('Should response 400 - body has to contain password field', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${forgottenPasswordToken}`)
		expect(response.status).to.eq(400)
		expect(response.type).to.eq('application/json')
	})
	it('Should response 400 - weak password', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${forgottenPasswordToken}`)
			.send({
				password: 'Lopaty1'
			})
		expect(response.status).to.eq(400)
		expect(response.type).to.eq('application/json')
	})

	it('Should response 200', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${forgottenPasswordToken}`)
			.send({
				password: 'Lopaty123.'
			})
		const validationResult = responseSchema.validate(response.body)
		expect(validationResult.error).to.eq(undefined)
		expect(response.status).to.eq(200)
		expect(response.type).to.eq('application/json')
	})
})
