import { DataTypes, literal, QueryInterface } from 'sequelize'
import { DbTableLog } from '../../models/logs/log'

const functionName = 'logTrigger'
const schemaName = 'logging'

export async function up(queryInterface: QueryInterface) {
	let transaction
	try {
		transaction = await queryInterface.sequelize.transaction()
		await queryInterface.createSchema(schemaName, { transaction })
		await queryInterface.createTable({ schema: schemaName, tableName: 'logs' }, DbTableLog, { transaction })

		// NOTE: it does not work with transacion
		await queryInterface.createFunction(functionName, [], 'trigger', 'plpgsql', /* SQL */`
			BEGIN
				IF TG_OP = 'INSERT' THEN
				BEGIN
					INSERT INTO logging.logs ("tableName", "userName", operation, "newValue")
					VALUES (TG_RELNAME, (SELECT CONCAT(id::text , ';', Name, ' ', Surname) FROM Users where id = new."createdBy"), TG_OP, row_to_json(NEW));
					RETURN NEW;
				EXCEPTION WHEN OTHERS THEN
					INSERT INTO logging.logs ("tableName", "userName", operation, "newValue")
					VALUES (TG_RELNAME, TG_TABLE_SCHEMA, TG_OP, row_to_json(NEW));
					RETURN NEW;					
				END;
				ELSIF TG_OP = 'UPDATE' THEN
					BEGIN
						INSERT INTO logging.logs ("tableName", "userName", operation, "newValue", "oldValue")
						VALUES (TG_RELNAME, (SELECT CONCAT(id::text , ';', Name, ' ', Surname) FROM Users where id = NEW."updatedBy"), TG_OP, row_to_json(NEW), row_to_json(OLD));
						RETURN NEW;
					EXCEPTION WHEN OTHERS THEN
						INSERT INTO logging.logs ("tableName", "userName", operation, "newValue", "oldValue")
						VALUES (TG_RELNAME, TG_TABLE_SCHEMA, TG_OP, row_to_json(NEW), row_to_json(OLD));
						RETURN NEW;
					END;
				ELSIF TG_OP = 'DELETE' THEN
					BEGIN
						INSERT INTO logging.logs ("tableName", "userName", operation, "oldValue")
						VALUES (TG_RELNAME, (SELECT CONCAT(id::text , ';', Name, ' ', Surname) FROM Users where id = NEW."deletedBy"), TG_OP, row_to_json(OLD));
						RETURN OLD;
					EXCEPTION WHEN OTHERS THEN
						INSERT INTO logging.logs ("tableName", "userName", operation, "oldValue")
						VALUES (TG_RELNAME, TG_TABLE_SCHEMA, TG_OP, row_to_json(OLD));
						RETURN OLD;					
					END;
				END IF;
			END;
		`, undefined, { force: true })

		await transaction.commit()

		return true
	} catch (e) {
		if (transaction) {
			await transaction.rollback()
		}
		return Promise.reject(e)
	}
}

export async function down(queryInterface: QueryInterface) {
	await queryInterface.dropFunction(functionName, [])
	await queryInterface.dropSchema(schemaName)

	return true
}
