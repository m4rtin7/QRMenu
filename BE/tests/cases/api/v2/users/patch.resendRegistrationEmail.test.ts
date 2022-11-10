import supertest from 'supertest'
import { expect } from 'chai'

import { responseSchema } from '../../../../../src/api/v1/users/patch.resendRegistrationEmail'

const endpoint = (userID: number | string) => `/api/v1/users/${userID}/resend-registration-email`

describe(`[PATCH] ${endpoint(':userID')})`, () => {
	it('Should response code 401 - no token', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(13))
			.set('Content-Type', 'application/json')
		const { body, status } = response
		expect(body).to.deep.equal({})
		expect(status).to.eq(401)
	})

	it('Should response code 401 - bad token', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(13))
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ad,kabkb,')

		const { body, status } = response
		expect(body).to.deep.equal({})
		expect(status).to.eq(401)
	})

	it('Should response code 403 - no resort', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(13))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)

		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [
				{
					type: 'ERROR',
					message: 'Nedefinovaný resort'
				}
			]
		})
		expect(status).to.eq(403)
	})

	it('Should response code 403 - manager can not resend registration mail', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(13))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtManager}`)
			.set('x-resortID', '13')

		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [
				{
					type: 'ERROR',
					message: 'Používateľovi chýbajú oprávnenia'
				}
			]
		})
		expect(status).to.eq(403)
	})

	it('Should response code 404 - user does not exist', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(13))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')

		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [
				{
					type: 'ERROR',
					message: 'Používateľ nebol nájdený'
				}
			]
		})
		expect(status).to.eq(404)
	})

	it('Should response code 409 - user has confirmed account already', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(3))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')

		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [
				{
					type: 'ERROR',
					message: 'Používateľ už má potvrdený účet'
				}
			]
		})
		expect(status).to.eq(409)
	})

	it('Should response code 200 - admin can resend ', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(5))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')

		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(status).to.eq(200)
		const validationResult = responseSchema.validate(body)
		expect(validationResult.error).to.eq(undefined)
	})

	it('Should response code 200 - superadmin can resend ', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(5))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtSuperAdmin}`)
			.set('x-resortID', '13')

		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(status).to.eq(200)
		const validationResult = responseSchema.validate(body)
		expect(validationResult.error).to.eq(undefined)
	})
})
