import slugify from 'slugify'
import { find, first, flatten, forEach, get, includes, isArray, isEmpty, isNil, isNumber, keyBy, last, map, slice, some, sortBy, split, uniqBy } from 'lodash'
import i18next, { TFunction } from 'i18next'
import path from 'path'
import config from 'config'
import { Association, Includeable, Model } from 'sequelize'

// utils
import {
	CROSS_COUNTRY_DIFFICULTY,
	CURRENCY_CODE,
	DANGER,
	DAY,
	DEPARTURE_TIME_TYPE,
	DIFFICULTY,
	FILE_DATA_TYPE,
	PERMISSION,
	PLACEMENT,
	RESORT_TYPE,
	SERVICE_TYPE,
	SKILIFT_TYPE,
	SLOPE_TYPE,
	SNOW_CONDITION,
	SNOW_TYPE,
	SURFACE_TYPE,
	WATER_TYPE
} from './enums'
import ErrorBuilder from './ErrorBuilder'

// types
import { IServerConfig } from '../types/interfaces'
// eslint-disable-next-line import/no-cycle
import { UserModel } from '../db/models/user'
// eslint-disable-next-line import/no-cycle
import { LocalizationModel } from '../db/models/localization'
// eslint-disable-next-line import/no-cycle
import { LanguageModel } from '../db/models/language'
// eslint-disable-next-line import/no-cycle
import { PermissionModel } from '../db/models/permission'
// eslint-disable-next-line import/no-cycle
import { RoleModel } from '../db/models/role'
// eslint-disable-next-line import/no-cycle

const serverConfig: IServerConfig = config.get('server')

export const translateResortType = (type: RESORT_TYPE) => {
	switch (type) {
		case RESORT_TYPE.GOLF:
			return i18next.t('Golf resort')
		case RESORT_TYPE.MOUNTAIN:
			return i18next.t('Mountain resort')
		case RESORT_TYPE.SKI:
			return i18next.t('Ski resort')
		case RESORT_TYPE.SPA:
			return i18next.t('Spa resort')
		case RESORT_TYPE.THEME_PARK:
			return i18next.t('Theme park resort')
		case RESORT_TYPE.WATER_PARK:
			return i18next.t('Water park resort')
		default:
			return null
	}
}

export const translateResortTypeLegacyId = (type: RESORT_TYPE) => {
	switch (type) {
		case RESORT_TYPE.GOLF:
			return 3;
		case RESORT_TYPE.MOUNTAIN:
			return 6;
		case RESORT_TYPE.SKI:
			return 1;
		case RESORT_TYPE.SPA:
			return 2;
		case RESORT_TYPE.THEME_PARK:
			return 4;
		case RESORT_TYPE.WATER_PARK:
			return 5;
		default:
			return null
	}
}

export const translateSkiliftType = (type: SKILIFT_TYPE) => {
	switch (type) {
		case SKILIFT_TYPE.GONDOLA:
			return i18next.t('Kabínková lanovka')
		case SKILIFT_TYPE.SKI:
			return i18next.t('Lyžiarsky vlek')
		case SKILIFT_TYPE.BELT:
			return i18next.t('Pásový prepravník')
		case SKILIFT_TYPE.OVERLAND:
			return i18next.t('Pozemná lanová dráha')
		case SKILIFT_TYPE.CHAIR:
			return i18next.t('Sedačková lanovka')
		case SKILIFT_TYPE.TWINLINER:
			return i18next.t('Twinliner 50 - šikmý výťah')
		case SKILIFT_TYPE.CABLE:
			return i18next.t('Visutá lanová dráha')
		default:
			return null
	}
}

export const translateSkiliftTypeLegacyId = (type: SKILIFT_TYPE): number => {
	switch (type) {
		case SKILIFT_TYPE.GONDOLA:
			return 6;
		case SKILIFT_TYPE.SKI:
			return 4;
		case SKILIFT_TYPE.BELT:
			return 9;
		case SKILIFT_TYPE.OVERLAND:
			return 8;
		case SKILIFT_TYPE.CHAIR:
			return 5;
		case SKILIFT_TYPE.TWINLINER:
			return 10;
		case SKILIFT_TYPE.CABLE:
			return 7;
		default:
			return null
	}
}

