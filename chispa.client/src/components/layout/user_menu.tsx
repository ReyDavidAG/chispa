import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { ROLE_NAMES } from '@/constants/status'
import { useRequiredSession, useSession } from '@/hooks/auth/use_session'
import { areaStyle } from '@/utils/area_hue'
import { initials } from '@/utils/initials'

export function UserMenu() {
	const session = useRequiredSession()
	const { signOut } = useSession()
	const navigate = useNavigate()
	const [open, setOpen] = useState(false)
	const root = useRef<HTMLDivElement>(null)
	const { person } = session

	useEffect(() => {
		if (!open) return
		const onClick = (e: MouseEvent) => {
			if (!root.current?.contains(e.target as Node)) setOpen(false)
		}
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
		document.addEventListener('click', onClick)
		document.addEventListener('keydown', onKey)
		return () => {
			document.removeEventListener('click', onClick)
			document.removeEventListener('keydown', onKey)
		}
	}, [open])

	const exit = async () => {
		await signOut()
		navigate(ROUTES.signIn, { replace: true })
	}

	const avatar = (size = '') => (
		<span
			className={`avatar ${size}`}
			data-area=''
			style={areaStyle(person.areaName)}
			aria-hidden='true'>
			{initials(person.fullName)}
		</span>
	)

	return (
		<div ref={root} className='contents'>
			<button
				type='button'
				className='user-chip'
				aria-haspopup='true'
				aria-expanded={open}
				aria-controls='user-menu'
				onClick={() => setOpen(o => !o)}>
				{avatar()}
				<span className='user-chip__name'>{person.fullName.split(' ')[0]}</span>
				<Icon name='chevronDown' />
			</button>
			{open && (
				<div className='user-menu' id='user-menu'>
					<div className='user-menu__head'>
						{avatar('is-lg')}
						<div>
							<strong>{person.fullName}</strong>
							<span>
								No. {person.employeeNumber} · {ROLE_NAMES[session.role]}
							</span>
							<span>
								{person.areaName}
								{person.departmentName ? ` · ${person.departmentName}` : ''}
							</span>
						</div>
					</div>
					<button type='button' className='menu-item' onClick={exit}>
						<Icon name='logout' />
						Salir
					</button>
				</div>
			)}
		</div>
	)
}
