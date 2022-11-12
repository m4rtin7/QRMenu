import supertest from 'supertest'
import { expect } from 'chai'

import { responseSchema } from '../../../../../src/api/v1/users/delete.user'

const endpoint = (userID: number | string) => `/api/v1/users/${userID}`

describe(`[DELETE] ${endpoint(':userID')})`, () => {
	it('Should response 401 - not token', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.delete(endpoint(7))
			.set('Content-Type', 'application/json')
		const { body, status } = response

		expect(body).to.deep.equal({})
		expect(status).to.eq(401)
	})

	it('Should response 401 - bad token', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.delete(endpoint(7))
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer adshkjashd')
		const { body, status } = response

		expect(body).to.deep.equal({})
		expect(status).to.eq(401)
	})

	it('Should response 403 - no resort', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.delete(endpoint(7))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtManager}`)

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

	it('Should response 403 - no permission in resort', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.delete(endpoint(7))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtManager}`)
			.set('x-resortid', '4')

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

	// TODO: vracat 404 nie 409
	it('Should response 404 - no user in resort', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.delete(endpoint(999))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortid', '13')

		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [
				{
					type: 'ERROR',
					message: 'Používateľ nie je priradený k aktualnemu rezortu'
				}
			]
		})
		expect(status).to.eq(404)
	})

	it('Should response 409 - can not del myself', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.delete(endpoint(3))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortid', '13')

		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [
				{
					type: 'ERROR',
					message: 'Nie je možné zmazať seba samého'
				}
			]
		})
		expect(status).to.eq(409)
	})

	it('Should response 200 - admin can del user in his resort', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.delete(endpoint(4))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortid', '13')

		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(status).to.eq(200)
		const validationResult = responseSchema.validate(body)
		expect(validationResult.error).to.eq(undefined)
	})

	it('Should response 200 - superadmin can del user in his resort', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.delete(endpoint(7))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtSuperAdmin}`)
			.set('x-resortid', '4')

		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(status).to.eq(200)
		const validationResult = responseSchema.validate(body)
		expect(validationResult.error).to.eq(undefined)
	})
})
