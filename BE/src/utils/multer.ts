import { Request, Express } from 'express'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { get, split, last } from 'lodash'
import util from 'util'
import crypto from 'crypto'
import config from 'config'

import ErrorBuilder from './ErrorBuilder'
import logger from './logger'
import { IServerConfig } from '../types/interfaces'
import { getFileDataType } from './helper'
import { FILE_DATA_TYPE } from './enums'

const serverConfig: IServerConfig = config.get('server')

/**
 * Returns multer instance based on provided options
 * @param {number} fileSize Maximum allowed file size
 * @param {RegExp} [allowedFileExtensionsRegex] RegExp for allowed file extensions
 * @param {RegExp} [allowedMimeTypesRegex] RegExp for allowed mime types
 * @returns {multer.Instance} multer instance
 */

export default (fileSize: number): ReturnType<typeof multer> =>
	multer({
		storage: multer.diskStorage({
			destination: (req: Request, file: Express.Multer.File, callback: (error: Error, destination: string) => void) => {
				const { body } = req

				if (file.size > fileSize) {
					return callback(new ErrorBuilder(400, req.t('error:Súbor je príliš veľký')), null)
				}

				if (!get(body, 'pathToFolder')) {
					return callback(new ErrorBuilder(400, req.t('error:Nie je zadaný názov podpriečinku')), null)
				}

				const resultPath = serverConfig.tempPath

				// check if path exists and if we have rights to write to it
				return fs.access(resultPath, fs.constants.W_OK, (err) => {
					if (err) {
						const reqIP = req.header('x-real-ip') || req.ip // NOTE: x-real-ip is from nginx reverse proxy
						switch (err.code) {
							case 'ENOENT':
								// create filesystem errors log
								logger.error(`${403} - ${err.message} - ${req.originalUrl} - ${req.method} - ${reqIP}`)
								logger.error(`stack: ${JSON.stringify(util.inspect(err.stack))} \n`)
								return callback(new ErrorBuilder(403, req.t('error:Nie je možné nahrať súbor, cieľový adresár neexistuje')), null)
							case 'LIMIT_FILE_SIZE':
								// create filesystem errors log
								logger.error(`${418} - ${err.message} - ${req.originalUrl} - ${req.method} - ${reqIP}`)
								logger.error(`stack: ${JSON.stringify(util.inspect(err.stack))} \n`)
								return callback(new ErrorBuilder(418, req.t('error:Súbor je príliš veľký')), null)
							default:
								return callback(err, null)
						}
					}
					return callback(null, resultPath)
				})
			},
			filename: (_req: Request, file: Express.Multer.File, callback: (error: Error, filename: string) => void) => {
				const timestamp = new Date()
				const hash = crypto.createHash('sha224')

				// create hash name for filenema
				hash.update(`${timestamp.toISOString()}-${file.originalname}`)

				// get extension of file from original filename
				const ext = last(split(file.originalname, '.'))

				// return hash name with extension as a new filename
				callback(null, `${hash.digest('hex')}.${ext}`)
			}
		}),
		limits: {
			fileSize
		},
		fileFilter: (req: Request, file, next) => {
			// check file extension
			if (getFileDataType(path.extname(file.originalname)) === FILE_DATA_TYPE.OTHER) {
				return next(new ErrorBuilder(400, req.t('error:Prípona súboru nie je povolená')))
			}

			return next(null, true)
		}
	})
