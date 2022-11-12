import path from 'path'
import ejs from 'ejs'
import config from 'config'
import { IServerConfig } from '../types/interfaces'

const serverConfig: IServerConfig = config.get('server')

export default (file: string, data: object = {}) =>
	new Promise((resolve, reject) => {
		ejs.renderFile(path.join(process.cwd(), 'src', 'views', file), { domain: serverConfig.domain, ...data }, (err, html: string) => {
			if (err) {
				return reject(err)
			}
			return resolve(html)
		})
	})
