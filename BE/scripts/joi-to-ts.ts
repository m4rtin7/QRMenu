import { any } from 'joi';
import { convertFromDirectory } from 'joi-to-typescript';

async function types(): Promise<void> {
    console.log('Running joi-to-typescript...');
    const { readdirSync } = require('fs')
    const getDirectories =
        (source: string) => readdirSync(source, { withFileTypes: true })
            .filter((dirent: { isDirectory: () => any; }) => dirent.isDirectory())
            .map((dirent: { name: any; }) => dirent.name);




    const dirArr = getDirectories('./src/api/v1/') as string[];
    for (const dirName of dirArr) {
        console.log('Current dir:' + dirName);

        //Causes crash for some reason
        if (dirName == 'resorts') {
            continue;
        }

        const result = await convertFromDirectory({
            schemaDirectory: './src/api/v1/' + dirName,
            typeOutputDirectory: './src/ts-joi-interfaces/' + dirName,
            debug: true
        });

        if (result) {
            console.log('Completed joi-to-typescript');
        } else {
            console.log('Failed to run joi-to-typescrip');
        }
    }
}

types();