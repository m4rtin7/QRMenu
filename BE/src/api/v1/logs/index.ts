import { Router } from 'express'
import passport from 'passport'
import permissionMiddleware from '../../../middlewares/permissionMiddleware'

import validationMiddleware from '../../../middlewares/validationMiddleware'
import { PERMISSION } from '../../../utils/enums'

import * as getLogs from './get.logs'
import * as getLog from './get.log'

const router = Router()

export default () => {
	router.get(
		'/',
		passport.authenticate(['jwt-api', 'authtoken']),
		permissionMiddleware([PERMISSION.SUPER_ADMIN, PERMISSION.ADMIN]), 
		validationMiddleware(getLogs.schema),
		getLogs.workflow
	)

    router.get(
		'/:logID',
		passport.authenticate(['jwt-api', 'authtoken']),
		permissionMiddleware([PERMISSION.SUPER_ADMIN, PERMISSION.ADMIN]), 
		validationMiddleware(getLog.schema),
		getLog.workflow
	)

	return router
}
