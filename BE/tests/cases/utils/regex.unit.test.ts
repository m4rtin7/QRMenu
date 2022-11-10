import { expect } from 'chai'

import {
	passwordRegEx, dateRegex, timeRegex, hexColorRegex
} from '../../../src/utils/regex'

describe('testing password regex', () => {
	// PASSWORD REGEX
	it('password must contain at least 8 characters', () => {
		const result = passwordRegEx.test('Lopa123')
		expect(result).to.equal(false)
	})
	it('password must contain at least one upperCase', () => {
		const result = passwordRegEx.test('lopaty123')
		expect(result).to.equal(false)
	})
	it('password must contain at least one lowerCase', () => {
		const result = passwordRegEx.test('LOPATY123')
		expect(result).to.equal(false)
	})

	it('password must contain at least one number', () => {
		const result = passwordRegEx.test('LopatyAA')
		expect(result).to.equal(false)
	})

	it('valid password', () => {
		const result = passwordRegEx.test('Lopaty123')
		expect(result).to.equal(true)
	})
})

describe('testing date regex', () => {
	it('valid date (YYYY-DD-MM format)', () => {
		const result = dateRegex.test('2020-12-14')
		expect(result).to.equal(true)
	})

	it('invalid date (letters are not allowed)', () => {
		const result = dateRegex.test('fafa-fa-fa')
		expect(result).to.equal(false)
	})

	it('day in date cannot be greater than 31', () => {
		const result = dateRegex.test('2020-12-32')
		expect(result).to.equal(false)
	})

	it('month in date cannot be greater than 12', () => {
		const result = dateRegex.test('2020-13-01')
		expect(result).to.equal(false)
	})
})

describe('testing time regex', () => {
	it('valid time (HH:mm)', () => {
		const result = timeRegex.test('10:15')
		expect(result).to.equal(true)
	})

	it('invalid time (letters are not allowed)', () => {
		const result = timeRegex.test('fa:fa')
		expect(result).to.equal(false)
	})

	it('minutes in time cannot be greater 59', () => {
		const result = timeRegex.test('10-60')
		expect(result).to.equal(false)
	})

	it('hours in time cannot be greater than 23', () => {
		const result = timeRegex.test('24-15')
		expect(result).to.equal(false)
	})
})

describe('testing HEX color regex', () => {
	it('valid HEX color (#rrggbbaa)', () => {
		const result = hexColorRegex.test('#FF0000FF')
		expect(result).to.equal(true)
	})

	it('valid HEX color (#rrggbb)', () => {
		const result = hexColorRegex.test('#FF0000')
		expect(result).to.equal(true)
	})

	it('valid HEX color (#rgb)', () => {
		const result = hexColorRegex.test('#F00')
		expect(result).to.equal(true)
	})

	it('only letters a-f and A-F are allowed', () => {
		const result = hexColorRegex.test('#GF0000')
		expect(result).to.equal(false)
	})

	it('only numbers ', () => {
		const result = hexColorRegex.test('10-60')
		expect(result).to.equal(false)
	})
})
