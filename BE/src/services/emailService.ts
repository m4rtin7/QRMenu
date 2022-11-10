import mailer from 'nodemailer'
import config from 'config'

// utils
import { emailLogger } from '../utils/logger'

// types
import { IEmailConfig } from '../types/interfaces'

const emailConfig: IEmailConfig = config.get('email')
const transporter = mailer.createTransport({
	...emailConfig,
	logger: emailLogger
})

// do not check connection when testing (nodemailer is mocked in tests)
transporter.verify((err) => {
	if (err) {
		console.log(`Unable to connect to the email server: ${err}`.red)
	} else {
		console.log('Email server connection has been established successfully'.green)
	}
})
export default async (emailData: mailer.SendMailOptions) =>
	transporter.sendMail({
		...emailData,
		from: emailConfig.from
	})
