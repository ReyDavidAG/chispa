import type { CSSProperties } from 'react'

import { Icon } from '@/components/ui/icon'
import { IDEA_STATUS, IDEA_STEPS } from '@/constants/status'
import type { IdeaStatus } from '@/types/idea_type'
import { cn } from '@/utils/cn'

export function IdeaTrack({ status }: { status: IdeaStatus }) {
	const current = IDEA_STATUS[status].step
	if (current < 0)
		return (
			<p className='track-archived'>
				<Icon name='info' />
				Esta chispa se archivó. Sigue visible para consulta.
			</p>
		)
	return (
		<ol className='track' aria-label='Avance'>
			{IDEA_STEPS.map((name, i) => (
				<li
					key={name}
					className={cn(
						i < current && 'is-done',
						i === current && 'is-current'
					)}
					aria-current={i === current ? 'step' : undefined}
					style={{ '--i': i } as CSSProperties}>
					<span className='track__dot' aria-hidden='true'>
						{i < current && <Icon name='check' />}
					</span>
					<span>{name}</span>
				</li>
			))}
		</ol>
	)
}
