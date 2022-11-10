import { Router, Request, Response, NextFunction } from 'express'
import passport from 'passport'

// middlewares
import validationMiddleware from '../../../middlewares/validationMiddleware'

// utils
import ErrorBuilder from '../../../utils/ErrorBuilder'

import * as postLogin from './post.login'
import * as postPing from './post.ping'
import * as postForgotPassword from './post.forgotPassword'
import * as postResetPassword from './post.resetPassword'

const router = Router()

export default () => {
	router.post(
		'/login',
		validationMiddleware(postLogin.schema),
		(req: Request, res: Response, next: NextFunction) => {
			passport.authenticate('local', { session: false }, (err, userData, message) => {
				try {
					if (err) {
						return next(err)
					}
					if (!userData) {
						throw new ErrorBuilder(401, message.message)
					}

					req.user = userData
					return next()
				} catch (e) {
					return next(e)
				}
			})(req, res)
		},
		postLogin.workflow
	)

	router.post('/ping', passport.authenticate('jwt-api', { session: false }), validationMiddleware(postPing.schema), postPing.workflow)

	router.post('/forgot-password', validationMiddleware(postForgotPassword.schema()), postForgotPassword.workflow)

	router.post(
		'/reset-password',
		(req: Request, res: Response, next: NextFunction) => {
			passport.authenticate('jwt-forgot-password', (err, userData) => {
				try {
					if (err) {
						return next(err)
					}
					if (!userData) {
						return next(new ErrorBuilder(401, req.t('error:Token nie je platný')))
					}

					req.user = userData
					return next()
				} catch (e) {
					return next(e)
				}
			})(req, res)
		},
		validationMiddleware(postResetPassword.schema),
		postResetPassword.workflow
	)

	return router
}
