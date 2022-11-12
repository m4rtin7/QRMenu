import { Request, Response, NextFunction } from 'express'
import util from 'util'
import { v4 } from 'uuid'

// utils
import logger from '../utils/logger'

export default function loggingMiddleware(req: Request, _res: Response, next: NextFunction) {
	try {
		const requestID = v4()

		const reqIP = req.header('x-real-ip') || req.ip // NOTE: x-real-ip is from nginx reverse proxy
		logger.info(`requestID - ${requestID}`)
		logger.info(`url - [${req.method}] ${req.originalUrl}`)
		logger.info(`ip - ${reqIP}`)
		logger.info(`header - ${JSON.stringify(util.inspect(req.headers))}`)
		logger.info(`query - ${JSON.stringify(util.inspect(req.query))}`)
		logger.info(`body - ${JSON.stringify(util.inspect(req.body))}\n`)

		req.requestID = requestID

		return next()
	} catch (e) {
		return next(e)
	}
}
