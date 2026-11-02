import { Link } from 'react-router'

import { Icon } from '@/components/ui/icon'
import { SolutionTag } from '@/components/ui/tags'
import { ROUTES } from '@/constants/routes'
import type { ChallengeCard } from '@/types/challenge_type'

export function ChallengeCtaCard({
	challenge: c,
}: {
	challenge: ChallengeCard
}) {
	return (
		<aside className='reto__aside'>
			<div className='cta-card'>
				<dl className='stat-row stat-row--tight'>
					<div>
						<dt>Chispas</dt>
						<dd className='num'>{c.ideaCount}</dd>
					</div>
					<div>
						<dt>Avivadas</dt>
						<dd className='num'>{c.supportCount}</dd>
					</div>
				</dl>
				{c.status === 'open' ? (
					<>
						<Link
							className='btn btn--spark btn--block btn--lg'
							to={`${ROUTES.propose}?challenge=${c.folio}`}>
							<Icon name='plus' />
							Proponer mi chispa
						</Link>
						<p className='cta-card__hint'>
							Toma unos 3 minutos. Puedes mandarla anónima.
						</p>
					</>
				) : (
					<p className='cta-card__closed'>
						<Icon name='info' />
						Este reto ya no recibe chispas. Puedes leer y avivar las que hay.
					</p>
				)}
				<div className='cta-card__types'>
					<p className='kicker'>Soluciones que se esperan</p>
					<ul className='type-list' role='list'>
						{c.solutionTypes.map(t => (
							<li key={t}>
								<SolutionTag code={t} />
							</li>
						))}
					</ul>
					<p className='cta-card__hint'>
						No es obligatorio: cualquier buena idea cuenta.
					</p>
				</div>
			</div>
		</aside>
	)
}
