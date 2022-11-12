require('dotenv').config()

module.exports = {
	exit: true,
	bail: false,
	require: ['./tests/global.ts'],
	parallel: true,
	jobs: 2,
	timeout: 30000,
	reporter: 'spec',
	// spec: ['./tests/**/*.test.ts']
	// spec: ['./tests/**/authorization/post.login.test.ts']
	// spec: ['./tests/**/authorization/*.test.ts']
	// spec: ['./tests/**/users/get.users.test.ts']
	// spec: ['./tests/**/users/get.user.test.ts']
	// spec: ['./tests/**/users/post.user.test.ts']
	// spec: ['./tests/**/users/post.userConfirm.test.ts']
	// spec: ['./tests/**/users/patch.user.test.ts']
	// spec: ['./tests/**/users/delete.user.test.ts']
	// spec: ['./tests/**/users/patch.resendRegistrationEmail.test.ts']
	spec: ['./tests/**/users/post.assignRoles.test.ts']
}
