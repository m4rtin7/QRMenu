import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'
import { Transaction } from 'sequelize'


// utils
import { FILE_DATA_TYPES, MESSAGE_TYPE } from '../../../utils/enums'
import { messagesResponse } from '../../../utils/joiSchemas'

// types
import { fileWriteToStorage } from '../../../utils/fileUtil'

export const schema = Joi.object({
	body: Joi.object({
		pathToFolder: Joi.string().max(1000).required(),
		title: Joi.string().max(255).optional(),
		altText: Joi.string().max(255).optional(),
		description: Joi.string().max(500).optional()
	}),
	query: Joi.object(),
	params: Joi.object()
})

export const responseSchema = Joi.object({
	messages: messagesResponse,
	file: Joi.object({
		id: Joi.number().integer().min(1).required(),
		displayName: Joi.string().max(255).required(),
		dataType: Joi.string()
			.valid(...FILE_DATA_TYPES)
			.required(),
		path: Joi.string().max(2000).required(),
		pathFileName: Joi.string().max(1000).required(),
		size: Joi.number().integer().min(0).required(),
		title: Joi.string().max(255).allow(null).required(),
		altText: Joi.string().max(255).allow(null).required(),
		description: Joi.string().max(500).allow(null).required(),
		mimeType: Joi.string().max(255).required()
	}).required()
})

export const workflow = async (req: Request, res: Response, next: NextFunction) => {
	let transaction: Transaction
	try {
		const { body, file, user: authUser, models } = req
		const fileResp = await fileWriteToStorage({
			file: file,
			models: models,
			pathToFolder: body.pathToFolder,
			title: body.title,
			altText: body.altText,
			description: body.description,
			useAppLogging: true,
			t: req.t,
			userId: authUser.id
		})

		const messages = [
            {
                type: MESSAGE_TYPE.SUCCESS,
                message: req.t('Súbor bol úspešne uložený')
            }
        ]

		return res.json({
			messages,
			file: fileResp
		})
	} catch (e) {
		if (transaction) {
			await transaction.rollback()
		}
		return next(e)
	}
}
