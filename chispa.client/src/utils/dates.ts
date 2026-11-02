const MONTHS = [
	'ene',
	'feb',
	'mar',
	'abr',
	'may',
	'jun',
	'jul',
	'ago',
	'sep',
	'oct',
	'nov',
	'dic',
]

const toDate = (iso: string) =>
	new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)

export function shortDate(iso: string, now = new Date()) {
	const d = toDate(iso)
	const year =
		d.getFullYear() !== now.getFullYear() ? ` ${d.getFullYear()}` : ''
	return `${d.getDate()} ${MONTHS[d.getMonth()]}${year}`
}

export function daysUntil(isoDate: string, now = new Date()) {
	const end = new Date(`${isoDate.slice(0, 10)}T23:59:59`)
	return Math.ceil((end.getTime() - now.getTime()) / 86_400_000)
}

export function closesLabel(isoDate: string, now = new Date()) {
	const days = daysUntil(isoDate, now)
	if (days < 0) return `Cerró el ${shortDate(isoDate, now)}`
	if (days === 0) return 'Cierra hoy'
	if (days === 1) return 'Cierra mañana'
	if (days <= 14) return `Cierra en ${days} días`
	return `Cierra el ${shortDate(isoDate, now)}`
}

export const todayIso = (now = new Date()) =>
	`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
