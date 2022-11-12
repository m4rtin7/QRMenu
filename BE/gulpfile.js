const gulp = require('gulp')
const fs = require('fs')
const path = require('path')
const todo = require('gulp-todo')
const {
	template, split, slice, sortBy, join
} = require('lodash')
const through = require('through2')
const i18nextScanner = require('i18next-scanner')

const i18nextScannerConfig = require('./i18next-scanner.config')

gulp.task('i18next-scanner', () => gulp.src(i18nextScannerConfig.input).pipe(i18nextScanner(i18nextScannerConfig.options)).pipe(gulp.dest('./')))

gulp.task('translate-scanner', gulp.parallel(
	'i18next-scanner'
))

/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
gulp.task('todo-scanner', function () {
	return gulp.src(['./**/*.ts', '!node_modules/**'])
		.pipe(todo())
		.pipe(through.obj(function (file, _enc, cb) {
			// read and interpolate template
			const tmpl = fs.readFileSync('./README.template.md', 'utf8')
			const compiledTpl = template(tmpl)

			const allFileLines = split(file.contents.toString(), '\n')
			const onlyTodoLines = slice(allFileLines, 3)
			const restFileLines = slice(allFileLines, 0, 3)
			const orderedTodoLines = sortBy(onlyTodoLines)
			const resultFileString = join([...restFileLines, ...orderedTodoLines], '\n')

			const newContents = compiledTpl({
				toto_marker: resultFileString
			})

			// change file name
			file.path = path.join(file.base, 'README.md')

			// replace old contents
			file.contents = Buffer.from(newContents)

			// push new file
			this.push(file)
			cb()
		}))
		.pipe(gulp.dest('./'))
})
