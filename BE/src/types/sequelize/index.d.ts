import { Request } from 'express'
import { IncrementDecrementOptions, IncrementDecrementOptionsWithBy, Op } from 'sequelize'
import {
	Model as OriginalModel,
	FindOptions as OriginalFindOptions,
	FindOrCreateOptions as OriginalFindOrCreateOptions,
	CreateOptions as OriginalCreateOptions,
	BulkCreateOptions as OriginalBulkCreateOptions,
	InstanceUpdateOptions as OriginalInstanceUpdateOptions,
	UpdateOptions as OriginalUpdateOptions,
	InstanceDestroyOptions as OriginalInstanceDestroyOptions,
	DestroyOptions as OriginalDestroyOptions,
	InstanceRestoreOptions as OriginalInstanceRestoreOptions,
	RestoreOptions as OriginalRestoreOptions,
	IncludeOptions as OriginalIncludeOptions,
	WhereOperators as OriginalWhereOperators
// eslint-disable-next-line import/no-unresolved
} from 'sequelize/types/lib/model'
// eslint-disable-next-line import/no-unresolved
import { Col, Literal } from 'sequelize/types/lib/utils'

import { ModelsType } from '../../db/models'

interface ILogging {
	/**
	 * Should application log be created (only if model has application log model)?
	 */
	applicationLogging?: boolean
}

interface IDestroyUser {
	/**
	 * ID of user who is deleting record (only if model has deletedBy column)
	 */
	deletedBy?: number
}

declare module 'sequelize' {
	export interface FindOptions extends OriginalFindOptions {
		includeIgnoreAttributes?: boolean
	}
	export interface FindOrCreateOptions extends OriginalFindOrCreateOptions, ILogging { }
	export interface CreateOptions extends OriginalCreateOptions, ILogging { }
	export interface BulkCreateOptions extends OriginalBulkCreateOptions, ILogging { }
	export interface InstanceUpdateOptions extends OriginalInstanceUpdateOptions, ILogging { }
	export interface UpdateOptions extends OriginalUpdateOptions, ILogging { }
	export interface InstanceDestroyOptions extends OriginalInstanceDestroyOptions, ILogging, IDestroyUser { }
	export interface DestroyOptions extends OriginalDestroyOptions, ILogging, IDestroyUser { }
	export interface InstanceRestoreOptions extends OriginalInstanceRestoreOptions, ILogging { }
	export interface RestoreOptions extends OriginalRestoreOptions, ILogging { }
	export interface IncludeOptions extends OriginalIncludeOptions {
		/**
		 * Should application log be created (only for create and bulkCreate and if model has application log model)?
		 */
		applicationLogging?: boolean
	}

	export interface WhereOperators extends OriginalWhereOperators {
		[Op.eq]?: null | string | number | Literal | WhereOperators | Col | boolean;
	}

	// eslint-disable-next-line import/prefer-default-export
	export abstract class Model<T = any, T2 = any> extends OriginalModel<T, T2> {
		public req: Request

		public static associate?: (models: ModelsType) => void

		/**
		 * Decrements a single field.
		 */
		public static decrement?<T3, K extends keyof T3>(
			this: { new(): T3 },
			field: K,
			options: IncrementDecrementOptionsWithBy
		): Promise<T3>

		/**
		 * Decrements multiple fields by the same value.
		 */
		// eslint-disable-next-line no-dupe-class-members
		public static decrement?<T3, K extends keyof T3>(
			this: { new(): T3 },
			fields: K[],
			options: IncrementDecrementOptionsWithBy
		): Promise<T3>

		/**
		 * Decrements multiple fields by different values.
		 */
		// eslint-disable-next-line no-dupe-class-members
		public static decrement?<T3, K extends keyof T3>(
			this: { new(): T3 },
			fields: { [key in K]?: number },
			options: IncrementDecrementOptions
		): Promise<T3>
	}
}
