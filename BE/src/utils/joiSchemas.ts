import Joi from 'joi'
import { forEach } from 'lodash'
import i18next from 'i18next'

// uzils
import { DAYS, LANGUAGE, LANGUAGES, MESSAGE_TYPE } from './enums'
import { passwordRegEx, timeRegex } from './regex'

/**
 * Joi schema for response object with only messages array
 * ```js
 * {
 *		messages: [{
 * 		message: string
 * 		type: "SUCCESS"
 * 	}]
 * }
 * ```
 */
export const fullMessagesResponse = Joi.object({
    messages: Joi.array()
        .items(
            Joi.object({
                message: Joi.string().required(),
                type: Joi.string().valid(MESSAGE_TYPE.SUCCESS).required()
            }).required()
        )
        .required()
})

/**
 * Joi schema for response messages array
 * ```js
 * [{
 *		message: string
 * 	type: "SUCCESS"
 * }]
 * ```
 */
export const messagesResponse = Joi.array()
    .items(
        Joi.object({
            message: Joi.string().required(),
            type: Joi.string().valid(MESSAGE_TYPE.SUCCESS).required()
        }).required()
    )
    .required()

/**
 * Joi schema for response pagination object
 * ```js
 * {
 * 		limit: number
 * 		page: number
 * 		totalPages: number
 * 		totalCount: number
 * }
 * ```
 */
export const paginationResponse = Joi.object({
    limit: Joi.number().integer().min(1).required(),
    page: Joi.number().integer().min(1).required(),
    totalPages: Joi.number().integer().min(0).required(),
    totalCount: Joi.number().integer().min(0).required()
}).required()

/**
 * Joi schema for request password (with masked password value)
 */
export const passwordRequest = Joi.string()
    .regex(passwordRegEx)
    .max(255)
    .error((errors): any => {
        forEach(errors, (error) => {
            // eslint-disable-next-line no-param-reassign
            error.value = '********'
        })
        return errors
    })
    .required()

/**
 * Joi schema for request email (with custom error message for invalid email format)
 * @param {number} [maxValueLength=255]
 */
export const emailRequest = (maxValueLength = 255) =>
    Joi.string()
        .email()
        .max(maxValueLength)
        .messages({
            'string.email': i18next.t('error:Nesprávny formát emailovej adresy')
        })

export const geoJSONSchema = Joi.object({
    type: Joi.string().required(),
    properties: Joi.object({
        stroke: Joi.string().required(),
        'stroke-width': Joi.number().required(),
        'stroke-opacity': Joi.number().required(),
        label: Joi.string().required(),
        MarkerLocation: Joi.array().items(Joi.number().min(-180).max(180).required(), Joi.number().min(-90).max(90).required()).length(2)
    }).required().unknown(true),
    geometry: Joi.object({
        type: Joi.string().required(),
        coordinates: Joi.array()
            .items(Joi.array().items(Joi.number().min(-180).max(180).required(), Joi.number().min(-90).max(90).required()).length(2))
            .required()
    }).required()
}).allow(null)

export const openingHoursSchemaNotRequired = Joi.array()
    .items(
        Joi.object({
            day: Joi.string()
                .valid(...DAYS)
                .required(),
            timeRanges: Joi.array()
                .items(
                    Joi.object({
                        timeFrom: Joi.string().regex(timeRegex).required(),
                        timeTo: Joi.string().regex(timeRegex).required()
                    })
                )
                .required()
        }).required()
    )
    .unique('day')

export const openingHoursSchema = openingHoursSchemaNotRequired.length(7).required();

export const causeSchema = Joi.array()
    .items({
        id: Joi.number().integer().required(),
        languageCode: Joi.string()
            .valid(...LANGUAGES)
            .required(),
        value: Joi.string().required()
    })
    .required()

export const localizedValueSchema = Joi.array()
    .items(
        {
            languageCode: Joi.string()
                .valid(...LANGUAGES)
                .required(),
            value: Joi.string().required()
        }
    )
    .unique('languageCode')
    .min(1)
    .optional();

export const localizedValueSchemaNotMandatory = Joi.array()
    .items(
        {
            languageCode: Joi.string()
                .valid(...LANGUAGES)
                .required(),
            value: Joi.string().required()
        }
    )
    .unique('languageCode')
    .optional();