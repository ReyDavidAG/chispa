import { Link, useParams } from 'react-router'

import { ChallengeIdeas } from '@/components/challenges/challenge_ideas'
import { HotFlag, NewFlag } from '@/components/ui/flag'
import { Icon } from '@/components/ui/icon'
import { OrgLine } from '@/components/ui/org_line'
import { StatusPill } from '@/components/ui/status_pill'
import { SolutionTag } from '@/components/ui/tags'
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

	const canPropose = c.status === 'open'

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
						{canPropose ? (
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
								Este reto ya no recibe chispas. Puedes leer y avivar las que
								hay.
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
