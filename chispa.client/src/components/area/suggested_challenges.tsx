import { toast } from 'sonner'

import { useSetChallengeStatus } from '@/hooks/challenges/use_challenge_admin'
import type { ChallengeCard } from '@/types/challenge_type'

import { ChallengeQueueRow } from './queue_rows'

export function SuggestedChallenges({
	challenges,
}: {
	challenges: ChallengeCard[]
}) {
	const setStatus = useSetChallengeStatus()
	if (!challenges.length) return null

	const decide = (id: string, status: 'open' | 'archived') =>
		setStatus.mutate(
			{ id, status },
			{
				onSuccess: () =>
					toast.success(
						status === 'open' ? 'Reto publicado' : 'Sugerencia archivada'
					),
				onError: e =>
					toast.error(e instanceof Error ? e.message : 'No se pudo actualizar'),
			}
		)

	return (
		<section className='section'>
			<div className='section__head'>
				<h2 className='h3'>
					Retos sugeridos por colaboradores · {challenges.length}
				</h2>
			</div>
			<ul className='queue' role='list'>
				{challenges.map((c, i) => (
					<ChallengeQueueRow
						key={c.id}
						c={c}
						index={i}
						actions={
							<span className='queue-row__actions'>
								<button
									type='button'
									className='btn btn--sm btn--spark'
									disabled={setStatus.isPending}
									onClick={() => decide(c.id, 'open')}>
									Publicar
								</button>
								<button
									type='button'
									className='btn btn--sm btn--ghost'
									disabled={setStatus.isPending}
									onClick={() => decide(c.id, 'archived')}>
									Archivar
								</button>
							</span>
						}
					/>
				))}
			</ul>
		</section>
	)
}
