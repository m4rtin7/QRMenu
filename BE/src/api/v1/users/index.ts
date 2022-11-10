import { Router } from 'express'
import passport from 'passport'

import validationMiddleware from '../../../middlewares/validationMiddleware'
import permissionMiddleware from '../../../middlewares/permissionMiddleware'
import { PERMISSION } from '../../../utils/enums'

import * as getUsers from './get.users'
import * as getUser from './get.user'
import * as postAssignRoles from './post.assignRoles'
import * as postUser from './post.user'
import * as postUserConfirm from './post.userConfirm'
import * as patchResendRegistrationEmail from './patch.resendRegistrationEmail'
import * as patchSendResetPasswordEmail from './patch.sendResetPasswordEmail'
import * as patchUser from './patch.user'
import * as deleteUser from './delete.user'

const router = Router()

export default () => {
	router.get(
		'/',
		passport.authenticate(['jwt-api']),
		permissionMiddleware([PERMISSION.SUPER_ADMIN, PERMISSION.ADMIN, PERMISSION.USER_LIST]),
		validationMiddleware(getUsers.schema),
		getUsers.workflow
	)

	router.get(
		'/:userID',
		passport.authenticate(['jwt-api']),
		permissionMiddleware([PERMISSION.SUPER_ADMIN, PERMISSION.ADMIN, PERMISSION.USER_EDIT, PERMISSION.USER_LIST], true),
		validationMiddleware(getUser.schema),
		getUser.workflow
	)

	router.post(
		'/:userID/assign-roles',
		passport.authenticate(['jwt-api']),
		permissionMiddleware([PERMISSION.SUPER_ADMIN, PERMISSION.ADMIN]),
		validationMiddleware(postAssignRoles.schema),
		postAssignRoles.workflow
	)

	router.post(
		'/',
		passport.authenticate(['jwt-api']),
		permissionMiddleware([PERMISSION.SUPER_ADMIN, PERMISSION.ADMIN, PERMISSION.USER_CREATE]),
		validationMiddleware(postUser.schema()),
		postUser.workflow
	)

	router.post('/confirm', passport.authenticate('jwt-invitation'), validationMiddleware(postUserConfirm.schema), postUserConfirm.workflow)

	router.patch(
		'/:userID/resend-registration-email',
		passport.authenticate(['jwt-api']),
		permissionMiddleware([PERMISSION.SUPER_ADMIN, PERMISSION.ADMIN, PERMISSION.USER_EDIT]),
		validationMiddleware(patchResendRegistrationEmail.schema),
		patchResendRegistrationEmail.workflow
	)

	router.patch(
		'/:userID/send-reset-password-email',
		passport.authenticate(['jwt-api']),
		permissionMiddleware([PERMISSION.SUPER_ADMIN, PERMISSION.ADMIN, PERMISSION.USER_EDIT]),
		validationMiddleware(patchSendResetPasswordEmail.schema),
		patchSendResetPasswordEmail.workflow
	)

	router.patch(
		'/:userID',
		passport.authenticate(['jwt-api']),
		permissionMiddleware([PERMISSION.SUPER_ADMIN, PERMISSION.ADMIN, PERMISSION.USER_EDIT], true),
		validationMiddleware(patchUser.schema()),
		patchUser.workflow
	)

	router.delete(
		'/:userID',
		passport.authenticate(['jwt-api']),
		permissionMiddleware([PERMISSION.SUPER_ADMIN, PERMISSION.ADMIN, PERMISSION.USER_DELETE]),
		validationMiddleware(deleteUser.schema),
		deleteUser.workflow
	)

	return router
}
