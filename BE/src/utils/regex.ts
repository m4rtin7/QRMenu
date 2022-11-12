// validate password with rules
//	- min length is 8 characters: (?=.{8,})
//	- contains at least one lowercase letter: (?=.*[a-z]+)
//	- contains at least one uppercase letter: (?=.*[A-Z]+)
//	- contains at least one number: (?=.*\d+)
export const passwordRegEx = /(?=.{8,})^(?=.*[a-z]+)(?=.*[A-Z]+)(?=.*\d+)/

// validate YYYY-MM-DD date format
export const dateRegex = /^(\d{4})[-]((0[1-9])|(1[012]))[-]((0[1-9])|([12][0-9])|(3[01]))$/

// validate HH:mm time format
export const timeRegex = /^(?:[01]\d|2[0-3]):(?:[0-5]\d)$/

// validate RGB HEX color code with alpha and # sign at the beginning
export const hexColorRegex = /^#([A-Fa-f0-9]{8}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
