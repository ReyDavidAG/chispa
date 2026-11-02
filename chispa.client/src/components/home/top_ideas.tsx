import { useMemo } from 'react'

import { IdeaRow } from '@/components/ideas/idea_row'
import { useChallenges } from '@/hooks/challenges/use_challenges'
import { useAllIdeas, useAuthors } from '@/hooks/ideas/use_ideas'

export function TopIdeas() {
	const ideas = useAllIdeas()
	const challenges = useChallenges()
	const top = useMemo(
		() => (ideas.data ?? []).filter(i => i.status !== 'archived').slice(0, 4),
		[ideas.data]
	)
	const ids = useMemo(
		() => [
			...new Set(top.map(i => i.authorId).filter((x): x is string => !!x)),
		],
		[top]
	)
	const authors = useAuthors(ids)
	const authorById = useMemo(
		() => new Map((authors.data ?? []).map(a => [a.id, a])),
		[authors.data]
	)
	const challengeById = useMemo(
		() => new Map((challenges.data ?? []).map(c => [c.id, c])),
		[challenges.data]
	)

	if (!top.length) return null
	return (
		<section className='section'>
			<div className='section__head'>
				<h2 className='h2'>Lo más avivado</h2>
			</div>
			<div className='idea-list'>
				{top.map((idea, i) => {
					const c = challengeById.get(idea.challengeId)
					return (
						<IdeaRow
							key={idea.id}
							idea={idea}
							index={i}
							hot={i === 0}
							author={idea.authorId ? authorById.get(idea.authorId) : undefined}
							challenge={c && { folio: c.folio, title: c.title }}
						/>
					)
				})}
			</div>
		</section>
	)
}
