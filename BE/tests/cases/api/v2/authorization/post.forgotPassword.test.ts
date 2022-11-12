import supertest from 'supertest'
import { expect } from 'chai'

import { responseSchema } from '../../../../../src/api/v1/authorization/post.forgotPassword'

const endpoint = '/api/v1/authorization/forgot-password'

describe(`[POST] ${endpoint})`, () => {
	it('Should response 400 - bad email format (just text)', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.send({
				email: 'randomemailgoodrequest'
			})
		expect(response.status).to.eq(400)
		expect(response.type).to.eq('application/json')
	})

	it('Should response code 400 -  bad email format (without domain)', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.send({
				email: 'randomemail@goodrequest'
			})
		expect(response.status).to.eq(400)
		expect(response.type).to.eq('application/json')
	})

	it('Should return 400 - for bad email format (without @)', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.send({
				email: 'randomemailgoodrequest.com'
			})
		expect(response.status).to.eq(400)
		expect(response.type).to.eq('application/json')
	})

	it('Should response 400 - bad email format (without prefix)', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.send({
				email: '@goodrequest.com'
			})
		expect(response.status).to.eq(400)
		expect(response.type).to.eq('application/json')
	})

	it('Should response 400 -  bad email format (without postfix)', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.send({
				email: 'test@.com'
			})
		expect(response.status).to.eq(400)
		expect(response.type).to.eq('application/json')
	})

	// TODO: nemalo by pri zmazanom, nepotvrdenom a neexistujucom userovi vratiti 404 resp. 403?
	it('Should response 200 - deleted user', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.send({
				email: 'test.deleteduser@goodrequest.com.com'
			})
		expect(response.status).to.eq(200)
		expect(response.type).to.eq('application/json')
	})

	it('Should response 200 - user does not exist', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.send({
				email: 'randomemail@goodrequest.com'
			})
		expect(response.status).to.eq(200)
		expect(response.type).to.eq('application/json')
	})

	it('Should response 200 - unconfirmed user', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.send({
				email: 'test.nonconfirmeduser@goodrequest.com'
			})
		expect(response.status).to.eq(200)
		expect(response.type).to.eq('application/json')
	})

	it('Should response code 200', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.send({
				email: 'test.confirmeduser@goodrequest.com'
			})
		expect(response.status).to.eq(200)
		expect(response.type).to.eq('application/json')

		const validationResult = responseSchema.validate(response.body)
		expect(validationResult.error).to.eq(undefined)
	})
})
