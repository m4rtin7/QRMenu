module.exports = {
	extends: ['@goodrequest/eslint-config-typescript'],
	plugins: ['chai-friendly'],
	parserOptions: {
		project: 'tsconfig.eslint.json',
		tsconfigRootDir: __dirname,
		sourceType: 'module'
	},
	rules: {
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-empty-interface': 'off'
	}
}