export const translateSkiliftTypeLegacyInternalId = (type: SKILIFT_TYPE): string => {
	switch (type) {
		case SKILIFT_TYPE.GONDOLA:
			return '3';
		case SKILIFT_TYPE.SKI:
			return '1';
		case SKILIFT_TYPE.BELT:
			return '6';
		case SKILIFT_TYPE.OVERLAND:
			return '5';
		case SKILIFT_TYPE.CHAIR:
			return '2';
		case SKILIFT_TYPE.TWINLINER:
			return '7';
		case SKILIFT_TYPE.CABLE:
			return '4';
		default:
			return null
	}
}

export const translateSlopeType = (type: SLOPE_TYPE) => {
	switch (type) {
		case SLOPE_TYPE.CYCLE_TRACK:
			return i18next.t('Cyklistiká trat')
		case SLOPE_TYPE.FREERIDE:
			return i18next.t('Freeride')
		case SLOPE_TYPE.SKIALP:
			return i18next.t('Skialp')
		case SLOPE_TYPE.SLOPE:
			return i18next.t('Zjazdovka')
		case SLOPE_TYPE.TRAVERZ:
			return i18next.t('Traverz')
		default:
			return null
	}
}

export const translateSlopeTypeId = (type: SLOPE_TYPE) => {
	switch (type) {
		case SLOPE_TYPE.CYCLE_TRACK:
			return 3;
		case SLOPE_TYPE.FREERIDE:
			return 21;
		case SLOPE_TYPE.SKIALP:
			return 22;
		case SLOPE_TYPE.SLOPE:
			return 1;
		case SLOPE_TYPE.TRAVERZ:
			return 2;
		default:
			return null
	}
}

export const translateSnowConditions = (snowCondition: SNOW_CONDITION) => {
	switch (snowCondition) {
		case SNOW_CONDITION.GOOD:
			return i18next.t('dobré')
		case SNOW_CONDITION.LIMITED:
			return i18next.t('obmedzené')
		case SNOW_CONDITION.UNSUITABLE:
			return i18next.t('nevhodné')
		case SNOW_CONDITION.VERY_GOOD:
			return i18next.t('veľmi dobré')
		default:
			return null
	}
}

export const translateSnowConditionsId = (snowCondition: SNOW_CONDITION) => {
	switch (snowCondition) {
		case SNOW_CONDITION.GOOD:
			return 2;
		case SNOW_CONDITION.LIMITED:
			return 3;
		case SNOW_CONDITION.UNSUITABLE:
			return 4;
		case SNOW_CONDITION.VERY_GOOD:
			return 1;
		default:
			return null
	}
}

export const translateSlopeDifficulty = (difficulty: DIFFICULTY) => {
	switch (difficulty) {
		case DIFFICULTY.EASY:
			return i18next.t('Beginner')
		case DIFFICULTY.HARD:
			return i18next.t('Intermediate')
		case DIFFICULTY.MEDIUM:
			return i18next.t('Expert')
		default:
			return null
	}
}

export const translateSlopeDifficultyId = (difficulty: DIFFICULTY) => {
	return translateAquaparkAttractionDifficultyId(difficulty)
}

export const translateBikeDifficulty = (difficulty: DIFFICULTY) => {
	switch (difficulty) {
		case DIFFICULTY.EASY:
			return i18next.t('Ľahká')
		case DIFFICULTY.HARD:
			return i18next.t('Stredne ťažká')
		case DIFFICULTY.MEDIUM:
			return i18next.t('Ťažká')
		default:
			return null
	}
}

export const translateBikeDifficultyId = (difficulty: DIFFICULTY) => {
	return translateAquaparkAttractionDifficultyId(difficulty);
}

export const translateCrossCountrySurface = (surface: SURFACE_TYPE) => {
	switch (surface) {
		case SURFACE_TYPE.CLASSIC:
			return i18next.t('Klasika')
		case SURFACE_TYPE.MIX:
			return i18next.t('Mix')
		case SURFACE_TYPE.NOT_SPECIFIED:
			return i18next.t('Neuvedené')
		case SURFACE_TYPE.SKATE:
			return i18next.t('Skate')
		default:
			return null
	}
}

