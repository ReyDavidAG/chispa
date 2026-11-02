import { useMemo } from 'react'
import { Link } from 'react-router'

import { ChallengeTag } from '@/components/challenges/challenge_tag'
import { NewsBanners } from '@/components/home/news_banners'
import { StageCard } from '@/components/home/stage_card'
import { TopIdeas } from '@/components/home/top_ideas'
import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/use_session'
import {
	useChallenges,
	useChallengeSignals,
} from '@/hooks/challenges/use_challenges'
import { useFair } from '@/hooks/fair/use_fair'
import { plural } from '@/utils/plural'

export default function HomePage() {
	const { person } = useRequiredSession()
	const fair = useFair()
	const challenges = useChallenges()
	const signals = useChallengeSignals(challenges.data)

	const open = useMemo(
		() => (challenges.data ?? []).filter(c => c.status === 'open'),
		[challenges.data]
	)
	const needIdeas = useMemo(
		() => [...open].sort((a, b) => a.ideaCount - b.ideaCount).slice(0, 3),
		[open]
	)
	const ownArea = open.filter(c => c.areaId === person.areaId).length

	return (
		<div className='wrap'>
			<section className='home-head'>
				<div className='home-head__greet'>
					<p className='kicker'>Hola, {person.fullName.split(' ')[0]}</p>
					<h1 className='display display--home'>
						Hay{' '}
						<span className='hl'>
							{plural(open.length, 'reto abierto', 'retos abiertos')}
						</span>{' '}
						esperando tu idea.
					</h1>
					<p className='lede'>
						{ownArea > 0 &&
							`${plural(ownArea, 'es', 'son')} de ${person.areaName}, tu área. `}
						Nadie conoce mejor un problema que quien lo vive todos los días.
					</p>
					<div className='btn-row'>
						<Link className='btn btn--lg' to={ROUTES.challenges}>
							Explorar retos
						</Link>
						<Link className='btn btn--ghost btn--lg' to={ROUTES.propose}>
							<Icon name='plus' />
							Proponer chispa
						</Link>
					</div>
				</div>
				{fair.data && <StageCard fair={fair.data} />}
			</section>

			<NewsBanners fresh={signals.fresh} hot={signals.hot[0]} />

			<section className='section'>
				<div className='section__head'>
					<h2 className='h2'>Retos que necesitan ideas</h2>
					<Link className='link-quiet' to={`${ROUTES.challenges}?sort=fewest`}>
						Ver todos
						<Icon name='chevronRight' />
					</Link>
				</div>
				<div className='tag-grid'>
					{needIdeas.map((c, i) => (
						<ChallengeTag
							key={c.id}
							challenge={c}
							index={i}
							isNew={signals.isNew(c)}
							isHot={signals.isHot(c)}
						/>
					))}
				</div>
			</section>
			<TopIdeas />
		</div>
	)
}
