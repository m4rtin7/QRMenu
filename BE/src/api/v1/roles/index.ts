import { Router } from 'express'
import passport from 'passport'
import permissionMiddleware from '../../../middlewares/permissionMiddleware'

import validationMiddleware from '../../../middlewares/validationMiddleware'
import { PERMISSION } from '../../../utils/enums'

import * as getRoles from './get.roles'
import * as getRole from './get.role'
import * as patchRole from './patch.roles'
import * as postRole from './post.roles'

const router = Router()

export default () => {
	router.get(
		'/',
		passport.authenticate(['jwt-api', 'authtoken']),
		permissionMiddleware([PERMISSION.SUPER_ADMIN, PERMISSION.ADMIN]),
		validationMiddleware(getRoles.schema),
		getRoles.workflow
	)

	router.get(
		'/:roleID',
		passport.authenticate(['jwt-api', 'authtoken']),
		permissionMiddleware([PERMISSION.SUPER_ADMIN, PERMISSION.ADMIN]),
		validationMiddleware(getRole.schema),
		getRole.workflow
	)

	router.post(
		'/',
		passport.authenticate(['jwt-api']),
		permissionMiddleware([PERMISSION.SUPER_ADMIN, PERMISSION.ADMIN]),
		validationMiddleware(postRole.schema),
		postRole.workflow
	)

	router.patch(
		'/:roleID',
		passport.authenticate(['jwt-api']),
		permissionMiddleware([PERMISSION.SUPER_ADMIN, PERMISSION.ADMIN]),
		validationMiddleware(patchRole.schema),
		patchRole.workflow
	)

	return router
}