export const translateCrossCountrySurfaceId = (surface: SURFACE_TYPE) => {
	switch (surface) {
		case SURFACE_TYPE.CLASSIC:
			return 2;
		case SURFACE_TYPE.MIX:
			return 4;
		case SURFACE_TYPE.NOT_SPECIFIED:
			return 1;
		case SURFACE_TYPE.SKATE:
			return 3;
		default:
			return null
	}
}

export const translateWaterType = (waterType: WATER_TYPE) => {
	switch (waterType) {
		case WATER_TYPE.CLEAR_WATER:
			return i18next.t('Číra')
		case WATER_TYPE.SEA_WATER:
			return i18next.t('Morská')
		case WATER_TYPE.THERMAL_WATER:
			return i18next.t('Termálna')
		default:
			return null
	}
}

export const translateWaterTypeId = (waterType: WATER_TYPE): number => {
	switch (waterType) {
		case WATER_TYPE.CLEAR_WATER:
			return 1;
		case WATER_TYPE.SEA_WATER:
			return 2;
		case WATER_TYPE.THERMAL_WATER:
			return 3;
		default:
			return null
	}
}

export const translateAquaparkAttractionDifficulty = (difficulty: DIFFICULTY) => {
	switch (difficulty) {
		case DIFFICULTY.EASY:
			return i18next.t('Ľahká')
		case DIFFICULTY.MEDIUM:
			return i18next.t('Stredná')
		case DIFFICULTY.HARD:
			return i18next.t('Ťažká')
		default:
			return null
	}
}

export const translateAquaparkAttractionDifficultyId = (difficulty: DIFFICULTY) => {
	switch (difficulty) {
		case DIFFICULTY.EASY:
			return 1;
		case DIFFICULTY.MEDIUM:
			return 2;
		case DIFFICULTY.HARD:
			return 3;
		default:
			return null
	}
}

export const getSymbolByCode = (currencyCode: CURRENCY_CODE) => {
	switch (currencyCode) {
		case CURRENCY_CODE.CZK:
			return 'Kč'
		case CURRENCY_CODE.EUR:
			return '€'
		case CURRENCY_CODE.GBP:
			return '£'
		case CURRENCY_CODE.PLN:
			return 'zł'
		case CURRENCY_CODE.USD:
			return '$'
		default:
			return null
	}
}

export const translationServiceType = (type: SERVICE_TYPE) => {
	switch (type) {
		case SERVICE_TYPE.FUN_ZONE:
			return i18next.t('fun-zone')
		case SERVICE_TYPE.INFO_CENTER:
			return i18next.t('information-center')
		case SERVICE_TYPE.RENTAL:
			return i18next.t('tatry-motion')
		default:
			return null
	}
}

export const translateCrossCountryDifficulty = (ccDificulty: CROSS_COUNTRY_DIFFICULTY) => {
	switch (ccDificulty) {
		case CROSS_COUNTRY_DIFFICULTY.BLACK:
			return i18next.t('Čierna')
		case CROSS_COUNTRY_DIFFICULTY.BLUE:
			return i18next.t('Modrá')
		case CROSS_COUNTRY_DIFFICULTY.RED:
			return i18next.t('Červená')
		default:
			return null
	}
}

export const translateCrossCountryDifficultyId = (ccDificulty: CROSS_COUNTRY_DIFFICULTY) => {
	switch (ccDificulty) {
		case CROSS_COUNTRY_DIFFICULTY.BLACK:
			return 3;
		case CROSS_COUNTRY_DIFFICULTY.BLUE:
			return 1;
		case CROSS_COUNTRY_DIFFICULTY.RED:
			return 2;
		default:
			return null
	}
}

export const translatePlacement = (placement: PLACEMENT) => {
	switch (placement) {
		case PLACEMENT.INDOOR:
			return i18next.t('Indoor')
		case PLACEMENT.OUTDOOR:
			return i18next.t('Outdoor')
		default:
			return null
	}
}

export const translateSnowType = (snowType: SNOW_TYPE) => {
	switch (snowType) {
		case SNOW_TYPE.ARTIFICIAL:
			return i18next.t('Umelý')
		case SNOW_TYPE.NATURE:
			return i18next.t('Prírodný')
		default:
			return null
	}
}

