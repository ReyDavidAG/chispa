import { CHALLENGE_STATUS } from '@/constants/status'
import type { ChallengeStatus } from '@/types/challenge_type'

export function StatusPill({ status }: { status: ChallengeStatus }) {
	const s = CHALLENGE_STATUS[status]
	return (
		<span className={`pill tone-${s.tone}`}>
			<span className='pill-dot' aria-hidden='true' />
			{s.label}
		</span>
	)
}
