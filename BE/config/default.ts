import path from 'path'
import fs from 'fs'
import { ExtractJwt } from 'passport-jwt'

import { IConfig } from '../src/types/interfaces'
import { JWT_AUDIENCE } from '../src/utils/enums'

// define logs directory path
const logDirectory = path.resolve(process.cwd(), 'logs')
const emailsLogDirectory = path.join(logDirectory, 'server/emails')

// NOTE: ensure logs directory exists
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory, { recursive: true })
// NOTE: ensure emails log subdirectory exists - it is not created automatically as info and errors subdirectories)
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
fs.existsSync(emailsLogDirectory) || fs.mkdirSync(emailsLogDirectory, { recursive: true })

const filesPath = process.env.FILES_PATH || path.join(process.cwd(), 'files')

export default <IConfig>{
	server: {
		port: 3001,
		filesSubdirs: ['temp', 'images', 'uploads'],
		filesPath,
		tempPath: path.join(filesPath, 'temp'),
		uploadsPath: path.join(filesPath, 'uploads'),
		imagesPath: path.join(filesPath, 'images'),
		domain: process.env.DOMAIN || 'http://localhost:3001'
	},
	cron: {
		weather: {
			scheduledTime: '0 */10 * * * *'
		},
		snowfall: {
			scheduledTime: '0 0 */6 * * *'
		},
		cameraThumbs: {
			scheduledTime: '0 0 */1 * * *'
		},
		fileDelete: {
			scheduledTime: '0 0 */6 * * *'
		}
	},

	weatherApi: {
		apikey: process.env.WEATHER_API_KEY
	},
	multer: {
		maxSize: 10 * 1024 * 1024 // 10 MB
	},
	sharp: {
		ruleWidths: [480, 640, 1024, 1900]
	},
	logs: {
		logDirectory
	},
	email: {
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		from: process.env.EMAIL_FROM,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD
		}
	},
	passport: {
		token: {
			tokenFields: ['api_key'],
			passReqToCallback: true
		},
		local: {
			usernameField: 'email',
			passwordField: 'password',
			session: false,
			passReqToCallback: true
		},
		jwt: {
			secretOrKey: process.env.JWT_SECRET || 'DEBUG_JWT',
			api: {
				exp: '2h',
				audience: JWT_AUDIENCE.API,
				jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeaderAsBearerToken(), ExtractJwt.fromUrlQueryParameter('t')]),
				passReqToCallback: true
			},
			forgottenPassword: {
				jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
				exp: '4h',
				audience: JWT_AUDIENCE.FORGOTTEN_PASSWORD,
				passReqToCallback: true
			},
			invitation: {
				jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
				exp: '24h',
				audience: JWT_AUDIENCE.INVITATION,
				passReqToCallback: true
			}
		},
		saml: {
			loginUrl: process.env.SAML_LOGIN_URL || '/login-ad',
			callbackUrl: process.env.SAML_CALLBACK_URL || '/login-callback',
			entryPoint: process.env.SAML_ENTRYPOINT,
			issuer: process.env.SAML_ISSUER,
			certificateBase64: process.env.SAML_CERT
		},
		basic: {
			passReqToCallback: true
		}
	},
	i18next: {
		preload: ['sk'],
		fallbackLng: 'sk',
		ns: ['translation', 'error', 'success', 'email'],
		defaultNS: 'translation',
		detection: {
			order: ['header']
		},
		backend: {
			loadPath: 'locales/{{lng}}/{{ns}}.json',
			jsonIndent: 2
		}
	}
}
