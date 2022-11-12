import { Request, NextFunction, Response } from 'express'
import util from 'util'
import { isEmpty } from 'lodash'

// utils
import ErrorBuilder from '../utils/ErrorBuilder'
import logger from '../utils/logger'
import { ENV, MESSAGE_TYPE } from '../utils/enums'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function errorMiddleware(err: ErrorBuilder, req: Request, res: Response, _next: NextFunction) {
	if (process.env.NODE_ENV === ENV.development) {
		console.log(err)
	}

	// if status does not exist, assign 500
	const errStatus = err.status || 500

	const reqIP = req.header('x-real-ip') || req.ip // NOTE: x-real-ip is from nginx reverse proxy

	// log error to file
	logger.error(`${errStatus} - ${err.message} - ${req.originalUrl} - ${req.method} - ${reqIP}`)
	logger.error(`stack: ${JSON.stringify(util.inspect(err))} \n`)

	let messages

	if (errStatus < 500) {
		if (err.isJoi || !isEmpty(err.items)) {
			messages = err.items
		} else {
			messages = [err.message]
		}
	} else {
		messages = [
			{
				message: req.t('error:Ups, niečo sa pokazilo!'),
				type: MESSAGE_TYPE.ERROR
			}
		]
	}

	// render the error page
	return res.status(errStatus).json({ messages })
}

process.on('unhandledRejection', (err: ErrorBuilder) => {
	const { message, stack, ...rest }: { message: string; stack?: string } = err

	if (process.env.NODE_ENV === ENV.development) {
		console.log(err)
	}

	// log error to file
	logger.error(`${500} - ${message} - unhandled rejection`)
	logger.error(`stack: ${JSON.stringify(util.inspect(stack))} ${!rest ? '\n' : ''}`)
	if (rest) {
		logger.error(`additional error data - ${JSON.stringify(util.inspect(rest))} \n`)
	}
})
