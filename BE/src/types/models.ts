import { Model, InstanceRestoreOptions, RestoreOptions } from 'sequelize'

export interface IRestoreHookFunctions {
	beforeRestore(name: string, fn: (instance: Model, options: InstanceRestoreOptions) => void): void
	beforeRestore(fn: (instance: Model, options: InstanceRestoreOptions) => void): void
	beforeBulkRestore(name: string, fn: (options: RestoreOptions) => void): void
	beforeBulkRestore(fn: (options: RestoreOptions) => void): void

	afterRestore(name: string, fn: (instance: Model, options: InstanceRestoreOptions) => void): void
	afterRestore(fn: (instance: Model, options: InstanceRestoreOptions) => void): void
	afterBulkRestore(name: string, fn: (options: RestoreOptions) => void): void
	afterBulkRestore(fn: (options: RestoreOptions) => void): void
}
