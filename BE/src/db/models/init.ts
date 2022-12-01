/* eslint-disable import/no-cycle */
import { Sequelize } from 'sequelize'

import defineUser from './user'
import definePermission from './permission'
import defineRole from './role'
import defineRolePermission from './rolePermission'
import defineUserRole from './userRole'
import defineFile from './file'
import defineLanguage from './language'
import defineRestaurant from './restaurant'
import defineAllergen from './allergen'
import defineMenuItemAllergen from './MenuItemAlergen'
import defineLocalization from './localization'
import defineLocalizationValue from './localizationValue'
import defineMenuItem from './menuItem'
import defineMenuItemCategory from '../menuItemCategory'

import defineFileLog from './logs/fileLog'
import defineRoleLog from './logs/roleLog'
import defineUserLog from './logs/userLog'
import defineResortLog from './logs/resortLog'

import defineLog from './logs/log'

// NOTE: modelName is same as model key (but with small first character)
const modelsBuilder = (instance: Sequelize) => ({
	User: defineUser(instance, 'user'),
	Permission: definePermission(instance, 'permission'),
	Role: defineRole(instance, 'role'),
	RolePermission: defineRolePermission(instance, 'rolePermission'),
	UserRole: defineUserRole(instance, 'userRole'),
	File: defineFile(instance, 'file'),
	Language: defineLanguage(instance, 'language'),
	Localization: defineLocalization(instance, 'localization'),
	LocalizationValue: defineLocalizationValue(instance, 'localizationValue'),
	MenuItem: defineMenuItem(instance, 'menuItem'),
	//MenuItemCategory: defineMenuItemCategory(instance, 'menuItemCategory'),
	Restaurant: defineRestaurant(instance, 'restaurant'),
	Allergen: defineAllergen(instance, 'allergen'),
	MenuItemAllergen: defineMenuItemAllergen(instance, 'menuItemAllergen'),
	
	RoleLog: defineRoleLog(instance, 'roleLog'),
	FileLog: defineFileLog(instance, 'fileLog'),
	UserLog: defineUserLog(instance, 'userLog'),
	ResortLog: defineResortLog(instance, 'resortLog'),

    Log: defineLog(instance, 'logs')

    
})

// eslint-disable-next-line import/prefer-default-export
export { modelsBuilder }
