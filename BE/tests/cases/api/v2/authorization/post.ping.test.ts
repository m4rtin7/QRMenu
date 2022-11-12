import supertest from 'supertest'
import { expect } from 'chai'

import { responseSchema } from '../../../../../src/api/v1/authorization/post.ping'

const endpoint = '/api/v1/authorization/ping'

describe(`[POST] ${endpoint})`, () => {
	it('Should response 401 - bad token', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer some-random-token')
		expect(response.status).to.eq(401)
	})

	it('Should response 200  - user himself', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtManager}`)
		expect(response.status).to.eq(200)
		expect(response.type).to.eq('application/json')

		const validationResult = responseSchema.validate(response.body)
		expect(validationResult.error).to.eq(undefined)
	})
})
