import { useState } from 'react'
import { Link, useParams } from 'react-router'

import { AuthorLine } from '@/components/ideas/author_line'
import { CommentsBlock } from '@/components/ideas/comments_block'
import { EvaluationPanel } from '@/components/ideas/evaluation_panel'
import { IdeaStatusPill } from '@/components/ideas/idea_status_pill'
import { IdeaTrack } from '@/components/ideas/idea_track'
import { RequirementSheet } from '@/components/ideas/requirement_sheet'
import { SupportButton } from '@/components/ideas/support_button'
import { Icon } from '@/components/ui/icon'
import { OrgLine } from '@/components/ui/org_line'
import { BenefitTag, SolutionTag } from '@/components/ui/tags'
import { ROUTES } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/use_session'
import { useChallenge, useChallenges } from '@/hooks/challenges/use_challenges'
import { useAuthors, useIdea } from '@/hooks/ideas/use_ideas'
import LoadingPage from '@/pages/core/loading/loading_page'
import NotFoundPage from '@/pages/core/not_found/not_found_page'
import { areaStyle } from '@/utils/area_hue'
import { cn } from '@/utils/cn'
import { shortDate } from '@/utils/dates'
import { canManage } from '@/utils/permissions'

export default function IdeaDetailPage() {
	const { folio = '' } = useParams()
	const session = useRequiredSession()
	const { data: idea, isLoading } = useIdea(folio)
	const list = useChallenges()
	const card = list.data?.find(c => c.id === idea?.challengeId)
	const challenge = useChallenge(card?.folio ?? '')
	const authors = useAuthors(idea?.authorId ? [idea.authorId] : [])
	const [showSheet, setShowSheet] = useState(false)

	if (isLoading || list.isLoading) return <LoadingPage />
	if (!idea || !card) return <NotFoundPage />

	const evaluator = canManage(session, card)
	const author = authors.data?.[0]

	return (
		<div className='wrap'>
			<Link className='back-link' to={ROUTES.challenge(card.folio)}>
				<Icon name='arrowLeft' />
				{card.folio} · {card.title}
			</Link>
			<div className={cn('idea-layout', evaluator && 'has-aside')}>
				<article className='idea'>
					<header className='idea__head'>
						<div className='idea-row__top'>
							<span className='folio'>{idea.folio}</span>
							<IdeaStatusPill status={idea.status} />
							<SolutionTag code={idea.solutionType} />
						</div>
						<h1 className='h1'>{idea.title}</h1>
						<p className='lede'>{idea.summary}</p>
						<div className='idea__byline'>
							<AuthorLine author={author} anonymous={idea.isAnonymous} />
							<span className='meta'>
								<Icon name='calendar' />
								{shortDate(idea.createdAt)}
							</span>
							{idea.wantsToJoin && (
								<span className='meta meta--ok'>
									<Icon name='users' />
									Quiere participar
								</span>
							)}
						</div>
						<div className='idea__support'>
							<SupportButton idea={idea} large />
							<p className='muted small'>
								Aviva si te gustaría que se hiciera. Ayuda al comité a ver qué
								importa más.
							</p>
						</div>
					</header>

					<IdeaTrack status={idea.status} />

					<div className='idea__body'>
						<section>
							<h2 className='reto__label'>Cómo funcionaría</h2>
							<p>{idea.how}</p>
						</section>
						{idea.needs.length > 0 && (
							<section>
								<h2 className='reto__label'>Se necesitaría</h2>
								<ul className='type-list' role='list'>
									{idea.needs.map(n => (
										<li key={n} className='type-tag'>
											{n}
										</li>
									))}
								</ul>
							</section>
						)}
						<section>
							<h2 className='reto__label'>Qué mejora</h2>
							<ul className='type-list' role='list'>
								{idea.benefits.map(b => (
									<li key={b}>
										<BenefitTag code={b} />
									</li>
								))}
							</ul>
							{idea.estimate && <p>{idea.estimate}</p>}
						</section>
					</div>

					<Link
						className='reto-link'
						to={ROUTES.challenge(card.folio)}
						data-area=''
						style={areaStyle(card.areaCode + card.companyCode)}>
						<span className='kicker'>Responde al reto</span>
						<span className='reto-link__row'>
							<span className='folio'>{card.folio}</span>
							<OrgLine unit={card} />
						</span>
						<strong>{card.title}</strong>
					</Link>

					{showSheet && challenge.data && (
						<RequirementSheet idea={idea} challenge={challenge.data} />
					)}
					<CommentsBlock ideaId={idea.id} />
				</article>
				{evaluator && (
					<aside className='idea-aside'>
						<EvaluationPanel
							idea={idea}
							onShowRequirement={() => setShowSheet(true)}
						/>
					</aside>
				)}
			</div>
		</div>
	)
}
