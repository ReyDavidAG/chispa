import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { AuthorLine } from '@/components/ideas/author_line'
import { IdeaStatusPill } from '@/components/ideas/idea_status_pill'
import { Icon } from '@/components/ui/icon'
import { OrgLine } from '@/components/ui/org_line'
import { StatusPill } from '@/components/ui/status_pill'
import { SolutionTag } from '@/components/ui/tags'
import { ROUTES } from '@/constants/routes'
import type { ChallengeCard } from '@/types/challenge_type'
import type { Author, IdeaCard, IdeaScore } from '@/types/idea_type'
import { closesLabel } from '@/utils/dates'
import { stagger } from '@/utils/stagger'

export function IdeaQueueRow({
	idea,
	author,
	score,
	challenge,
	index,
}: {
	idea: IdeaCard
	author?: Author
	score?: IdeaScore
	challenge?: ChallengeCard
	index: number
}) {
	return (
		<li className='animate-row-in' style={stagger(index)}>
			<Link className='queue-row' to={ROUTES.idea(idea.folio)}>
				<span className='queue-row__main'>
					<span className='idea-row__top'>
						<span className='folio'>{idea.folio}</span>
						<IdeaStatusPill status={idea.status} />
						<SolutionTag code={idea.solutionType} />
					</span>
					<strong>{idea.title}</strong>
					<span className='queue-row__meta'>
						<AuthorLine author={author} anonymous={idea.isAnonymous} />
						{challenge && (
							<span className='muted small'>
								{challenge.folio} ·{' '}
								{challenge.departmentName ?? challenge.areaName}
							</span>
						)}
					</span>
				</span>
				<span className='queue-row__score'>
					{score ? (
						<>
							<span className='num'>{score.weightedScore.toFixed(1)}</span>
							<span className='muted small'>
								{score.evaluatorCount === 1
									? '1 evaluación'
									: `${score.evaluatorCount} evaluaciones`}
							</span>
						</>
					) : (
						<span className='muted small'>Sin calificar</span>
					)}
				</span>
				<span className='queue-row__heat'>
					<Icon name='flame' />
					<span className='num'>{idea.supportCount}</span>
				</span>
			</Link>
		</li>
	)
}

export function ChallengeQueueRow({
	c,
	index,
	actions,
}: {
	c: ChallengeCard
	index: number
	actions?: ReactNode
}) {
	return (
		<li className='animate-row-in' style={stagger(index)}>
			<div className='queue-row'>
				<span className='queue-row__main'>
					<span className='idea-row__top'>
						<span className='folio'>{c.folio}</span>
						<StatusPill status={c.status} />
						<OrgLine unit={c} showCompany />
					</span>
					<Link className='queue-row__title' to={ROUTES.challenge(c.folio)}>
						{c.title}
					</Link>
					<span className='muted small'>{closesLabel(c.closesOn)}</span>
				</span>
				{actions ?? (
					<span className='queue-row__score'>
						<span className='num'>{c.ideaCount}</span>
						<span className='muted small'>
							{c.ideaCount === 1 ? 'chispa' : 'chispas'}
						</span>
					</span>
				)}
			</div>
		</li>
	)
}
