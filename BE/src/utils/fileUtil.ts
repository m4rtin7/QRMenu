import mime from "mime"
import path from 'path'
import fs from 'fs-extra'
import util from 'util'
import { Transaction, Op, where, literal } from 'sequelize'
import sequelize, { ModelsType } from "../db/models"
import { FILE_DATA_TYPE, MESSAGE_TYPE } from "./enums"
import ErrorBuilder from "./ErrorBuilder"
import { getFileDataType, getFileNamePostfixIndexMetadata, getFinalFileName, joinAndNormalizeAbsolutePath, normalizePath } from "./helper"
import i18next, { TFunction } from "i18next"
import config from 'config'
import { IServerConfig, ISharpConfig } from "../types/interfaces"
import logger from "./logger"
import { map } from "lodash"
import createImageAlternatives from "./createImageAlternatives"

const serverConfig: IServerConfig = config.get('server')
const sharpConfig: ISharpConfig = config.get('sharp')

const tempFolderPath = serverConfig.tempPath

interface FileWriteModel {
    originalname: string,
    filename: string,
    size: number
}

interface FileWriteArgs {
    file: FileWriteModel,
    models: ModelsType,
    pathToFolder: string,
    title?: string,
    altText?: string
    description?: string
    userId: number
    useAppLogging: boolean
    t?: TFunction
}

export const fileWriteToStorage = async (args: FileWriteArgs) => {
    let transaction: Transaction;
    try {
        const { File,  } = args.models
        const t = args.t || i18next.t;
        const { file } = args;

        const safeFolderPath = joinAndNormalizeAbsolutePath([args.pathToFolder], t)
        let relativePath = safeFolderPath.replace(normalizePath(serverConfig.uploadsPath), '')
        if (relativePath !== '/') {
            relativePath = `${relativePath}/`
        }

        console.log(file);
        

        const { ext, nameWithoutPostfix } = getFileNamePostfixIndexMetadata(file.originalname)

        const [sameNameFiles] = await Promise.all([
            File.findAll({
                attributes: ['id', 'name'],
                where: {
                    [Op.and]: [
                        where(literal('substring("file"."path", 1, length("file"."path") - length("file"."pathFileName"))'), { [Op.eq]: relativePath }),
                        {
                            name: { [Op.regexp]: `^(${nameWithoutPostfix}.${ext}$|${nameWithoutPostfix} \\(\\d+\\).${ext})$` }
                        }
                    ]
                }
            }),
            new Promise<void>((resolve, reject) => {
                fs.lstat(safeFolderPath, async (err) => {
                    if (err) {
                        logger.error(`post.file: ${err.message} stack: ${JSON.stringify(util.inspect(err))} \n`)
                        if (err.code === 'ENOENT') {
                            try {
                                await fs.promises.mkdir(safeFolderPath, { recursive: true })
                                return resolve()
                            } catch (e) {
                                return reject(e)
                            }
                        }
                        return reject(new ErrorBuilder(400, t('error:Nepodarilo sa vytvorit priecinok')))
                    }
                    // Priecinok existuje
                    return resolve()
                }) as void
            })
        ])

        const sameNameFileNames = map(sameNameFiles, 'name')
        const finalFileName = getFinalFileName(file.originalname, sameNameFileNames)

        const mimeType = mime.lookup(file.filename)

        const dataType = getFileDataType(path.extname(file.filename))

        if (dataType === FILE_DATA_TYPE.OTHER) {
            throw new ErrorBuilder(409, t('error:Nepovolený typ súboru'))
        }

        transaction = await sequelize.transaction()
        // Create file
        const fileCreated = await File.create(
            {
                name: finalFileName,
                dataType,
                mimeType,
                path: normalizePath(path.join(relativePath, file.filename)),
                size: file.size,
                title: args.title,
                altText: args.altText,
                description: args.description,
                createdBy: args.userId
            },
            {
                transaction,
                applicationLogging: args.useAppLogging
            }
        )

        const originalFinalPath = path.join(safeFolderPath, file.filename)

        await fs.promises.copyFile(path.join(tempFolderPath, file.filename), originalFinalPath)
        await fs.promises.unlink(path.join(tempFolderPath, file.filename))

        // Create file alternatives
        if (dataType === FILE_DATA_TYPE.IMAGE && ext !== 'svg') {
            const imageAlternativesData = await createImageAlternatives(originalFinalPath, sharpConfig.ruleWidths)
            const promises = map(imageAlternativesData, async (item) => {
                await fs.promises.writeFile(item.outputPath, item.buffer)
                return {
                    path: item.outputPath.replace(normalizePath(serverConfig.uploadsPath), ''),
                    width: item.width,
                    height: item.height,
                    fileID: fileCreated.id
                }
            })

        }

        await transaction.commit()


        return {
            id: fileCreated.id,
            displayName: fileCreated.name,
            dataType: fileCreated.dataType,
            path: fileCreated.path,
            pathFileName: fileCreated.pathFileName,
            size: fileCreated.size,
            title: fileCreated.title,
            altText: fileCreated.altText,
            description: fileCreated.description,
            mimeType: fileCreated.mimeType
        };
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }

        throw error;
    }
}