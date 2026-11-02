import { memo } from 'react'
import { Link } from 'react-router'

import { HotFlag, NewFlag } from '@/components/ui/flag'
import { Icon } from '@/components/ui/icon'
import { OrgLine } from '@/components/ui/org_line'
import { StatusPill } from '@/components/ui/status_pill'
import { SolutionIcons } from '@/components/ui/tags'
import { ROUTES } from '@/constants/routes'
import type { ChallengeCard } from '@/types/challenge_type'
import { areaStyle } from '@/utils/area_hue'
import { cn } from '@/utils/cn'
import { closesLabel } from '@/utils/dates'
import { plural } from '@/utils/plural'
import { stagger } from '@/utils/stagger'

interface Props {
	challenge: ChallengeCard
	index?: number
	isNew?: boolean
	isHot?: boolean
	preview?: boolean
}

export const ChallengeTag = memo(function ChallengeTag({
	challenge: c,
	index = 0,
	isNew,
	isHot,
	preview = false,
}: Props) {
	const label = `${c.title}${isNew ? ', nuevo' : ''}${isHot ? ', en tendencia' : ''}`
	return (
		<article
			className={cn(
				'tag-card',
				!preview && 'animate-tile-in',
				isNew && 'is-new'
			)}
			data-area=''
			style={{ ...areaStyle(c.areaCode + c.companyCode), ...stagger(index) }}>
			{!preview && (
				<Link
					className='tag-card__link'
					to={ROUTES.challenge(c.folio)}
					aria-label={label}
				/>
			)}
			<header className='tag-card__head'>
				<span className='tag-hole' aria-hidden='true' />
				<span className='folio'>{c.folio}</span>
				<span className='tag-card__flags'>
					{isNew && <NewFlag />}
					{isHot && <HotFlag />}
					<StatusPill status={c.status} />
				</span>
			</header>
			<div className='tag-card__body'>
				<OrgLine unit={c} />
				<h3 className='tag-card__title'>{c.title}</h3>
				<p className='tag-card__summary'>{c.summary}</p>
			</div>
			<footer className='tag-card__foot'>
				<SolutionIcons codes={c.solutionTypes} />
				<span className='meta'>
					<Icon name='spark' className='is-spark' />
					{plural(c.ideaCount, 'chispa', 'chispas')}
				</span>
				<span className='meta'>
					<Icon name='flame' />
					{c.supportCount}
				</span>
				<span className='meta meta--push'>
					<Icon name='clock' />
					{closesLabel(c.closesOn)}
				</span>
			</footer>
		</article>
	)
})
