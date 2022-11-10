import express, { Router } from 'express'
import passport from 'passport'
import config from 'config'

// middlewares
import validationMiddleware from '../../../middlewares/validationMiddleware'

// utils
import diskMulter from '../../../utils/multer'
import { IMulterConfig, IServerConfig } from '../../../types/interfaces'

import * as postFile from './post.file'

const router = Router()
const multerConfig: IMulterConfig = config.get('multer')
const serverConfig: IServerConfig = config.get('server')

const upload = diskMulter(multerConfig.maxSize)

export default () => {
	router.post('/', passport.authenticate(['jwt-api']), upload.single('file'), validationMiddleware(postFile.schema), postFile.workflow)

	console.log(serverConfig.filesPath);
	router.get('/*', express.static(serverConfig.filesPath))

	return router
}
