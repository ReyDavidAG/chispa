import { useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router'

import { Icon } from '@/components/ui/icon'
import { Wordmark } from '@/components/ui/wordmark'
import { ROUTES } from '@/constants/routes'
import { useIndicator } from '@/hooks/ui/use_indicator'

import type { NavItem } from './nav_items'
import { NewBadge } from './new_badge'
import { UserMenu } from './user_menu'

export function TopBar({
	items,
	freshCount,
}: {
	items: NavItem[]
	freshCount: number
}) {
	const nav = useRef<HTMLElement>(null)
	const { pathname } = useLocation()
	useIndicator(
		nav,
		'[aria-current="page"]',
		'topnav',
		`${pathname}:${freshCount}`
	)

	return (
		<header className='topbar'>
			<div className='topbar__inner'>
				<Link
					className='topbar__brand'
					to={ROUTES.home}
					aria-label='Chispa, inicio'>
					<Wordmark />
					<span className='topbar__event'>Feria de Innovación</span>
				</Link>
				<nav ref={nav} className='topnav' aria-label='Principal'>
					{items.map(i => (
						<NavLink key={i.to} to={i.to} end={i.end} className='topnav__link'>
							{i.label}
							{i.badge && <NewBadge count={freshCount} />}
						</NavLink>
					))}
				</nav>
				<div className='topbar__actions'>
					<Link
						className='btn btn--spark btn--sm topbar__propose'
						to={ROUTES.propose}>
						<Icon name='plus' />
						Proponer chispa
					</Link>
					<UserMenu />
				</div>
			</div>
		</header>
	)
}
