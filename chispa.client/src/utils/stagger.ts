import type { CSSProperties } from 'react'

export const stagger = (index: number) =>
	({ '--i': Math.min(index, 12) }) as CSSProperties
