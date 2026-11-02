import { useEffect, useRef } from 'react'

import { ROLE_NAMES } from '@/constants/status'
import type { Session } from '@/types/session_type'
import { areaStyle } from '@/utils/area_hue'
import { initials } from '@/utils/initials'

interface Props {
	session: Session
	onConfirm: () => void
	onBack: () => void
}

export function ConfirmStep({ session, onConfirm, onBack }: Props) {
	const { person } = session
	const confirmRef = useRef<HTMLButtonElement>(null)
	useEffect(() => confirmRef.current?.focus(), [])

	return (
		<div className='signin-form animate-panel-in' style={{ '--dir': 1 }}>
			<h2 className='h3'>¿Eres tú?</h2>
			<div className='profile-card'>
				<span
					className='avatar is-xl'
					data-area=''
					style={areaStyle(person.areaName)}
					aria-hidden='true'>
					{initials(person.fullName)}
				</span>
				<div>
					<strong>{person.fullName}</strong>
					<span className='muted'>
						No. {person.employeeNumber} · {ROLE_NAMES[session.role]}
					</span>
					<span className='org-line'>
						<span
							className='area-chip'
							data-area=''
							style={areaStyle(person.areaName)}>
							<span className='area-dot' aria-hidden='true' />
							{person.areaName}
						</span>
						<span className='org-line__dept'>
							{person.departmentName ?? 'Toda el área'} · {person.companyCode}
						</span>
					</span>
				</div>
			</div>
			<button
				ref={confirmRef}
				className='btn btn--spark btn--block btn--lg'
				type='button'
				onClick={onConfirm}>
				Sí, entrar
			</button>
			<button
				className='btn btn--ghost btn--block'
				type='button'
				onClick={onBack}>
				No soy yo
			</button>
		</div>
	)
}
