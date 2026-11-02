import { useMemo, useRef, useState } from 'react'

import { IdeaRow } from '@/components/ideas/idea_row'
import { EmptyState } from '@/components/ui/empty_state'
import { useAuthors, useChallengeIdeas } from '@/hooks/ideas/use_ideas'
import { useIndicator } from '@/hooks/ui/use_indicator'
import { plural } from '@/utils/plural'

const SORTS = [
	['supports', 'Más avivadas'],
	['recent', 'Recientes'],
] as const

export function ChallengeIdeas({ challengeId }: { challengeId: string }) {
	const { data = [], isLoading } = useChallengeIdeas(challengeId)
	const [sort, setSort] = useState<'supports' | 'recent'>('supports')
	const segmented = useRef<HTMLDivElement>(null)
	useIndicator(
		segmented,
		'.segmented__item:has(input:checked)',
		`idea-sort-${challengeId}`,
		sort
	)
	const ids = useMemo(
		() => [
			...new Set(data.map(i => i.authorId).filter((x): x is string => !!x)),
		],
		[data]
	)
	const authors = useAuthors(ids)
	const byId = useMemo(
		() => new Map((authors.data ?? []).map(a => [a.id, a])),
		[authors.data]
	)
	const sorted = useMemo(
		() =>
			[...data].sort((a, b) =>
				sort === 'recent'
					? b.createdAt.localeCompare(a.createdAt)
					: b.supportCount - a.supportCount
			),
		[data, sort]
	)
	const hottest =
		sorted.length > 1 && sort === 'supports' && sorted[0].supportCount >= 15
			? sorted[0].id
			: null

	return (
		<section className='section' aria-labelledby='ideas-title'>
			<div className='section__head'>
				<h2 className='h2' id='ideas-title'>
					{plural(data.length, 'chispa', 'chispas')} para este reto
				</h2>
				{data.length > 1 && (
					<div
						ref={segmented}
						className='segmented segmented--sm has-indicator'
						role='radiogroup'
						aria-label='Ordenar chispas'>
						{SORTS.map(([id, label]) => (
							<label key={id} className='segmented__item'>
								<input
									type='radio'
									name='idea-sort'
									value={id}
									checked={sort === id}
									onChange={() => setSort(id)}
								/>
								<span>{label}</span>
							</label>
						))}
					</div>
				)}
			</div>
			{!isLoading && data.length === 0 ? (
				<EmptyState
					title='Todavía nadie propone nada'
					body='Sé la primera chispa de este reto. Una idea a medias también ayuda: alguien más la puede completar.'
				/>
			) : (
				<div className='idea-list'>
					{sorted.map((idea, i) => (
						<IdeaRow
							key={idea.id}
							idea={idea}
							index={i}
							hot={idea.id === hottest}
							author={idea.authorId ? byId.get(idea.authorId) : undefined}
						/>
					))}
				</div>
			)}
		</section>
	)
}
