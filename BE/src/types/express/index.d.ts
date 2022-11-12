import { Request as OriginalRequest } from 'express/index'

import { ModelsType } from '../../db/models'

import { UserModel } from '../../db/models/user'

declare module 'express' {
	export interface Request extends Omit<OriginalRequest, 'query'> {
		query: any,
		user: UserModel
		models: ModelsType
		requestID: string
		resortID: number
	}
}
