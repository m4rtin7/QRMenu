import { split, toLower, map, join, slice } from 'lodash'
import i18next from 'i18next'
import { Order } from 'sequelize'

import ErrorBuilder from './ErrorBuilder'

function createOrder(order: string, allowedCols: { [allowedColName: string]: string }, raw: true): string
// eslint-disable-next-line no-redeclare
function createOrder(order: string, allowedCols: { [allowedColName: string]: string }, raw?: false): Order
// eslint-disable-next-line no-redeclare
function createOrder(order: string, allowedCols: { [allowedColName: string]: string }, raw: true | false = false) {
	if (order) {
		const orderItems = split(order, ':')
		if (orderItems && orderItems.length === 2) {
			const queryOrder: string = allowedCols[orderItems[0]]

			if (queryOrder) {
				let direction = 'asc'

				if (toLower(orderItems[1]) === 'asc') {
					direction = 'asc'
				} else if (toLower(orderItems[1]) === 'desc') {
					direction = 'desc'
				} else {
					// TODO: doriesit preklad chybovych hlasok
					throw new ErrorBuilder(400, i18next.t('error:Smer nie je povolený'))
				}

				if (raw) {
					const splittedQueryOrder = map(split(queryOrder, '.'), (item) => `"${item}"`)

					let splittedQueryOrderWithoutLast: string[] = []
					if (splittedQueryOrder.length > 1) {
						splittedQueryOrderWithoutLast = slice(splittedQueryOrder, 0, -1)
					}

					return `${join(splittedQueryOrder, '.')} ${direction}, ${join([...splittedQueryOrderWithoutLast, '"id"'], '.')} ${direction}`
				}

				const splittedQueryOrder = queryOrder.split('.')

				let splittedQueryOrderWithoutLast: string[] = []
				if (splittedQueryOrder.length > 1) {
					splittedQueryOrderWithoutLast = slice(splittedQueryOrder, 0, -1)
				}

				return <Order>[
					[...splittedQueryOrder, direction],
					[...splittedQueryOrderWithoutLast, 'id', direction]
				]
			}
			throw new ErrorBuilder(400, i18next.t('error:Stĺpec nie je povolený'))
		}
		throw new ErrorBuilder(400, i18next.t('error:Nesprávny formát zoradenia'))
	}
	throw new ErrorBuilder(400, i18next.t('error:Prázdne zoradenie je nie dovolené'))
}

export default createOrder
