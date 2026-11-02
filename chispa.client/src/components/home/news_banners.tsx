import { Link } from 'react-router'

import { Icon } from '@/components/ui/icon'
import { OrgLine } from '@/components/ui/org_line'
import { ROUTES } from '@/constants/routes'
import { trendReason } from '@/hooks/challenges/use_challenges'
import type { ChallengeCard } from '@/types/challenge_type'
import { areaStyle } from '@/utils/area_hue'
import { plural } from '@/utils/plural'
import { stagger } from '@/utils/stagger'

export function NewsBanners({
	fresh,
	hot,
}: {
	fresh: ChallengeCard[]
	hot: ChallengeCard | undefined
}) {
	if (!fresh.length && !hot) return null
	const newest = fresh[0]
	return (
		<section className='news-row' aria-label='Novedades'>
			{newest && (
				<Link
					className='news news--new animate-tile-in'
					style={{
						...stagger(0),
						...areaStyle(newest.areaCode + newest.companyCode),
					}}
					data-area=''
					to={`${ROUTES.challenges}?sort=new`}>
					<span className='news__icon' aria-hidden='true'>
						<Icon name='spark' />
					</span>
					<span className='news__body'>
						<span className='news__kicker'>
							{fresh.length === 1
								? 'Reto nuevo'
								: `${fresh.length} retos nuevos`}{' '}
							desde tu última visita
						</span>
						<strong className='news__title'>{newest.title}</strong>
						<span className='news__meta'>
							<OrgLine unit={newest} />
							{fresh.length > 1 && <span>y {fresh.length - 1} más</span>}
						</span>
					</span>
					<span className='news__go' aria-hidden='true'>
						<Icon name='arrowRight' />
					</span>
				</Link>
			)}
			{hot && (
				<Link
					className='news news--hot animate-tile-in'
					style={{
						...stagger(1),
						...areaStyle(hot.areaCode + hot.companyCode),
					}}
					data-area=''
					to={ROUTES.challenge(hot.folio)}>
					<span className='news__icon' aria-hidden='true'>
						<Icon name='flame' />
					</span>
					<span className='news__body'>
						<span className='news__kicker'>
							En tendencia · {trendReason(hot).label}
						</span>
						<strong className='news__title'>{hot.title}</strong>
						<span className='news__meta'>
							<OrgLine unit={hot} />
							<span>
								{plural(hot.supportCount, 'avivada', 'avivadas')} ·{' '}
								{plural(hot.ideaCount, 'chispa', 'chispas')}
							</span>
						</span>
					</span>
					<span className='news__go' aria-hidden='true'>
						<Icon name='arrowRight' />
					</span>
				</Link>
			)}
		</section>
	)
}
