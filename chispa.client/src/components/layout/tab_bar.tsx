import { NavLink } from 'react-router'

import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'

import type { NavItem } from './nav_items'
import { NewBadge } from './new_badge'

export function TabBar({
	items,
	freshCount,
}: {
	items: NavItem[]
	freshCount: number
}) {
	const [home, challenges, mine, ...rest] = items
	const fourth = rest.length > 1 ? rest[0] : rest[rest.length - 1]
	const tab = (i: NavItem) => (
		<NavLink key={i.to} to={i.to} end={i.end} className='tabbar__item'>
			<span className='tabbar__icon'>
				<Icon name={i.icon} />
				{i.badge && <NewBadge count={freshCount} />}
			</span>
			<span>{i.short}</span>
		</NavLink>
	)
	return (
		<nav className='tabbar' aria-label='Principal'>
			{tab(home)}
			{tab(challenges)}
			<NavLink to={ROUTES.propose} className='tabbar__propose'>
				<span className='tabbar__propose-btn'>
					<Icon name='plus' />
				</span>
				<span>Proponer</span>
			</NavLink>
			{tab(mine)}
			{tab(fourth)}
		</nav>
	)
}
