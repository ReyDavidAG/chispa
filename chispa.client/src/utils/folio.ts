export type FolioKind = 'RET' | 'CHI'

export const formatFolio = (kind: FolioKind, n: number) =>
	`${kind}-${String(n).padStart(3, '0')}`

export function parseFolio(kind: FolioKind, value: string) {
	const match = new RegExp(`^${kind}-(\\d{1,6})$`).exec(value)
	return match ? Number(match[1]) : null
}
