import { Link } from 'react-router'

import { Icon } from '@/components/ui/icon'
import { OrgLine } from '@/components/ui/org_line'
import { ROUTES } from '@/constants/routes'
import { useChallenge } from '@/hooks/challenges/use_challenges'
import type { ChallengeCard } from '@/types/challenge_type'
import { areaStyle } from '@/utils/area_hue'

export function ContextCard({
	challenge,
}: {
	challenge: ChallengeCard | undefined
}) {
	const detail = useChallenge(challenge?.folio ?? '')
	if (!challenge)
		return (
			<div className='context-card is-empty'>
				<p className='muted'>
					Elige el reto para ver aquí su contexto mientras escribes.
				</p>
			</div>
		)
	return (
		<div
			className='context-card'
			data-area=''
			style={areaStyle(challenge.areaCode + challenge.companyCode)}>
			<p className='kicker'>Estás respondiendo a</p>
			<div className='context-card__tag'>
				<span className='folio'>{challenge.folio}</span>
				<OrgLine unit={challenge} />
			</div>
			<h2 className='h4'>{challenge.title}</h2>
			<p className='muted'>{challenge.summary}</p>
			{detail.data && (
				<div className='context-card__goal'>
					<p className='kicker'>Se resuelve cuando</p>
					<p>{detail.data.success}</p>
				</div>
			)}
			<Link
				className='link-quiet'
				to={ROUTES.challenge(challenge.folio)}
				target='_blank'
				rel='noopener'>
				Ver el reto completo
				<Icon name='chevronRight' />
			</Link>
		</div>
	)
}
