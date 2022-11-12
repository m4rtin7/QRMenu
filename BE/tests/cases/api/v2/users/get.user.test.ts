import supertest from 'supertest'
import { expect } from 'chai'

import { responseSchema } from '../../../../../src/api/v1/users/get.user'

const endpoint = (userID: number | string) => `/api/v1/users/${userID}`

describe(`[GET] ${endpoint(':userID')})`, () => {
	it('Should response code 401 - no token', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.get(endpoint(7))
			.set('Content-Type', 'application/json')
		expect(response.status).to.eq(401)
	})

	it('Should response code 401 - bad token', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.get(endpoint(7))
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ad,kabkb,')
		expect(response.status).to.eq(401)
	})

	it('Should response code 403 - no resort defined', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.get(endpoint(999))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
		expect(response.status).to.eq(403)
		expect(response.type).to.eq('application/json')
	})

	it('Should response code 403 - no permission in resort', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.get(endpoint(999))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '3')
		expect(response.status).to.eq(403)
		expect(response.type).to.eq('application/json')
	})

	it('Should response code 404 - no user in resort', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.get(endpoint(999))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
		expect(response.status).to.eq(404)
	})

	it('Should response code 403 - manager cannot get user information', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.get(endpoint(3))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtManager4}`)
			.set('x-resortID', '4')
		const { body, status, type } = response
		expect(body).to.deep.equal({
			messages: [{ type: 'ERROR', message: 'Používateľovi chýbajú oprávnenia' }]
		})
		expect(type).to.eq('application/json')
		expect(status).to.eq(403)
	})

	it('Should response code 200 - user can see information about hisself', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.get(endpoint(7))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtManager4}`)
			.set('x-resortID', '4')

		const { status, type } = response
		expect(status).to.eq(200)
		expect(type).to.eq('application/json')
		const validationResult = responseSchema.validate(response.body)
		expect(validationResult.error).to.eq(undefined)
	})

	it('Should response code 200 - admin can see user in his resort', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.get(endpoint(3))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')

		const { status, type } = response
		expect(status).to.eq(200)
		expect(type).to.eq('application/json')
		const validationResult = responseSchema.validate(response.body)
		expect(validationResult.error).to.eq(undefined)
	})

	it('Should return code 200 - superadmin can see user', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.get(endpoint(3))
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