export const translateSnowTypeId = (snowType: SNOW_TYPE) => {
	switch (snowType) {
		case SNOW_TYPE.ARTIFICIAL:
			return 2;
		case SNOW_TYPE.NATURE:
			return 1;
		default:
			return null
	}
}

export const translateDangerous = (danger: DANGER) => {
	switch (danger) {
		case DANGER.NONE:
			return i18next.t('žiadne')
		case DANGER.LOW:
			return i18next.t('malé')
		case DANGER.MODERATE:
			return i18next.t('mierne')
		case DANGER.INCREASED:
			return i18next.t('zvýšené')
		case DANGER.HIGH:
			return i18next.t('veľké')
		case DANGER.VERY_HIGH:
			return i18next.t('veľmi veľké')
		default:
			return null
	}
}

export const translateDepartureTimeType = (type: DEPARTURE_TIME_TYPE) => {
	switch (type) {
		case DEPARTURE_TIME_TYPE.PUBLIC:
			return i18next.t('Verejná')
		case DEPARTURE_TIME_TYPE.SERVIS:
			return i18next.t('Servisná')
		default:
			return null
	}
}

export const translateDepartureTimeTypeId = (type: DEPARTURE_TIME_TYPE) => {
	switch (type) {
		case DEPARTURE_TIME_TYPE.PUBLIC:
			return 1;
		case DEPARTURE_TIME_TYPE.SERVIS:
			return 2;
		default:
			return null
	}
}

/**
 * Creates slug form from value
 * @param {string} value
 * @param {string} [separator='-']
 * @returns {string} slug form if value is provided, else empty string
 */
export const createSlug = (value: string, separator = '-') => {
	if (value) {
		return slugify(value, {
			replacement: separator,
			remove: null,
			lower: true
		})
	}
	return ''
}

/**
 * Creates object with languages which are set for localization
 * @param {LanguageModel[]} languages
 * @param {LocalizationModel} localization
 * @returns {{[key:string]: boolean}}
 */
export const getLocalizationState = (languages: LanguageModel[], localization: LocalizationModel) => {
	const resultArray: { languageCode: string; hasLocalization: boolean }[] = []

	const keyedLocalizations = keyBy(localization?.values, 'languageCode')

	forEach(languages, (language) => {
		resultArray.push({
			languageCode: language.code,
			hasLocalization: !!get(keyedLocalizations, language.code)
		})
	})

	return resultArray
}

/**
 * Creates normalized path (set "/" as path separator)
 * @param {string} pathItem path
 * @returns {string} Normalized path (if empty array is provided, returns null)
 */
export const normalizePath = (pathItem: string) => {
	if (pathItem) {
		// replace all backslashes and slashes for slashes
		return pathItem.replace(/\\+|\/{2,}/g, '/')
	}
	return null
}

/**
 * Creates joined and normalized absolute path from provided path items (checks if path is for /files/uploads directory)
 * @param {string[]} pathItems Array of path values to join to /files/upload directory
 * @param {TFunction} [t] TFunction from request (req.t). If not provided, i18next.t will be used
 * @returns {string} Joined and normalized absolute path (if empty array is provided, returns null)
 */
export const joinAndNormalizeAbsolutePath = (pathItems: string[], t?: TFunction) => {
	if (!isEmpty(pathItems)) {
		const tFunction = t || i18next.t

		const joinedPath = path.join(serverConfig.uploadsPath, ...pathItems)

		if (joinedPath.indexOf(serverConfig.uploadsPath) !== 0) {
			throw new ErrorBuilder(403, tFunction('error:Nie je možné pristúpiť k požadovanej časti súborového systému'))
		}

		return normalizePath(joinedPath)
	}
	return null
}

/**
 * Creates joined and normalized relative path from provided path items
 * @param {string[]} pathItems Array of path values to join
 * @returns {string} Joined and normalized relative path (if empty array is provided, returns null)
 */
export const joinAndNormalizeRelativePath = (pathItems: string[]) => {
	if (!isEmpty(pathItems)) {
		const joinedPath = path.join(...pathItems)

		return normalizePath(joinedPath)
	}
	return null
}

