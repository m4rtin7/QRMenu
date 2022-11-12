module.exports = {
	input: [
		'src/**/*.ts'
	],
	output: './',
	options: {
		debug: false,
		func: {
			list: ['i18next.t', 'translation', 't'],
			extensions: ['.ts'],
		},
		sort: true,
		trans: false,
		removeUnusedKeys: true,
		lngs: ['sk', 'en', 'pl', 'de', 'it'],
		ns: ['email', 'translation', 'error'],
		defaultLng: 'sk',
		defaultNs: 'translation',
		defaultValue(lng, ns, key) {
			// set default value to key for sk language
			if (lng === 'sk') {
				return key
			}

			return '_NEPRELOZENE_'
		},
		resource: {
			loadPath: 'locales/{{lng}}/{{ns}}.json',
			savePath: 'locales/{{lng}}/{{ns}}.json',
			jsonIndent: 4,
			lineEnding: '\n'
		},
		nsSeparator: ':',
	}
}
