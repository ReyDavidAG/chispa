import { Link, useParams } from 'react-router'

import { ChallengeCtaCard } from '@/components/challenges/challenge_cta_card'
import { ChallengeIdeas } from '@/components/challenges/challenge_ideas'
import { HotFlag, NewFlag } from '@/components/ui/flag'
import { Icon } from '@/components/ui/icon'
import { OrgLine } from '@/components/ui/org_line'
import { StatusPill } from '@/components/ui/status_pill'
import { ROUTES } from '@/constants/routes'
import {
	trendReason,
	useChallenge,
	useChallenges,
	useChallengeSignals,
} from '@/hooks/challenges/use_challenges'
import LoadingPage from '@/pages/core/loading/loading_page'
import NotFoundPage from '@/pages/core/not_found/not_found_page'
import { areaStyle } from '@/utils/area_hue'
import { cn } from '@/utils/cn'
import { closesLabel, shortDate } from '@/utils/dates'

const BLOCKS = [
	['problem', 'El problema'],
	['affects', 'A quién afecta'],
	['frequency', 'Qué tan seguido pasa'],
	['tried', 'Qué ya se intentó'],
	['success', 'Cómo sabremos que se resolvió'],
	['constraints', 'Hay que tomar en cuenta'],
] as const

export default function ChallengeDetailPage() {
	const { folio = '' } = useParams()
	const { data: c, isLoading } = useChallenge(folio)
	const list = useChallenges()
	const signals = useChallengeSignals(list.data)

	if (isLoading) return <LoadingPage />
	if (!c) return <NotFoundPage />

	return (
		<div className='wrap'>
			<Link className='back-link' to={ROUTES.challenges}>
				<Icon name='arrowLeft' />
				Retos
			</Link>
			<article
				className='reto'
				data-area=''
				style={areaStyle(c.areaCode + c.companyCode)}>
				<header className='reto__head'>
					<div className='reto__tagline'>
						<span className='tag-hole' aria-hidden='true' />
						<span className='folio'>{c.folio}</span>
						<StatusPill status={c.status} />
						{signals.isNew(c) && <NewFlag />}
						{signals.isHot(c) && (
							<HotFlag label={`En tendencia · ${trendReason(c).label}`} />
						)}
						<OrgLine unit={c} showCompany />
					</div>
					<h1 className='h1 reto__title'>{c.title}</h1>
					<p className='lede'>{c.summary}</p>
					<div className='reto__meta'>
						<span className='author'>
							<span>
								<strong>{c.ownerName}</strong> · encargado del reto
							</span>
						</span>
						{c.publishedAt && (
							<span className='meta'>
								<Icon name='calendar' />
								Publicado el {shortDate(c.publishedAt)}
							</span>
						)}
						<span className='meta'>
							<Icon name='clock' />
							{closesLabel(c.closesOn)}
						</span>
					</div>
				</header>

				<ChallengeCtaCard challenge={c} />

				<div className='reto__body'>
					{BLOCKS.filter(([k]) => c[k]).map(([k, label]) => (
						<section
							key={k}
							className={cn('reto__block', k === 'success' && 'is-goal')}>
							<h2 className='reto__label'>{label}</h2>
							<p>{c[k]}</p>
						</section>
					))}
				</div>
			</article>
			<ChallengeIdeas challengeId={c.id} />
		</div>
	)
}
