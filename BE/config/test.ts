import path from 'path'
import fs from 'fs'

import { IConfig } from '../src/types/interfaces'

// define logs, files, temp, uploads directories paths
const logDirectory = path.resolve(process.cwd(), 'logs', 'tests')
const filesPath = path.join(process.cwd(), 'files')
const tempPath = path.join(filesPath, 'temp')
const emailsLogDirectory = path.join(logDirectory, 'server/emails')

// NOTE: ensure logs, files, temp, uploads, pdfs directories exist (logs, files, temp, uploads, pdfs are created in main index.ts file which is not used when testing)
// eslint-disable-next-line security/detect-non-literal-fs-filename, chai-friendly/no-unused-expressions
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory, { recursive: true })


// eslint-disable-next-line security/detect-non-literal-fs-filename, chai-friendly/no-unused-expressions
fs.existsSync(filesPath) || fs.mkdirSync(filesPath, { recursive: true })
// eslint-disable-next-line security/detect-non-literal-fs-filename, chai-friendly/no-unused-expressions
fs.existsSync(tempPath) || fs.mkdirSync(tempPath, { recursive: true })
// NOTE: ensure emails log subdirectory exists - it is not created automatically as info and errors subdirectories)
// eslint-disable-next-line security/detect-non-literal-fs-filename, chai-friendly/no-unused-expressions
fs.existsSync(emailsLogDirectory) || fs.mkdirSync(emailsLogDirectory, { recursive: true })

export default <IConfig>{
	server: {
		filesPath,
		tempPath
	},
	logs: {
		logDirectory
	},
	passport: {
		jwt: {
			secretOrKey: process.env.JWT_SECRET || 'somerandomsecret',
			api: {
				exp: '20m'
			},
			forgottenPassword: {
				exp: '20m'
			},
			invitation: {
				exp: '20m'
			}
		}
	}
}
