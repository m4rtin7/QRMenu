import path from 'path'

export async function createTriggers(): Promise<void> {
    const modelsFolder = path.resolve('src', 'db', 'models');
    const triggersFolder = path.resolve('src', 'db', 'migrations', 'afterSyncDb', 'loggingTriggers');
    const fs = require('fs');

    (fs.readdirSync(modelsFolder) as string[]).forEach(fileName => {
        if (fileName.indexOf('.ts') > -1) {
            const fileContent: string = fs.readFileSync(path.resolve(modelsFolder, fileName)).toString();
            if (fileContent.indexOf('createdBy: number') > -1 || fileContent.indexOf('updatedBy: number') > -1 || fileContent.indexOf('deletedBy: number') > -1) {
                const SEARCH_PATTERN = 'tableName:'
                let startIndex = fileContent.indexOf(SEARCH_PATTERN);
                let endIndex = 0;

                if (startIndex > 0) {
                    startIndex += SEARCH_PATTERN.length;
                    endIndex = fileContent.indexOf('\n', startIndex);

                    const tableName = fileContent.substring(startIndex, endIndex).trim().replaceAll("'", "").replaceAll('"', "").replaceAll(',','').trim();
                    const entityName = fileName.replace('.ts', '');
                    const scriptBody = getScript(tableName, entityName);
                    const newFileName = `00000000000000-dependency-create-${entityName}-logging-trigger.ts`;
                    fs.writeFileSync(path.resolve(triggersFolder, newFileName), scriptBody);
                    console.log(`Trigger file for ${entityName} written`);
                }

            }
        }
    });
}

function getScript(tableName: string, entityName: string): string {
    let builder = '';
    builder += "import { QueryInterface } from 'sequelize'\n\n";
    builder += `const tableNameS = '${entityName}'\n`;
    builder += `const tableNameP = '${tableName}'\n\n`;

    builder += "export function up(queryInterface: QueryInterface) {\n";
    builder += "	return queryInterface.sequelize.query(/* SQL */`\n";
    builder += '		CREATE TRIGGER "${`${tableNameS}LogTrigger`}" BEFORE INSERT OR UPDATE OR DELETE ON "public"."${tableNameP}"\n';
    builder += "			FOR EACH ROW EXECUTE PROCEDURE logTrigger();\n"
    builder += "	`)\n"
    builder += "}\n"

    builder += "export function down(queryInterface: QueryInterface) {\n";
    builder += "	return queryInterface.sequelize.query(/* SQL */`\n";
    builder += '		DROP TRIGGER IF EXISTS "${`${tableNameS}LogTrigger`}" ON "public"."${tableNameP}";\n';
    builder += "	`)\n";
    builder += "}\n";
    return builder;
}

createTriggers();

