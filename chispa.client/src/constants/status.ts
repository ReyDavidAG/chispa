import type { IconName } from '@/components/ui/icon'
import type { ChallengeStatus } from '@/types/challenge_type'
import type { IdeaStatus } from '@/types/idea_type'

export type Tone = 'ok' | 'warn' | 'info' | 'done' | 'neutral'

export const CHALLENGE_STATUS: Record<
	ChallengeStatus,
	{ label: string; tone: Tone }
> = {
	open: { label: 'Abierto', tone: 'ok' },
	review: { label: 'En evaluación', tone: 'warn' },
	building: { label: 'En desarrollo', tone: 'info' },
	solved: { label: 'Resuelto', tone: 'done' },
	suggested: { label: 'Sugerido', tone: 'neutral' },
	archived: { label: 'Archivado', tone: 'neutral' },
}

export const SOLUTION_TYPES: Record<string, string> = {
	software: 'Sistema o app',
	process: 'Cambio de proceso',
	equipment: 'Equipo o infraestructura',
	other: 'Otra cosa',
}

export const ROLE_NAMES = {
	member: 'Colaborador',
	lead: 'Encargado',
	committee: 'Comité',
} as const

export const IDEA_STATUS: Record<
	IdeaStatus,
	{ label: string; tone: Tone; step: number }
> = {
	received: { label: 'Recibida', tone: 'neutral', step: 0 },
	review: { label: 'En revisión', tone: 'warn', step: 1 },
	selected: { label: 'Seleccionada', tone: 'ok', step: 2 },
	building: { label: 'En desarrollo', tone: 'info', step: 3 },
	done: { label: 'Implementada', tone: 'done', step: 4 },
	archived: { label: 'Archivada', tone: 'neutral', step: -1 },
}

export const IDEA_STEPS = [
	'Recibida',
	'En revisión',
	'Seleccionada',
	'En desarrollo',
	'Implementada',
]

export const SOLUTION_HINTS: Record<string, string> = {
	software: 'Una pantalla, un reporte, una app.',
	process: 'Otra forma de hacer lo mismo.',
	equipment: 'Una herramienta, un sensor, una instalación.',
	other: 'Capacitación, comunicación, un acuerdo.',
}

export const BENEFITS: Record<string, string> = {
	time: 'Ahorra tiempo',
	money: 'Ahorra dinero',
	safety: 'Más seguridad',
	quality: 'Mejor calidad',
	people: 'Mejor día a día',
	control: 'Más control',
}

export const SOLUTION_ICONS: Record<string, IconName> = {
	software: 'monitor',
	process: 'process',
	equipment: 'wrench',
	other: 'bulb',
}

export const BENEFIT_ICONS: Record<string, IconName> = {
	time: 'clock',
	money: 'money',
	safety: 'shield',
	quality: 'award',
	people: 'smile',
	control: 'gauge',
}
