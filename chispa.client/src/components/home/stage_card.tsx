import type { CSSProperties } from 'react'
import { Link } from 'react-router'

import { CountUp } from '@/components/ui/count_up'
import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { currentStageIndex } from '@/hooks/fair/use_fair'
import type { Fair } from '@/types/fair_type'
import { cn } from '@/utils/cn'
import { daysUntil, shortDate } from '@/utils/dates'

export function StageCard({ fair }: { fair: Fair }) {
	const current = currentStageIndex(fair)
	const stage = fair.stages[current]
	const days = Math.max(0, daysUntil(stage.endsOn))

	return (
		<section className='stage-card' aria-labelledby='stage-title'>
			<div className='stage-card__top'>
				<p className='kicker'>La feria va en</p>
				<Link className='link-quiet' to={ROUTES.howItWorks}>
					Cómo funciona
					<Icon name='chevronRight' />
				</Link>
			</div>
			<h2 className='stage-card__title' id='stage-title'>
				{stage.name}
				<span>{stage.detail}</span>
			</h2>
			<p className='stage-card__count'>
				<span className='num'>
					<CountUp to={days} delay={300} />
				</span>{' '}
				{days === 1 ? 'día' : 'días'} para cerrar · {shortDate(stage.endsOn)}
			</p>
			<ol className='stages'>
				{fair.stages.map((s, i) => (
					<li
						key={s.code}
						className={cn(
							'stage',
							i < current && 'is-done',
							i === current && 'is-current'
						)}
						aria-current={i === current ? 'step' : undefined}
						style={{ '--i': i } as CSSProperties}>
						<span className='stage__mark' aria-hidden='true'>
							{i < current && <Icon name='check' />}
							{i === current && <Icon name='spark' />}
						</span>
						<span className='stage__name'>{s.name}</span>
					</li>
				))}
			</ol>
			<p className='stage-card__note'>
				Fechas de ejemplo, por confirmar con el comité.
			</p>
		</section>
	)
}