/**
 * Returns file data type based on file extension
 * @param {string} fileExt file extension with dot before it
 * @returns {FILE_DATA_TYPE}
 */
export const getFileDataType = (fileExt: string) => {
	switch (fileExt.toLowerCase()) {
		case '.pdf':
			return FILE_DATA_TYPE.PDF
		case '.jpg':
		case '.jpeg':
		case '.png':
			return FILE_DATA_TYPE.IMAGE
		case '.odt':
		case '.rtf':
		case '.doc':
		case '.docx':
			return FILE_DATA_TYPE.DOC
		case '.csv':
		case '.ods':
		case '.xls':
		case '.xlsx':
			return FILE_DATA_TYPE.EXCEL
		case '.rar':
			return FILE_DATA_TYPE.RAR
		case '.zip':
			return FILE_DATA_TYPE.ZIP
		default:
			return FILE_DATA_TYPE.OTHER
	}
}

/**
 * Returns uglyfied raw SQL query
 * @param {string} formattedRawSqlQuery Formatted raw SQL query (single/multi line comments, tabs, new lines)
 * @returns {string} Uglyfied raw SQL query (without single/multi line comments, tabs, new lines)
 */
export const uglyfyRawSqlQuery = (formattedRawSqlQuery: string) => {
	if (!isNil(formattedRawSqlQuery)) {
		return formattedRawSqlQuery
			.replace(/.*--.*\n/g, '')
			.replace(/\/\*[\s\S]*\*\//g, '')
			.replace(/\t/g, '')
			.replace(/\n/g, ' ')
	}

	return null
}

/**
 * Returns true if PermissionModel[] array contains SUPER_ADMIN permission
 * @param {PermissionModel[]} permissions Permissions array
 * @returns {boolean} True if permissions array contains SUPER_ADMIN permission
 */
export const hasSuperAdminPermission = (permissions: PermissionModel[]) => !isEmpty(find(permissions, { key: PERMISSION.SUPER_ADMIN }))

/**
 * Returns true if PermissionModel[] array contains ADMIN permission
 * @param {PermissionModel[]} permissions Permissions array
 * @returns {boolean} True if permissions array contains ADMIN permission
 */
export const hasAdminPermission = (permissions: PermissionModel[]) => !isEmpty(find(permissions, { key: PERMISSION.ADMIN }))

/**
 * Returns true if RoleModel[] array contains permission
 * @param {RoleModel[]} roles Roles array
 * @param {PERMISSION} permission permission
 * @returns {boolean} True if roles array contains permission
 */
export const includesRoleWithPermission = (roles: RoleModel[], permission: PERMISSION) => some(roles, (role) => find(role.permissions, { key: permission }))

/**
 * Returns true if UserModel has SUPER_ADMIN permission
 * @param {UserModel} user User model with permissions array defined
 * @returns {boolean} True if user is super admin
 */
export const isSuperAdmin = (user: { permissions: PermissionModel[] | PERMISSION[], roles: RoleModel[] }) => {
	if (user.permissions?.[0] instanceof PermissionModel) {
		return hasSuperAdminPermission(user.permissions as PermissionModel[]) || includesRoleWithPermission(user.roles, PERMISSION.SUPER_ADMIN)
	}
	return includes(user.permissions as PERMISSION[], PERMISSION.SUPER_ADMIN)
}

/**
 * Returns true if UserModel has ADMIN permission
 * @param {UserModel} user User model with permissions array defined
 * @returns {boolean} True if user is admin
 */
export const isAdmin = (user: { permissions: PermissionModel[] | PERMISSION[], roles: RoleModel[] }) => {
	// TODO: @Lubo ked user nema permissios
	if (user.permissions[0] instanceof PermissionModel) {
		return hasAdminPermission(user.permissions as PermissionModel[]) || includesRoleWithPermission(user.roles, PERMISSION.ADMIN)
	}
	return includes(user.permissions as PERMISSION[], PERMISSION.ADMIN)
}

/**
 * Returns DAY enum value base on provided day of week
 * @param {number} day Day of week (1 - monday, ..., 7 - sunday)
 * @returns {DAY}
 */
export const getDayNameFromNumber = (day: number) => {
	switch (day) {
		case 1:
			return DAY.MONDAY
		case 2:
			return DAY.TUESDAY
		case 3:
			return DAY.WEDNESDAY
		case 4:
			return DAY.THURSDAY
		case 5:
			return DAY.FRIDAY
		case 6:
			return DAY.SATURDAY
		case 7:
			return DAY.SUNDAY
		default:
			return null
	}
}

/**
 * Returns fileName metadata related to copy-postfix index
 * @param {string} fullName file full name (with extension)
 * @returns {{ name: string, ext: string, postfix: string, nameWithoutPostfix: string, postfixIndex: number }}
 */
export const getFileNamePostfixIndexMetadata = (fullName: string) => {
	const [name, ext] = split(fullName, '.')
	const splittedName = split(name, ' ')
	const postfix = first(last(splittedName)?.match('^\\(\\d+\\)$'))
	let nameWithoutPostfix = splittedName.join(' ')
	let postfixIndex = 0

	if (postfix) {
		nameWithoutPostfix = slice(splittedName, 0, -1).join(' ')
		postfixIndex = parseInt(postfix.substring(1, postfix.length - 1), 10)
	}

	return {
		name,
		ext,
		postfix: postfix || null,
		nameWithoutPostfix,
		postfixIndex
	}
}

/**
 * Returns first available copy-postfix index
 * @param {number[]} usedPostfixIndexes already used postfix indexes
 * @returns {number} new postfix index
 */
export const getFirstUnusedNumber = (usedPostfixIndexes: number[]) => {
	let newPostfixIndex = 0

	const orderedCurrentPostfixIndexes = sortBy(usedPostfixIndexes)

	if (orderedCurrentPostfixIndexes[0] === 0) {
		some(orderedCurrentPostfixIndexes, (orderedCurrentPostfixIndex, index) => {
			if ((usedPostfixIndexes[index + 1] || orderedCurrentPostfixIndex + 2) - orderedCurrentPostfixIndex > 1) {
				newPostfixIndex = index + 1
				return true
			}
			return false
		})
	}

	return newPostfixIndex
}

/**
 * Returns final fileName (with postfix index if needed)
 * @param {string} fullName file full name (with extension)
 * @param {string[]} existingFileNames existing file names with same name (and their postfix indexes)
 * @returns {string} final filename
 */
export const getFinalFileName = (fullName: string, existingFileNames: string[]) => {
	const { postfixIndex: newFilePostfixIndex, nameWithoutPostfix, ext } = getFileNamePostfixIndexMetadata(fullName)

	const currentPostfixIndexes = map(existingFileNames, (existingFileName) => {
		const { postfixIndex } = getFileNamePostfixIndexMetadata(existingFileName)

		return postfixIndex
	})

	let newPostfixIndex = newFilePostfixIndex
	if (!isEmpty(currentPostfixIndexes)) {
		if (newFilePostfixIndex) {
			const alreadyExists = includes(currentPostfixIndexes, newFilePostfixIndex)
			if (alreadyExists) {
				newPostfixIndex = getFirstUnusedNumber(currentPostfixIndexes)
			}
		} else {
			newPostfixIndex = getFirstUnusedNumber(currentPostfixIndexes)
		}
	}

	let resultFullName = ''
	if (newPostfixIndex) {
		resultFullName = `${nameWithoutPostfix} (${newPostfixIndex}).${ext}`
	} else {
		resultFullName = `${nameWithoutPostfix}.${ext}`
	}

	return resultFullName
}

export const escapeSpecialCharactersForElastic = (str: string): string => {
	return str.replace(/([\!\*\+\-\=\<\>\&\|\(\)\[\]\{\}\^\~\?\:\\/"])/g, "\\$1");
}

/**
 * Get all HasOne, HasMany and BelongsToMany associations from provided instance.associations object
 * @param {{ [key: string]: Association }} associations instance associations
 * @param {string[]} [excludedAssociationNames] association names which will be excluded
 * @returns {Includeable[]}
 */
export const generateHasAssociationsIncludes = (associations: { [key: string]: Association }, excludedAssociationNames?: string[]) => {
	const associationNames: string[] = []
	const includeAssociations: Includeable[] = []

	forEach(associations, (association, key) => {
		if (includes(['HasOne', 'HasMany', 'BelongsToMany'], association.associationType) && !includes(excludedAssociationNames, key)) {
			const include: Includeable = {
				model: association.target,
				// NOTE: use array and spread cause primaryKeyAttributes is readOnly
				attributes: [...association.target.primaryKeyAttributes]
			}

			if (get(association, 'options.as')) {
				include.as = get(association, 'options.as')
			}

			if (association.associationType === 'HasMany') {
				include.limit = 1
				include.separate = true
			}

			if (association.associationType === 'BelongsToMany') {
				include.through = {
					attributes: []
				}
			}

			associationNames.push(key)
			includeAssociations.push(include)
		}
	})

	return { associationNames, includeAssociations }
}

/**
 * Check if instance is used as foreign key
 * @param {Model} instance
 * @param {string[]} associationNames
 * @returns {boolean}
 */
export const checkAssignmentAsForeignKey = (instance: Model, associationNames: string[]) =>
	some(associationNames, (associationName) => {
		const association = get(instance, associationName)
		if (isArray(association)) {
			return !!association.length
		}
		return !!association
	})

/**
 * Rounds provided number to provided precision
 * @param {number} value number which will be rounded
 * @param {number} exp the precision to which the number will be rounded, e.g. 2 = 100, 1 = 10, 0 = 1, -1 = 0.1, -2 = 0.01
 * @returns {number} rounded number
 */
export const roundToPrecision = (value: number, exp = 0) => {
	if (value === null) {
		return null
	}

	if (value === undefined) {
		return undefined
	}

	if (value === Infinity) {
		return Infinity
	}

	// if the exp is falsy value, do basic round
	if (!exp) {
		return Math.round(value)
	}

	// if the value is NaN or the exp is not an integer, return NaN
	if (Number.isNaN(value) || exp % 1 !== 0) {
		return NaN
	}

	// shift
	const splittedValueByEShift = value.toString().split('e')
	const roundedEValue = Math.round(+`${splittedValueByEShift[0]}e${splittedValueByEShift[1] ? +splittedValueByEShift[1] - exp : -exp}`)

	// shift back
	const splittedValueByEShiftBack = roundedEValue.toString().split('e')
	return +`${splittedValueByEShiftBack[0]}e${splittedValueByEShiftBack[1] ? +splittedValueByEShiftBack[1] + exp : exp}`
}

/**
 * Check if provided value is valid number
 * @param {number} value
 * @returns {boolean}
 */
export const isValidNumber = (value: number) => {
	if (!isNumber(value) || !Number.isFinite(value)) {
		return false
	}
	return true
}

export interface IInputLocalizationItem {
	languageCode: string
	value: string
}

/**
 * Builds localization data
 * @param {IInputLocalizationItem[]} inputLocalization
 * @param {number} localizationID
 * @return {Object[]}
 */
export const buildLocalizationData = (inputLocalization: IInputLocalizationItem[], localizationID?: number) => {
	if (localizationID) {
		return map(inputLocalization, (inputLocalizationItem) => ({
			languageCode: inputLocalizationItem.languageCode,
			value: inputLocalizationItem.value,
			localizationID
		}))
	}

	return map(inputLocalization, (inputLocalizationItem) => ({
		languageCode: inputLocalizationItem.languageCode,
		value: inputLocalizationItem.value
	}))
}

export const getRandomString = (length: number) => {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let result = '';

	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() *
			charactersLength));
	}

	return result;
}

/**
 * Checks if privided value is numeric
 * @param {string} value
 * @returns {boolean}
 */
// eslint-disable-next-line no-restricted-globals
const isNumeric = (value: string) => !isNaN(<any>value) && !isNaN(parseFloat(value))

/**
 * Returns final searchValue based on searchValue type.
 * If searchValue is number, return searchValue.
 * If searchValue is not number, return searchValue with % at the beginning and end of the searchValue
 * @param {string} searchValue
 * @returns {string}
 */
export const getExactSearchValue = (searchValue: string) => {
	if (isNumeric(searchValue)) {
		return `%-${searchValue}-%`
	}

	return `%${searchValue}%`
}
