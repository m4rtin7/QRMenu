import Joi from 'joi'
import { map } from 'lodash'

// utils
import { MESSAGE_TYPE } from './enums'

interface IErrorBuilderItem {
	message: string
	type: string
	path?: string
}

const prepareErrorItems = (name: string | Joi.ValidationErrorItem[]) => {
	if (typeof name === 'string') {
		return [
			{
				type: MESSAGE_TYPE.ERROR,
				message: name
			}
		]
	}

	return map(name, (item: Joi.ValidationErrorItem) => ({
		type: MESSAGE_TYPE.ERROR,
		path: item.path.join('.'),
		message: item.message
	}))
}

export default class ErrorBuilder extends Error {
	status: number
	isJoi?: boolean
	isAxiosError?: boolean
	response?: any
	items: IErrorBuilderItem[]

	constructor(status: number, name: string | Joi.ValidationErrorItem[]) {
		super(JSON.stringify(name))
		this.status = status
		this.isJoi = typeof name !== 'string'
		this.items = prepareErrorItems(name)
	}
}
