import { FileModel } from "../db/models/file"
import { IServerConfig } from "../types/interfaces"
import config from 'config'

const serverConfig: IServerConfig = config.get('server')
export const getPhotoFullPath = (photo: FileModel | string): string => {
    if(photo) {
        const path: string = (photo as any).path ?? photo as any;
        if (path.indexOf('/uploads/') == 0) {
            return `${serverConfig.domain}/api/v1/files${(photo as any).path ?? photo as any}`
        } else {
            return `${serverConfig.domain}/api/v1/files/uploads${(photo as any).path ?? photo as any}`
        }

        
    }
    return;
}
