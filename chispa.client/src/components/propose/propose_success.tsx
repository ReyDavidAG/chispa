import { useEffect, useRef } from 'react'
import { Link } from 'react-router'

import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import type { ChallengeCard } from '@/types/challenge_type'

export function ProposeSuccess({
	folio,
	challenge,
}: {
	folio: string
	challenge: ChallengeCard
}) {
	const title = useRef<HTMLHeadingElement>(null)
	useEffect(() => title.current?.focus(), [])
	return (
		<section className='success'>
			<span className='success__mark' aria-hidden='true'>
				<Icon name='spark' />
				<span className='rays'>
					{Array.from({ length: 8 }, (_, i) => (
						<i key={i} />
					))}
				</span>
			</span>
			<p className='folio'>{folio}</p>
			<h1 ref={title} className='h1' tabIndex={-1}>
				Tu chispa ya está en el reto
			</h1>
			<p className='lede'>
				La ve el encargado de {challenge.departmentName ?? challenge.areaName}.
				Aquí verás cuando cambie de estado.
			</p>
			<ol className='next-steps animate-tile-in' style={{ '--i': 4 }}>
				<li>
					<strong>Recibida.</strong> Ya cualquiera puede leerla, avivarla y
					comentarla.
				</li>
				<li>
					<strong>En revisión.</strong> El área y el comité la califican con la
					rúbrica.
				</li>
				<li>
					<strong>Seleccionada.</strong> Si queda entre las finalistas, se
					presenta en la feria.
				</li>
			</ol>
			<div className='btn-row btn-row--center'>
				<Link className='btn btn--lg' to={ROUTES.idea(folio)}>
					Ver mi chispa
				</Link>
				<Link className='btn btn--ghost btn--lg' to={ROUTES.challenges}>
					Ver otros retos
				</Link>
			</div>
		</section>
	)
}
