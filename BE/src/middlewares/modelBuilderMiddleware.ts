import { Request, Response, NextFunction } from 'express'
import { forEach, upperFirst } from 'lodash'

import { models } from '../db/models'

export default function modelBuilder(req: Request, _res: Response, next: NextFunction) {
	try {
		const newModelsBuild: any = {}
		forEach(models, (Model, key) => {
			class ModelWrapper extends Model {
				req: Request
			}
			Object.defineProperties(ModelWrapper, {
				name: {
					value: Model.name
				}
			})

			ModelWrapper.prototype.req = req

			newModelsBuild[upperFirst(key)] = ModelWrapper
		})

		req.models = newModelsBuild
		return next()
	} catch (e) {
		return next(e)
	}
}
