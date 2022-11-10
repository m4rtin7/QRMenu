import sharp from 'sharp'
import { filter, map } from 'lodash'
import path from 'path'

interface IImageAlternative {
	width: number
	height: number
	buffer: Buffer
	outputPath: string
}

const createImageAlternatives = async (originalImagePath: string, ruleWidths: number[]) => {
	const { dir, name, ext } = path.parse(originalImagePath)
	const metadata = await sharp(originalImagePath).metadata()
	const downscaleImageRules = filter(ruleWidths, (ruleWidth) => ruleWidth < metadata.width)
	const downscalePromises = map(downscaleImageRules, async (ruleWidth) => {
		const sharpInstance = sharp(originalImagePath).resize(
			ruleWidth, // vystupny obrazok bude mat vzdy presne tuto sirku
			undefined, // vyska je dopocitana pri zachovani pomeru stran podla original obrazku
			{ fit: sharp.fit.cover }
		)

		// compress image
		if (ext === 'jpg' || ext === 'jpeg') {
			sharpInstance.jpeg({ quality: 80 })
		} else if (ext === 'png') {
			sharpInstance.png({ force: true, compressionLevel: 9, quality: 80 })
		}

		const { data: buffer, info: resized } = await sharpInstance.toBuffer({ resolveWithObject: true })

		if (ruleWidth !== resized.width) {
			throw new Error('Image width does not match resize rule width')
		}

		// Compose image alternative output path
		const outputPath = `${path.join(dir, name)}-${ruleWidth}${ext}`

		return {
			width: ruleWidth,
			height: resized.height,
			buffer,
			outputPath
		}
	})

	return Promise.all(downscalePromises as Promise<IImageAlternative>[])
}

export default createImageAlternatives
