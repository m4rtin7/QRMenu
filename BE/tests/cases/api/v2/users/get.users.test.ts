import supertest from 'supertest'
import { expect } from 'chai'

import { responseSchema } from '../../../../../src/api/v1/users/get.users'

const endpoint = '/api/v1/users'

const optionalQueryParams = {
	order: 'fullName:asc',
	limit: 25,
	page: 1
}

describe(`[GET] ${endpoint})`, () => {
	it('Should response code 401 - no token', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.get(endpoint)
			.set('Content-Type', 'application/json')
		const { body, status } = response
		expect(body).to.deep.equal({})
		expect(status).to.eq(401)
	})

	it('Should response code 403 - no x-resortID', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.get(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
		const { body, status, type } = response

		expect(body).to.deep.equal({ messages: [{ type: 'ERROR', message: 'Nedefinovaný resort' }] })
		expect(status).to.eq(403)
		expect(type).to.eq('application/json')
	})

	it('Should response code 403 - user does not have permission in resort(4)', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.get(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '4')
		const { body, status, type } = response
		expect(body).to.deep.equal({ messages: [{ type: 'ERROR', message: 'Používateľovi chýbajú oprávnenia' }] })
		expect(status).to.eq(403)
		expect(type).to.eq('application/json')
	})

	it('Should response code 403 - manager cannot list users', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.get(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtManager4}`)
			.set('x-resortID', '4')
		const { body, status, type } = response
		expect(body).to.deep.equal({ messages: [{ type: 'ERROR', message: 'Používateľovi chýbajú oprávnenia' }] })
		expect(status).to.eq(403)
		expect(type).to.eq('application/json')
	})

	it('Should response code 200 - admin can see info', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.get(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')

		const { status, type } = response
		expect(status).to.eq(200)
		expect(type).to.eq('application/json')
		const validationResult = responseSchema.validate(response.body)
		expect(validationResult.error).to.eq(undefined)
	})

	it('Should return code 200 - superAdmin can see info', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.get(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtSuperAdmin}`)
			.set('x-resortID', '13')

		const { status, type } = response
		expect(status).to.eq(200)
		expect(type).to.eq('application/json')
		const validationResult = responseSchema.validate(response.body)
		expect(validationResult.error).to.eq(undefined)
	})
})
