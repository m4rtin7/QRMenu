import winston from 'winston'
import WinstonDailyRotateFile from 'winston-daily-rotate-file'
import bunyan from 'bunyan'
import RotatingFileStream from 'bunyan-rotating-file-stream'
import path from 'path'
import config from 'config'
import dayjs from 'dayjs'

import { ILogsCongig } from '../types/interfaces'

const logs: ILogsCongig = config.get('logs')

const errorLogFileName = path.join(logs.logDirectory, 'server/errors/error-%DATE%.log')
const infoLogFileName = path.join(logs.logDirectory, 'server/info/info-%DATE%.log')
const emailLogFileName = path.join(logs.logDirectory, 'server/emails/email-%Y-%m-%d.log')

// instantiate a new Winston Logger with the settings defined above
export default winston.createLogger({
	format: winston.format.combine(
		winston.format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss'
		}),
		winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
	),
	transports: [
		new WinstonDailyRotateFile({
			filename: errorLogFileName,
			datePattern: 'YYYY-MM-DD',
			zippedArchive: false,
			level: 'error',
			maxSize: '500m',
			maxFiles: '120d'
		}),
		new WinstonDailyRotateFile({
			filename: infoLogFileName,
			datePattern: 'YYYY-MM-DD',
			zippedArchive: false,
			level: 'info',
			maxSize: '500m',
			maxFiles: '120d'
		})
	],
	exitOnError: false // do not exit on handled exceptions
})

export const emailLogger = bunyan.createLogger({
	name: 'email',
	streams: [
		{
			stream: new RotatingFileStream({
				path: emailLogFileName,
				period: '1d',
				totalFiles: 30,
				totalSize: '100m',
				gzip: false,
				rotateExisting: true
			})
		}
	],
	time: dayjs().format('DD-MM-YYYY HH:mm:ss')
})
