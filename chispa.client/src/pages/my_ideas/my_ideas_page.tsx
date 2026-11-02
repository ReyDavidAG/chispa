import {
	type CSSProperties,
	type KeyboardEvent,
	useMemo,
	useRef,
	useState,
} from 'react'
import { Link } from 'react-router'

import { IdeaRow } from '@/components/ideas/idea_row'
import { EmptyState } from '@/components/ui/empty_state'
import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { IDEA_STATUS, IDEA_STEPS } from '@/constants/status'
import { useChallenges } from '@/hooks/challenges/use_challenges'
import {
	useAuthors,
	useMyIdeas,
	useSupportedIdeas,
} from '@/hooks/ideas/use_ideas'
import { useIndicator } from '@/hooks/ui/use_indicator'
import type { IdeaCard } from '@/types/idea_type'
import { cn } from '@/utils/cn'
import { stagger } from '@/utils/stagger'

const TABS = [
	{ id: 'mine', label: 'Propuestas' },
	{ id: 'supported', label: 'Avivadas' },
] as const
type Tab = (typeof TABS)[number]['id']

export default function MyIdeasPage() {
	const mine = useMyIdeas()
	const supported = useSupportedIdeas()
	const challenges = useChallenges()
	const [tab, setTab] = useState<Tab>('mine')
	const [dir, setDir] = useState(1)
	const strip = useRef<HTMLDivElement>(null)
	useIndicator(strip, '[aria-selected="true"]', 'my-ideas', tab)

	const list = useMemo(
		() => (tab === 'mine' ? mine.data : supported.data) ?? [],
		[tab, mine.data, supported.data]
	)
	const authorIds = useMemo(
		() => [
			...new Set(list.map(i => i.authorId).filter((x): x is string => !!x)),
		],
		[list]
	)
	const authors = useAuthors(authorIds)
	const authorById = useMemo(
		() => new Map((authors.data ?? []).map(a => [a.id, a])),
		[authors.data]
	)
	const challengeById = useMemo(
		() => new Map((challenges.data ?? []).map(c => [c.id, c])),
		[challenges.data]
	)

	const select = (next: Tab) => {
		if (next === tab) return
		setDir(
			TABS.findIndex(t => t.id === next) > TABS.findIndex(t => t.id === tab)
				? 1
				: -1
		)
		setTab(next)
	}
	const onKey = (e: KeyboardEvent) => {
		if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
		const next = tab === 'mine' ? 'supported' : 'mine'
		select(next)
		strip.current?.querySelector<HTMLButtonElement>(`#tab-${next}`)?.focus()
	}

	const row = (idea: IdeaCard, i: number) => {
		const c = challengeById.get(idea.challengeId)
		const rowEl = (
			<IdeaRow
				idea={idea}
				author={idea.authorId ? authorById.get(idea.authorId) : undefined}
				index={i}
				challenge={c && { folio: c.folio, title: c.title }}
			/>
		)
		if (tab !== 'mine') return <div key={idea.id}>{rowEl}</div>
		const step = IDEA_STATUS[idea.status].step
		return (
			<div
				key={idea.id}
				className='mine-item animate-tile-in'
				style={stagger(i)}>
				{rowEl}
				<div
					className='mini-track'
					aria-label={`Avance: ${IDEA_STATUS[idea.status].label}`}>
					{IDEA_STEPS.map((name, s) => (
						<span
							key={name}
							className={cn('mini-track__seg', s <= step && 'is-on')}
							title={name}
						/>
					))}
					<span className='mini-track__label'>
						{IDEA_STATUS[idea.status].label}
					</span>
				</div>
			</div>
		)
	}

	return (
		<div className='wrap narrow-wide'>
			<header className='page-head'>
				<div>
					<h1 className='h1'>Mis chispas</h1>
					<p className='lede'>
						Lo que propusiste y lo que avivaste, con su avance.
					</p>
				</div>
			</header>
			<div
				ref={strip}
				className='tabs'
				role='tablist'
				aria-label='Mis chispas'
				onKeyDown={onKey}>
				{TABS.map(t => (
					<button
						key={t.id}
						id={`tab-${t.id}`}
						type='button'
						role='tab'
						aria-controls='my-ideas-panel'
						aria-selected={tab === t.id}
						tabIndex={tab === t.id ? 0 : -1}
						onClick={() => select(t.id)}>
						{t.label}
						<span className='tabs__count num'>
							{(t.id === 'mine' ? mine.data : supported.data)?.length ?? 0}
						</span>
					</button>
				))}
			</div>
			<section
				key={tab}
				id='my-ideas-panel'
				role='tabpanel'
				aria-labelledby={`tab-${tab}`}
				className='tab-panel animate-panel-in'
				style={{ '--dir': dir } as CSSProperties}>
				{list.length ? (
					<div className='idea-list'>{list.map(row)}</div>
				) : tab === 'mine' ? (
					<EmptyState
						title='Aún no propones ninguna chispa'
						body='Cuando mandes una, aquí verás en qué va: si ya la revisaron, si quedó para la feria o si ya se está haciendo.'
						action={
							<Link className='btn btn--spark' to={ROUTES.propose}>
								<Icon name='plus' />
								Proponer mi primera chispa
							</Link>
						}
					/>
				) : (
					<EmptyState
						title='No has avivado ninguna'
						body='Avivar es la forma de decir “esto sí hace falta”. Busca en los retos las ideas que te gustaría ver hechas.'
						action={
							<Link className='btn btn--ghost' to={ROUTES.challenges}>
								Explorar retos
							</Link>
						}
					/>
				)}
			</section>
		</div>
	)
}
