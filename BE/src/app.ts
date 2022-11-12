import express from 'express'
import i18next, { InitOptions } from 'i18next'
import i18nextMiddleware from 'i18next-http-middleware'
import i18nextBackend from 'i18next-fs-backend'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwtStrategy } from 'passport-jwt'
import AuthTokenStrategy from 'passport-auth-token'
import config from 'config'
import helmet from 'helmet'
import cors from 'cors'
import dayjs from 'dayjs'
import utcPlugin from 'dayjs/plugin/utc'
import timezonePlugin from 'dayjs/plugin/timezone'
import isSameOrAfterPlugin from 'dayjs/plugin/isSameOrAfter'
import isSameOrBeforePlugin from 'dayjs/plugin/isSameOrBefore'
import isoWeekPlugin from 'dayjs/plugin/isoWeek'
import { cloneDeep } from 'lodash'

// middlewares
import loggingMiddleware from './middlewares/loggingMiddleware'
import modelBuilderMiddleware from './middlewares/modelBuilderMiddleware'
import errorMiddleware from './middlewares/errorMiddleware'

// utils
import { HOST } from './utils/enums'

// API endpoints
import v1 from './api/v1'

// interfaces
import { IPassportConfig } from './types/interfaces'

// passport verify
import localVerify from './passport/localVerify'
import { jwtVerifyUserApi, jwtVerifyForgotPassword, jwtVerifyInvitation, secretOrKeyProvider } from './passport/jwtVerify'
import tokenVerify from './passport/tokenVerify'
import { passportUseSaml } from './passport/samlVerify'

const passportConfig: IPassportConfig = config.get('passport')
const i18NextConfig: InitOptions = config.get('i18next')

dayjs.extend(utcPlugin)
dayjs.extend(timezonePlugin)
dayjs.extend(isSameOrAfterPlugin)
dayjs.extend(isSameOrBeforePlugin)
dayjs.extend(isoWeekPlugin)

// passport configuration
passport.use('local', new LocalStrategy(passportConfig.local, localVerify))
passport.use('jwt-api', new JwtStrategy({ ...passportConfig.jwt.api, secretOrKey: passportConfig.jwt.secretOrKey }, jwtVerifyUserApi))
passport.use('jwt-forgot-password', new JwtStrategy({ ...passportConfig.jwt.forgottenPassword, secretOrKeyProvider }, jwtVerifyForgotPassword))
passport.use('jwt-invitation', new JwtStrategy({ ...passportConfig.jwt.invitation, secretOrKey: passportConfig.jwt.secretOrKey }, jwtVerifyInvitation))
passport.use('authtoken', new AuthTokenStrategy({ ...passportConfig.token }, tokenVerify))

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

// i18n module
// eslint-disable-next-line @typescript-eslint/no-floating-promises
i18next
	.use(i18nextMiddleware.LanguageDetector)
	.use(i18nextBackend)
	.init({ ...cloneDeep(i18NextConfig) }) // it has to be copy otherwise is readonly

const app = express()
app.use('/apidoc', express.static('apidoc')) // NOTE: serve apidoc before helmet

//Disable helmet if requested via env
const testDeployMode = (process.env.TEST_DEPLOY_MODE == 'true' || process.env.TEST_DEPLOY_MODE == '1')
if (!testDeployMode) {
	app.use(helmet())
}

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(loggingMiddleware)
app.use(modelBuilderMiddleware)
app.use(passport.initialize())

// i18n module
app.use(i18nextMiddleware.handle(i18next))

// add SAML SSO login
passportUseSaml(app);

//API
app.use('/api/v1', v1())

//Frontend
//app.use(express.static('src/frontend/build'))
//TODO Martin nastav na FR build
app.use('*', (req, res) => {
	res.sendFile(__dirname + '.../index.html');
  });

//Errors
app.use(errorMiddleware)

export default app
