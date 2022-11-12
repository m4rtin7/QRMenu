import { QueryInterface } from 'sequelize'

import { LOGGING_SCHEMA } from '../../../utils/enums'

export function up(queryInterface: QueryInterface) {
	return queryInterface.sequelize.query(/* SQL */`CREATE SCHEMA IF NOT EXISTS ${LOGGING_SCHEMA}`)
}

export function down(queryInterface: QueryInterface) {
	return queryInterface.sequelize.query(/* SQL */`DROP SCHEMA IF EXISTS ${LOGGING_SCHEMA}`)
}
