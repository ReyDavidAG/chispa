import type { IconName } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import type { Role } from '@/types/session_type'

export interface NavItem {
	to: string
	label: string
	short: string
	icon: IconName
	end?: boolean
	badge?: boolean
}

export function navItems(role: Role): NavItem[] {
	const items: NavItem[] = [
		{
			to: ROUTES.home,
			label: 'Inicio',
			short: 'Inicio',
			icon: 'home',
			end: true,
		},
		{
			to: ROUTES.challenges,
			label: 'Retos',
			short: 'Retos',
			icon: 'tag',
			badge: true,
		},
		{
			to: ROUTES.myIdeas,
			label: 'Mis chispas',
			short: 'Mis chispas',
			icon: 'spark',
		},
	]
	if (role !== 'member')
		items.push({
			to: ROUTES.myArea,
			label: role === 'committee' ? 'Evaluación' : 'Mi área',
			short: role === 'committee' ? 'Evaluar' : 'Mi área',
			icon: 'building',
		})
	items.push({
		to: ROUTES.howItWorks,
		label: 'Cómo funciona',
		short: 'La feria',
		icon: 'info',
	})
	return items
}
