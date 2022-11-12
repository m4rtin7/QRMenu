import path from 'path';
import { FileModel } from '../db/models/file';
import { getPhotoFullPath } from "./photoUtil";

export const imageGetPathAndThumbnails = (imgFile: FileModel, thumbSizes: [480 |640 | 1024 | 1900]): {  fullPath: string, thumbPaths: {thumbSize: number, url: string}[]  } => {
    const imgRelativePath = imgFile?.path;
    
    if (imgRelativePath != null && (imgRelativePath || '').toString().length > 0) {
        const fullUrl = getPhotoFullPath(imgRelativePath);
        const thumbArr: {thumbSize: number, url: string}[] = [];
        const { ext } = path.parse(imgRelativePath);

        for (const thumbSize of thumbSizes) {
            const existingAlternative =( imgFile.fileAlternatives || []).find(p => p.width == thumbSize);
            const thumbUrl = existingAlternative != null ?fullUrl.replace(ext, `-${thumbSize}${ext}`) : fullUrl;

            thumbArr.push({
                thumbSize: thumbSize,
                url: thumbUrl
            });
        }

        return {
            fullPath: fullUrl,
            thumbPaths: thumbArr
        };
    } else {
        return {
            fullPath: null,
            thumbPaths: []
        };
    }
};