import { QueryInterface } from 'sequelize'

const tableNameS = 'rolePermission'
const tableNameP = 'role_permissions'

export function up(queryInterface: QueryInterface) {
	return queryInterface.sequelize.query(/* SQL */`
		CREATE TRIGGER "${`${tableNameS}LogTrigger`}" BEFORE INSERT OR UPDATE OR DELETE ON "public"."${tableNameP}"
			FOR EACH ROW EXECUTE PROCEDURE logTrigger();
	`)
}

export function down(queryInterface: QueryInterface) {
	return queryInterface.sequelize.query(/* SQL */`
		DROP TRIGGER IF EXISTS "${`${tableNameS}LogTrigger`}" ON "public"."${tableNameP}";
	`)
}
