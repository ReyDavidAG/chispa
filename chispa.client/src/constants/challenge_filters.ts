export interface Filters {
	q: string
	status: string
	area: string
	type: string
	sort: string
}

export const DEFAULT_FILTERS: Filters = {
	q: '',
	status: 'open',
	area: '',
	type: '',
	sort: 'recent',
}
