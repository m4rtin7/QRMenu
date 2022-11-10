import supertest from 'supertest'
import { expect } from 'chai'

import { responseSchema } from '../../../../../src/api/v1/users/post.assignRoles'

const endpoint = (userID: number | string) => `/api/v1/users/${userID}/assign-roles`

const requiredBodyData = {
	roleIDs: [1]
}

describe(`[POST] ${endpoint(':userID')}`, () => {
	it('Should response 401 - no token', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint(9))
			.set('Content-Type', 'application/json')
		const { body, status } = response
		expect(body).to.deep.equal({})
		expect(status).to.eq(401)
	})

	it('Should response 401 - bad token', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint(9))
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer nakkabdx')
		const { body, status } = response
		expect(body).to.deep.equal({})
		expect(status).to.eq(401)
	})

	it('Should response 403 - no resort', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint(9))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtManager}`)
		const { body, status } = response
		expect(body).to.deep.equal({
			messages: [{ type: 'ERROR', message: 'Nedefinovaný resort' }]
		})
		expect(status).to.eq(403)
	})

	it('Should response 403 - manager cannot assign roles', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint(9))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtManager}`)
			.set('x-resortID', '13')
		const { body, status } = response
		expect(body).to.deep.equal({
			messages: [{ type: 'ERROR', message: 'Používateľovi chýbajú oprávnenia' }]
		})
		expect(status).to.eq(403)
	})

	it('Should response 400 - field resort has to be in body', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint(9))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
		const { body, status } = response
		expect(body).to.deep.equal({
			messages: [{ type: 'ERROR', message: '"body.resorts" is required', path: 'body.resorts' }]
		})
		expect(status).to.eq(400)
	})

	it('Should response 400 - field resort has to be an array', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint(9))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
			.send({ resorts: '' })

		const { body, status } = response
		expect(body).to.deep.equal({
			messages: [{ type: 'ERROR', message: '"body.resorts" must be an array', path: 'body.resorts' }]
		})
		expect(status).to.eq(400)
	})

	it('Should response 404 - no user in resort', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint(9))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
			.send({ resorts: [] })

		const { body, status } = response
		expect(body).to.deep.equal({
			messages: [{ type: 'ERROR', message: 'Používateľ nebol nájdený' }]
		})
		expect(status).to.eq(404)
	})

	it('Should response 404 - ?', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint(5))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
			.send({ resorts: [] })

		const { body, status } = response
		expect(body).to.deep.equal({
			messages: [{ type: 'ERROR', message: 'Používateľ nebol nájdený' }]
		})
		expect(status).to.eq(404)
	})
})
