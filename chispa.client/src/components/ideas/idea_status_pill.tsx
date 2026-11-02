import { IDEA_STATUS } from '@/constants/status'
import type { IdeaStatus } from '@/types/idea_type'

export function IdeaStatusPill({ status }: { status: IdeaStatus }) {
	const s = IDEA_STATUS[status]
	return (
		<span className={`pill tone-${s.tone}`}>
			<span className='pill-dot' aria-hidden='true' />
			{s.label}
		</span>
	)
}
