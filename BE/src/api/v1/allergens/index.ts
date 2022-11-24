import { Router } from 'express'
import passport from 'passport'
import permissionMiddleware from '../../../middlewares/permissionMiddleware'

import validationMiddleware from '../../../middlewares/validationMiddleware'
import { PERMISSION } from '../../../utils/enums'

import * as getMenuItems from './get.allergens'
//import * as deletemMenuItem from './delete.menuItem'

const router = Router({ mergeParams: true })

export default () => {
	router.get(
		'/',
		validationMiddleware(getMenuItems.schema),
		getMenuItems.workflow
	)

	return router
}
