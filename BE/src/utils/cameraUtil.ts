import axios from "axios"
import path from 'path'
import fs from 'fs'
import config from 'config'
import { v4 } from 'uuid'
import mime from 'mime-types'
import { last, map, split } from 'lodash'
import { FILE_DATA_TYPE, MESSAGE_TYPE } from '../utils/enums'
import { IServerConfig } from '../types/interfaces'
import createImageAlternatives from '../utils/createImageAlternatives'
import ErrorBuilder from '../utils/ErrorBuilder'
import { normalizePath } from '../utils/helper'
import { Transaction } from "sequelize"
import { ModelsType } from "../db/models"
import i18next, { TFunction } from "i18next"
import { CameraModel } from "../db/models/camera"
import { getPhotoFullPath } from "./photoUtil"
import { image } from "faker"
import async from "async"
import dayjs from "dayjs"
const serverConfig: IServerConfig = config.get('server')

export const camerasReplaceImage = async (models: ModelsType, cameraData: CameraModel[], userId: number, transaction: Transaction, t: TFunction, useLogging: boolean, url: string) => {
    const deleteArr: number[] = [];

    await new Promise((resolve, reject) => {
        async.mapLimit(
            [...cameraData],
            10,
            async (cameraItem: CameraModel) => {
                let imgUrl = url;
                if (imgUrl == null) {
                    imgUrl = cameraItem.websiteURL;
                }
 
                if (imgUrl!= null && imgUrl.length > 0) {
                    let newImageId: number = -1;
                    try {                 
                        newImageId = await cameraDownloadThumbImage(models, imgUrl, userId, transaction, t, useLogging);
                    } catch (error) {
                        newImageId = -1;
                    }

                    if (newImageId > 0) {
                        if (cameraItem.imageID > 0) {
                            deleteArr.push(cameraItem.imageID);
                        }

                        await cameraItem.update({ imageID: newImageId, updatedBy: (cameraItem.updatedBy || 1) }, {
                            transaction,
                            logging: false,
                            applicationLogging: false
                        });
                    }
                }
            },
            (err, results) => {
                if (err) {
                    return reject(err)
                }
                return resolve(results)
            }
        )
    })

    const after4Days = dayjs().add(4, 'day').toISOString();
    const fileDeleteData = deleteArr.map(fileId => {
        return {
            fileID: fileId,
            deleteAfter: after4Days
        }
    });

    await models.FileDelete.bulkCreate(fileDeleteData, { transaction })
}

export const cameraDownloadThumbImage = async (models: ModelsType, imgUrl: string, userId: number, transaction: Transaction, t: TFunction, useLogging: boolean): Promise<number> => {
    t = t || i18next.t;

    const { File, FileAlternative } = models;
    const response = await axios.get(imgUrl, {
        responseType: 'stream',
        timeout: 15000
    });

    const contentType = response.headers['content-type']
    let ext = ''
    if (/jpeg|jpg/.test(contentType)) {
        ext = 'jpg'
    } else if (/png/.test(contentType)) {
        ext = 'png'
    } else if (/bmp/.test(contentType)) {
        ext = 'bmp'
    } else {
        throw new ErrorBuilder(409, t('error:Nepodporovaný formát obrázku'))
    }

    const splittedUrl = split(imgUrl, '/')
    const fileName = last(splittedUrl)
    const pathFileName = `${v4()}.${ext}`
    const fullPath = path.join(serverConfig.uploadsPath, 'cams', pathFileName)

    const stream = fs.createWriteStream(fullPath)
    response.data.pipe(stream)

    await new Promise((resolve, reject) => {
        stream.on('finish', resolve)
        stream.on('error', reject)
    })

    const extname = path.extname(fullPath)
    if (extname !== '.jpeg' && extname !== '.jpg' && extname !== '.png' && extname !== '.bmp') {
        throw new ErrorBuilder(409, t('error:Nepodporovaný formát obrázku'))
    }

    const imageAlternativesData = await createImageAlternatives(fullPath, [20, 120, 200, 320, 640, 800, 1280])

    const stats = fs.statSync(fullPath)
    const mimeType = mime.lookup(fileName)

    const safeFolderPath = normalizePath(fullPath)
    const relativePath = safeFolderPath.replace(normalizePath(serverConfig.filesPath), '')

    const fileData = {
        name: fileName,
        dataType: FILE_DATA_TYPE.IMAGE,
        path: relativePath,
        size: stats.size,
        mimeType,
        pathFileName,
        createdBy: userId
    }


    const image = await File.create(fileData, {
        transaction: transaction != null ? transaction : undefined,
        logging: false,
        applicationLogging: (useLogging == true)
    })

    const imageAlternativesDataPromises = map(imageAlternativesData, async (imageAlternativeData) => {
        await fs.promises.writeFile(imageAlternativeData.outputPath, imageAlternativeData.buffer, { encoding: 'binary' })

        const safeFolderPathAlt = normalizePath(imageAlternativeData.outputPath)
        const relativePathAlt = safeFolderPathAlt.replace(normalizePath(serverConfig.filesPath), '')
        return {
            path: relativePathAlt,
            width: imageAlternativeData.width,
            height: imageAlternativeData.height,
            fileID: image.id,
            createdBy: userId
        }
    })
    const fileAlternativesData = await Promise.all(imageAlternativesDataPromises)

    await FileAlternative.bulkCreate(fileAlternativesData, {
        transaction: transaction != null ? transaction : undefined,
        logging: false,
        applicationLogging: (useLogging == true)
    });

    return image.id;
}

export const buildCameraThumbImage = (cam: CameraModel): { [index: string]: { width?: number, height?: number, url: string } } => {
    if (cam.image == null) {
        return {};
    }

    let images: { [index: string]: { width?: number, height?: number, url: string } } = {};
    images['original'] = {
        url: getPhotoFullPath(cam.image.path)
    }

    for (const fileAlternative of (cam?.image?.fileAlternatives || [])) {
        images[fileAlternative.width.toString()] = {
            width: fileAlternative.width,
            height: fileAlternative.height,
            url: getPhotoFullPath(fileAlternative.path)
        }
    }

    return images;
}