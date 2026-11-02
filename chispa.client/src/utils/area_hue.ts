import type { CSSProperties } from 'react'

const HUES = [40, 70, 155, 225, 350, 275, 120, 20, 190, 305]

export function areaHue(key: string) {
	let hash = 0
	for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) | 0
	return HUES[Math.abs(hash) % HUES.length]
}

export const areaStyle = (key: string): CSSProperties => ({
	'--area-h': areaHue(key),
})
