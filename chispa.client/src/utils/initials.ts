export const initials = (name: string) =>
	name
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map(w => w[0])
		.join('')
		.toUpperCase()
