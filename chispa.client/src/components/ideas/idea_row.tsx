import { memo } from 'react'
import { Link } from 'react-router'

import { HotFlag } from '@/components/ui/flag'
import { Icon } from '@/components/ui/icon'
import { SolutionTag } from '@/components/ui/tags'
import { ROUTES } from '@/constants/routes'
import type { Author, IdeaCard } from '@/types/idea_type'
import { stagger } from '@/utils/stagger'

import { AuthorLine } from './author_line'
import { IdeaStatusPill } from './idea_status_pill'
import { SupportButton } from './support_button'

interface Props {
	idea: IdeaCard
	author?: Author
	index?: number
	hot?: boolean
	challenge?: { folio: string; title: string }
}

export const IdeaRow = memo(function IdeaRow({
	idea,
	author,
	index = 0,
	hot,
	challenge,
}: Props) {
	return (
		<article className='idea-row animate-row-in' style={stagger(index)}>
			<div className='idea-row__main'>
				<div className='idea-row__top'>
					<span className='folio'>{idea.folio}</span>
					{hot && <HotFlag />}
					<IdeaStatusPill status={idea.status} />
					<SolutionTag code={idea.solutionType} />
				</div>
				<h3 className='idea-row__title'>
					<Link to={ROUTES.idea(idea.folio)}>{idea.title}</Link>
				</h3>
				<p className='idea-row__summary'>{idea.summary}</p>
				<div className='idea-row__meta'>
					<AuthorLine author={author} anonymous={idea.isAnonymous} />
					<span className='meta'>
						<Icon name='message' />
						{idea.commentCount}
					</span>
					{challenge && (
						<span className='meta meta--reto'>
							Reto:{' '}
							<Link to={ROUTES.challenge(challenge.folio)}>
								{challenge.title}
							</Link>
						</span>
					)}
				</div>
			</div>
			<SupportButton idea={idea} />
		</article>
	)
})
