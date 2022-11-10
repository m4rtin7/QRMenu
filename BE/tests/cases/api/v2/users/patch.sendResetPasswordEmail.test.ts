import supertest from 'supertest'
import { expect } from 'chai'

import { responseSchema } from '../../../../../src/api/v1/users/patch.sendResetPasswordEmail'

const endpoint = (userID: number | string) => `/api/v1/users/${userID}/send-reset-password-email`

describe(`[GET] ${endpoint(':userID')})`, () => {
	it('Bad token, response should return code 401', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(9))
			.set('Content-Type', 'application/json')
		expect(response.status).to.eq(401)
	})

	it('Response should return code 409 user is not confirmed', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(13))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtApi}`)
		expect(response.status).to.eq(409)
		expect(response.type).to.eq('application/json')
	})

	it('Bad token, response should return code 404 user not found', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(999))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtApi}`)
		expect(response.status).to.eq(404)
		expect(response.type).to.eq('application/json')
	})

	it('Response should return code 200', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(9))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtApi}`)
		expect(response.status).to.eq(200)
		expect(response.type).to.eq('application/json')

		const validationResult = responseSchema.validate(response.body)
		expect(validationResult.error).to.eq(undefined)
	})
})
