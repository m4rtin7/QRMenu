import { expect } from 'chai'

import {
	createSlug, getFileNamePostfixIndexMetadata, getFirstUnusedNumber, getFinalFileName, escapeSpecialCharactersForElastic
} from '../../../src/utils/helper'

describe('testing createSlug()', () => {
	it('should return ""', () => {
		const result = createSlug(null)
		expect(result).to.equal('')
	})

	it('should return "test-test"', () => {
		const result = createSlug('Test Test')
		expect(result).to.equal('test-test')
	})

	it('should return "test-test"', () => {
		const result = createSlug('Test Test', '/')
		expect(result).to.equal('test/test')
	})
})

describe('testing escapeSpecialCharactersForElastic()', () => {
	it('should return ""', () => {
		const result = escapeSpecialCharactersForElastic(null)
		expect(result).to.equal('')
	})

	it('should return "test\\:"', () => {
		const result = escapeSpecialCharactersForElastic('test:')
		expect(result).to.equal('test\\:')
	})

	it('should return "test\\[test"', () => {
		const result = escapeSpecialCharactersForElastic('test[test')
		expect(result).to.equal('test\\[test')
	})

	it('should return "test/test"', () => {
		const result = escapeSpecialCharactersForElastic('test/test')
		expect(result).to.equal('test/test')
	})
})

describe('testing getFileNamePostfixIndexMetadata()', () => {
	it('null as input', () => {
		const result = getFileNamePostfixIndexMetadata(null)
		expect(result).to.eql({
			name: '',
			ext: undefined,
			postfix: null,
			nameWithoutPostfix: '',
			postfixIndex: 0
		})
	})

	it('filename without postfix as input', () => {
		const result = getFileNamePostfixIndexMetadata('test file.txt')
		expect(result).to.eql({
			name: 'test file',
			ext: 'txt',
			postfix: null,
			nameWithoutPostfix: 'test file',
			postfixIndex: 0
		})
	})

	it('filename with postfix as input', () => {
		const result = getFileNamePostfixIndexMetadata('test file (1).txt')
		expect(result).to.eql({
			name: 'test file (1)',
			ext: 'txt',
			postfix: '(1)',
			nameWithoutPostfix: 'test file',
			postfixIndex: 1
		})
	})
})

describe('testing getFirstUnusedNumber()', () => {
	it('null as input should return 0', () => {
		const result = getFirstUnusedNumber(null)
		expect(result).to.equal(0)
	})

	it('empty array as input should return 0', () => {
		const result = getFirstUnusedNumber([])
		expect(result).to.equal(0)
	})

	it('array without 0 should return 0', () => {
		const result = getFirstUnusedNumber([1, 2, 5])
		expect(result).to.equal(0)
	})

	it('array with 0 should return 3', () => {
		const result = getFirstUnusedNumber([0, 1, 2, 5])
		expect(result).to.equal(3)
	})
})

describe('testing getFinalFileName()', () => {
	it('there are no other files with same name', () => {
		const result = getFinalFileName('test file.txt', [])
		expect(result).to.equal('test file.txt')
	})

	it('there is file with same name', () => {
		const result = getFinalFileName('test file.txt', ['test file.txt'])
		expect(result).to.equal('test file (1).txt')
	})

	it('there are files with same name (intact order)', () => {
		const result = getFinalFileName('test file.txt', ['test file.txt', 'test file (1).txt'])
		expect(result).to.equal('test file (2).txt')
	})

	it('there are files with same name (broken order)', () => {
		const result = getFinalFileName('test file.txt', ['test file.txt', 'test file (2).txt'])
		expect(result).to.equal('test file (1).txt')
	})

	it('there are files with same name (broken order, already existing postfix)', () => {
		const result = getFinalFileName('test file (2).txt', ['test file.txt', 'test file (2).txt'])
		expect(result).to.equal('test file (1).txt')
	})

	it('there are files with same name (broken order, non existing postfix)', () => {
		const result = getFinalFileName('test file (3).txt', ['test file.txt', 'test file (2).txt'])
		expect(result).to.equal('test file (3).txt')
	})
})
