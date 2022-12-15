import { Router } from 'express'

import validationMiddleware from '../../../middlewares/validationMiddleware'

import * as getMenuItems from './get.allergens'

const router = Router({ mergeParams: true })

export default () => {
	router.get(
		'/',
		validationMiddleware(getMenuItems.schema),
		getMenuItems.workflow
	)

	return router
}
