import supertest from 'supertest'
import { expect } from 'chai'
import _ from 'lodash'
import { models } from '../../../../../src/db/models'
import { responseSchema } from '../../../../../src/api/v1/users/post.user'

const endpoint = '/api/v1/users'

describe(`[POST] ${endpoint})`, () => {
	let undefinedRoleId: number
	let undefinedResortId: number

	before(async () => {
		const { Role, Resort } = models
		undefinedRoleId = _.max((await Role.findAll()).map(({ id }): number => id)) + 1
		undefinedResortId = _.max((await Resort.findAll()).map(({ id }): number => id)) + 1
	})
	it('Should response 401 - bad token', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
		expect(response.status).to.eq(401)
	})

	it('Should response 403 - no resort', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
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

	it('Should response 403 - no permissions in resort', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '4')
		const { status, body } = response
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

	it('Should response 400 - email, resorts is required', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [
				{
					type: 'ERROR',
					path: 'body.email',
					message: '"body.email" is required'
				},
				{
					type: 'ERROR',
					path: 'body.resorts',
					message: '"body.resorts" is required'
				}
			]
		})
		expect(status).to.eq(400)
	})

	it('Should response 400 - email can not be empty, resorts is required', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
			.send({ email: '' })
		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [
				{
					type: 'ERROR',
					path: 'body.email',
					message: '"body.email" is not allowed to be empty'
				},
				{
					type: 'ERROR',
					path: 'body.resorts',
					message: '"body.resorts" is required'
				}
			]
		})
		expect(status).to.eq(400)
	})

	it('Should response 400 - wrong email format, resorts is required', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
			.send({ email: 'test@test' })
		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [
				{
					type: 'ERROR',
					path: 'body.email',
					message: 'error:Nesprávny formát emailovej adresy'
				},
				{
					type: 'ERROR',
					path: 'body.resorts',
					message: '"body.resorts" is required'
				}
			]
		})
		expect(status).to.eq(400)
	})

	it('Should response 400 - resorts is required', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
			.send({ email: 'test@test.sk' })
		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [
				{
					type: 'ERROR',
					path: 'body.resorts',
					message: '"body.resorts" is required'
				}
			]
		})
		expect(status).to.eq(400)
	})

	it('Should response 400 - resorts must be array', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
			.send({ email: 'test@test.sk', resorts: 'P' })
		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [
				{
					type: 'ERROR',
					path: 'body.resorts',
					message: '"body.resorts" must be an array'
				}
			]
		})
		expect(status).to.eq(400)
	})

	it('Should response 400 - resort must be of type object', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
			.send({ email: 'test@test.sk', resorts: ['4'] })
		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [
				{
					type: 'ERROR',
					path: 'body.resorts.0',
					message: '"body.resorts[0]" must be of type object'
				}
			]
		})
		expect(status).to.eq(400)
	})

	// TODO: @Lubo podla mna by mal mat 400 status ako bad request
	it('Should response 400 - resort has to be assigned to user', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
			.send({ email: 'test@test.sk', resorts: [{ resortID: '4', roleID: '1' }] })
		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [
				{
					type: 'ERROR',
					message: 'Nemáte priradený jeden alebo viacej rezortov'
				}
			]
		})
		expect(status).to.eq(409)
	})

	it('Should response 403 - Manager cannot create users', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtManager4}`)
			.set('x-resortID', '13')
			.send({ email: 'test@test.sk', resorts: [{ resortID: '4', roleID: '1' }] })

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

	it('Should response 400 - role must be number', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
			.send({ email: 'test@test.sk', resorts: [{ resortID: '13', roleID: 'saas' }] })
		const { body, status, type } = response
		expect(type).to.eq('application/json')

		expect(body).to.deep.equal({
			messages: [
				{
					type: 'ERROR',
					message: '"body.resorts[0].roleID" must be a number',
					path: 'body.resorts.0.roleID'
				}
			]
		})
		expect(status).to.eq(400)
	})

	it('Should response 404 - role does not exist', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
			.send({ email: 'test@test.sk', resorts: [{ resortID: '13', roleID: undefinedRoleId }] })
		const { body, status, type } = response
		expect(type).to.eq('application/json')

		expect(body).to.deep.equal({
			messages: [
				{
					type: 'ERROR',
					message: 'Rola nebola nájdená'
				}
			]
		})
		expect(status).to.eq(404)
	})

	it('Should response 404 - resort does not exist', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtSuperAdmin}`)
			.set('x-resortID', '13')
			.send({ email: 'test@test.sk', resorts: [{ resortID: undefinedResortId, roleID: '1' }] })
		const { body, status, type } = response
		expect(type).to.eq('application/json')

		expect(body).to.deep.equal({
			messages: [
				{
					type: 'ERROR',
					message: 'Rezorty neboli nájdené'
				}
			]
		})
		expect(status).to.eq(404)
	})

	it('Should response 403 - Admin cannot crate new admin - just superadmin', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
			.send({ email: 'test@test.sk', resorts: [{ resortID: '13', roleID: '1' }] })

		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [
				{
					type: 'ERROR',
					message: 'Používateľa s administrátorskym oprávnením môže vytvoriť len superadmin'
				}
			]
		})
		expect(status).to.eq(403)
	})

	it('Should response 409 - user with email already exists', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
			.send({ email: 'kello@tmr.sk', resorts: [{ resortID: '13', roleID: '1' }] })

		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [
				{
					type: 'ERROR',
					message: 'Používateľ so zadaným emailom už existuje'
				}
			]
		})
		expect(status).to.eq(409)
	})

	it('Should response 403 - user with admin permissions can be created just by superadmin', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
			.send({ email: 'test@test.sk', resorts: [{ resortID: '13', roleID: 1 }] })

		const { body, status, type } = response
		expect(type).to.eq('application/json')
		expect(body).to.deep.equal({
			messages: [
				{
					message: 'Používateľa s administrátorskym oprávnením môže vytvoriť len superadmin',
					type: 'ERROR'
				}
			]
		})
		expect(status).to.eq(403)
	})

	it('Should response 200 - creation of manager (by resort admin)', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtAdmin}`)
			.set('x-resortID', '13')
			.send({ email: 'testManager@test.sk', resorts: [{ resortID: '13', roleID: '2' }] })
		expect(response.status).to.eq(200)
		expect(response.type).to.eq('application/json')
		const validationResult = responseSchema.validate(response.body)
		expect(validationResult.error).to.eq(undefined)
	})

	it('Should response 200 - creation of admin (by super admin)', async () => {
		const response = await supertest(require(`${process.cwd()}/src/app`).default)
			.post(endpoint)
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${process.env.jwtSuperAdmin}`)
			.set('x-resortID', '13')
			.send({ email: 'testAdmin@test.sk', resorts: [{ resortID: '13', roleID: '1' }] })
		expect(response.status).to.eq(200)
		expect(response.type).to.eq('application/json')
		const validationResult = responseSchema.validate(response.body)
		expect(validationResult.error).to.eq(undefined)
	})
})
