import supertest from 'supertest'
import { expect } from 'chai'

import { responseSchema } from '../../../../../src/api/v1/users/patch.user'

const endpoint = (userID: number | string) => `/api/v1/users/${userID}`

describe(`[PATCH]] ${endpoint(':userID')})`, () => {
	it('Should response code 401 - no token', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(9))
			.set('Content-Type', 'application/json')

		const { body, status } = response
		expect(body).to.deep.equal({})
		expect(status).to.eq(401)
	})

	it('Should response code 401 - bad token', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(9))
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer nakkabdx')
		const { body, status } = response
		expect(body).to.deep.equal({})
		expect(status).to.eq(401)
	})

	it('Should response code 403 (Forbidden)- no resort', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(9))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtManager4}`)

		const { body, status, type } = response
		expect(body).to.deep.equal({
			messages: [{ type: 'ERROR', message: 'Nedefinovaný resort' }]
		})
		expect(status).to.eq(403)
		expect(type).to.eq('application/json')
	})

	it('Should response code 403 (Forbidden) - no resort', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(9))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtManager4}`)
			.set('x-resortID', '1')

		const { body, status, type } = response
		expect(body).to.deep.equal({
			messages: [{ type: 'ERROR', message: 'Používateľovi chýbajú oprávnenia' }]
		})
		expect(status).to.eq(403)
		expect(type).to.eq('application/json')
	})

	it('Should response code 403 (Forbidden)- no permissions in resort', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(9))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtManager4}`)
			.set('x-resortID', '1')

		const { body, status, type } = response
		expect(body).to.deep.equal({
			messages: [{ type: 'ERROR', message: 'Používateľovi chýbajú oprávnenia' }]
		})
		expect(status).to.eq(403)
		expect(type).to.eq('application/json')
	})

	// TODO: phone nie je povinny udaj (moze byt null), ked sa zadava bolo by dobre ho ceknut ci je v dobrom formate a tak
	it('Should response code 400 - no name, surname, email, ', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(9))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')

		const { body, status, type } = response
		expect(body).to.deep.equal({
			messages: [
				{ type: 'ERROR', message: '"body.name" is required', path: 'body.name' },
				{ type: 'ERROR', message: '"body.surname" is required', path: 'body.surname' },
				{ type: 'ERROR', message: '"body.email" is required', path: 'body.email' },
				{ type: 'ERROR', message: '"body.phone" is required', path: 'body.phone' }
			]
		})
		expect(status).to.eq(400)
		expect(type).to.eq('application/json')
	})

	it('Should response code 400 - no surname, email, ', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(9))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
			.send({ name: 'Peter' })

		const { body, status, type } = response
		expect(body).to.deep.equal({
			messages: [
				{ type: 'ERROR', message: '"body.surname" is required', path: 'body.surname' },
				{ type: 'ERROR', message: '"body.email" is required', path: 'body.email' },
				{ type: 'ERROR', message: '"body.phone" is required', path: 'body.phone' }
			]
		})
		expect(status).to.eq(400)
		expect(type).to.eq('application/json')
	})

	it('Should response code 400 - no surname, email, ', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(9))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
			.send({ name: 'Peter', surname: 'Testsurname' })

		const { body, status, type } = response
		expect(body).to.deep.equal({
			messages: [
				{ type: 'ERROR', message: '"body.email" is required', path: 'body.email' },
				{ type: 'ERROR', message: '"body.phone" is required', path: 'body.phone' }
			]
		})
		expect(status).to.eq(400)
		expect(type).to.eq('application/json')
	})

	it('Should response code 400 - wrong email, ', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(9))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
			.send({ name: 'Peter', surname: 'Testsurname', email: 'test' })

		const { body, status, type } = response
		expect(body).to.deep.equal({
			messages: [
				{ type: 'ERROR', message: 'error:Nesprávny formát emailovej adresy', path: 'body.email' },
				{ type: 'ERROR', message: '"body.phone" is required', path: 'body.phone' }
			]
		})
		expect(status).to.eq(400)
		expect(type).to.eq('application/json')
	})

	it('Should response code 404 - user does not exists', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(9999))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtSuperAdmin}`)
			.set('x-resortID', '4')
			.send({
				name: 'ChangedName',
				surname: 'ChangedSurname',
				// email: 'chenged.email@test.com',
				email: 'kello@tmr.sk',
				phone: '888888'
			})

		const { body, status, type } = response
		expect(body).to.deep.equal({
			messages: [{ type: 'ERROR', message: 'Používateľ nebol nájdený' }]
		})
		expect(status).to.eq(404)
		expect(type).to.eq('application/json')
	})

	it('Should response code 409 - user with email already exists', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(4))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
			.send({
				name: 'ChangedName',
				surname: 'ChangedSurname',
				email: 'kello@tmr.sk',
				phone: '888888'
			})

		const { body, status, type } = response
		expect(body).to.deep.equal({
			messages: [{ type: 'ERROR', message: 'Používateľ so zadaným emailom už existuje' }]
		})
		expect(status).to.eq(409)
		expect(type).to.eq('application/json')
	})

	it('Should response code 403 - user cannot change his email', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(7))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtManager4}`)
			.set('x-resortID', '4')
			.send({
				name: 'ChangedName',
				surname: 'ChangedSurname',
				email: 'kello1@tmr.sk',
				phone: '888888'
			})

		const { status, type, body } = response
		expect(body).to.deep.equal({ messages: [{ message: 'Používateľ nemá oprávnenie na zmenu emailovej adresy', type: 'ERROR' }] })

		expect(status).to.eq(403)
		expect(type).to.eq('application/json')
	})

	it('Should response code 200 - user can change himself (without email)', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(7))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtManager4}`)
			.set('x-resortID', '4')
			.send({
				name: 'ChangedName',
				surname: 'ChangedSurname',
				email: 'kello@tmr.sk',
				phone: '888888'
			})

		const { status, type, body } = response
		expect(status).to.eq(200)
		expect(type).to.eq('application/json')
		const validationResult = responseSchema.validate(body)
		expect(validationResult.error).to.eq(undefined)
	})

	it('Should response code 200 - admin can change user', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(4))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
			.send({
				name: 'ChangedName',
				surname: 'ChangedSurname',
				email: 'kello@tmr1.sk',
				phone: '888888'
			})

		const { status, type, body } = response
		expect(status).to.eq(200)
		expect(type).to.eq('application/json')
		const validationResult = responseSchema.validate(body)
		expect(validationResult.error).to.eq(undefined)
	})

	it('Should response code 200 - superadmin can change user', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.patch(endpoint(4))
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
			.send({
				name: 'ChangedName',
				surname: 'ChangedSurname',
				email: 'kello@tmr1.sk',
				phone: '888888'
			})

		const { status, type, body } = response
		expect(status).to.eq(200)
		expect(type).to.eq('application/json')
		const validationResult = responseSchema.validate(body)
		expect(validationResult.error).to.eq(undefined)
	})
})
