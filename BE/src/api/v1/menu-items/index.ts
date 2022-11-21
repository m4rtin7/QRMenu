import { Router } from 'express'
import passport from 'passport'
import permissionMiddleware from '../../../middlewares/permissionMiddleware'

import validationMiddleware from '../../../middlewares/validationMiddleware'
import { PERMISSION } from '../../../utils/enums'

import * as getMenuItems from './get.menuItems'
import * as postMenuItem from './post.menuItem'
import * as patchMenuItem from './patch.menuItem'
//import * as deletemMenuItem from './delete.menuItem'

const router = Router({ mergeParams: true })

export default () => {
	router.get(
		'/',
		validationMiddleware(getMenuItems.schema),
		getMenuItems.workflow
	)

	router.post(
		'/',
		passport.authenticate(['jwt-api']),
		validationMiddleware(postMenuItem.schema),
		postMenuItem.workflow
	)

	router.patch(
		'/:menuItemID',
		passport.authenticate(['jwt-api']),
		validationMiddleware(patchMenuItem.schema),
		patchMenuItem.workflow
	)

	// router.delete(
	// 	'/:menuItemID',
	// 	passport.authenticate(['jwt-api']),
	// 	permissionMiddleware([PERMISSION.SUPER_ADMIN, PERMISSION.ADMIN, PERMISSION.USER]),
	// 	validationMiddleware(deletemMenuItem.schema),
	// 	deletemMenuItem.workflow
	// )

	return router
}
