import supertest from 'supertest'
import { expect } from 'chai'

import { responseSchema } from '../../../../../src/api/v1/authorization/post.login'

const endpoint = '/api/v1/authorization/login'

describe(`[POST] ${endpoint})`, () => {
	it('Should response 401 -  bad password', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.send({
				email: 'kello@tmr.sk',
				password: 'Lopaty123..'
			})
		expect(response.status).to.eq(401)
	})

	it('Should response 401 - bad email', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.send({
				email: 'lubomir.igonda@goodrequest',
				password: 'Lopaty123.'
			})
		expect(response.status).to.eq(401)
	})

	it('Should response 401 - deleted user', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.send({
				email: 'test.nonconfirmeduser@goodrequest.com',
				password: 'Lopaty123.'
			})
		expect(response.status).to.eq(401)
	})

	it('Should response 401 - no activated user', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.send({
				email: 'test.deleteduser@goodrequest.com',
				password: 'Lopaty123.'
			})
		expect(response.status).to.eq(401)
	})

	it('Should response 200', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.send({
				email: 'lubomir.igonda@goodrequest.com',
				password: 'Lopaty123.'
			})
		expect(response.status).to.eq(200)
		expect(response.type).to.eq('application/json')

		const validationResult = responseSchema.validate(response.body)
		expect(validationResult.error).to.eq(undefined)
	})
})
