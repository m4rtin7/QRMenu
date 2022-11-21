import { Router } from 'express'

import AuthRouter from './authorization'
import AllergenRouter from './allergens'
import FileRouter from './files'
import RolesRouter from './roles'
import MenuItemsRouter from './menu-items'

import LogsRouter from './logs'

const router = Router({ mergeParams: true })

export default () => {
    router.use('/authorization', AuthRouter())
    router.use('/allergens', AllergenRouter())
    router.use('/files', FileRouter())
    //router.use('/roles', RolesRouter())
    router.use('/:restaurantID/menu-items', MenuItemsRouter())

    router.use('/logs', LogsRouter())

    return router
}
