import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'

import { ChallengeFilters } from '@/components/challenges/challenge_filters'
import { ChallengeTag } from '@/components/challenges/challenge_tag'
import { EmptyState } from '@/components/ui/empty_state'
import { Icon } from '@/components/ui/icon'
import { DEFAULT_FILTERS, type Filters } from '@/constants/challenge_filters'
import { QUERY_KEYS } from '@/constants/query_keys'
import { ROUTES } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/use_session'
import {
	useChallenges,
	useChallengeSignals,
} from '@/hooks/challenges/use_challenges'
import { services } from '@/services/api/unit_of_services'
import type { ChallengeCard } from '@/types/challenge_type'
import type { Session } from '@/types/session_type'
import { filterChallenges } from '@/utils/filter_challenges'
import { plural } from '@/utils/plural'

export default function ChallengesPage() {
	const session = useRequiredSession()
	const client = useQueryClient()
	const [params, setParams] = useSearchParams()
	const { data, isLoading } = useChallenges()
	const signals = useChallengeSignals(data)
	const [seenAtArrival] = useState(session.person.challengesSeenAt)

	const filters: Filters = useMemo(
		() => ({
			...DEFAULT_FILTERS,
			...Object.fromEntries([...params].filter(([k]) => k in DEFAULT_FILTERS)),
		}),
		[params]
	)

	const isNew = useCallback(
		(c: ChallengeCard) =>
			c.status !== 'suggested' &&
			!!c.publishedAt &&
			c.publishedAt > seenAtArrival,
		[seenAtArrival]
	)
	const freshCount = useMemo(
		() => (data ?? []).filter(isNew).length,
		[data, isNew]
	)
	const hasUnseen = signals.fresh.length > 0

	useEffect(() => {
		if (!hasUnseen) return
		const t = setTimeout(async () => {
			await services.session.markChallengesSeen(session.person.id)
			client.setQueryData<Session | null>(QUERY_KEYS.session, s =>
				s
					? {
							...s,
							person: {
								...s.person,
								challengesSeenAt: new Date().toISOString(),
							},
						}
					: s
			)
		}, 900)
		return () => clearTimeout(t)
	}, [hasUnseen, session.person.id, client])

	const onChange = useCallback(
		(next: Partial<Filters>) => {
			const merged = { ...filters, ...next }
			const sp = new URLSearchParams()
			for (const [k, v] of Object.entries(merged))
				if (v && v !== DEFAULT_FILTERS[k as keyof Filters]) sp.set(k, v)
			setParams(sp, { replace: true })
		},
		[filters, setParams]
	)

	const areas = useMemo(() => {
		const map = new Map<string, { label: string; description: string }>()
		for (const c of data ?? [])
			map.set(c.areaId, { label: c.areaName, description: c.companyName })
		return [...map]
			.map(([id, v]) => ({ id, ...v }))
			.sort((a, b) => a.label.localeCompare(b.label))
	}, [data])

	const rows = useMemo(
		() =>
			filterChallenges(data ?? [], filters, { isNew, score: signals.score }),
		[data, filters, isNew, signals.score]
	)
	const active =
		filters.q || filters.area || filters.type || filters.status !== 'open'

	return (
		<div className='wrap'>
			<header className='page-head'>
				<div>
					<h1 className='h1'>Retos</h1>
					<p className='lede'>
						Problemas reales que las áreas quieren resolver. Entra a uno, lee el
						contexto y propón tu chispa.
					</p>
				</div>
				<Link className='btn btn--ghost' to={ROUTES.challengeNew}>
					<Icon name='plus' />
					Sugerir un reto
				</Link>
			</header>

			{freshCount > 0 && filters.sort !== 'new' && (
				<div className='fresh-banner animate-tile-in' role='status'>
					<span className='fresh-banner__icon' aria-hidden='true'>
						<Icon name='spark' />
					</span>
					<p>
						<strong>
							{freshCount === 1
								? 'Hay 1 reto nuevo'
								: `Hay ${freshCount} retos nuevos`}
						</strong>{' '}
						desde tu última visita
					</p>
					<button
						type='button'
						className='btn btn--sm'
						onClick={() => onChange({ ...DEFAULT_FILTERS, sort: 'new' })}>
						Verlos primero
					</button>
				</div>
			)}

			<ChallengeFilters value={filters} areas={areas} onChange={onChange} />

			<section className='results'>
				<p className='results-count' aria-live='polite'>
					{isLoading ? 'Cargando retos…' : plural(rows.length, 'reto', 'retos')}
					{active && (
						<>
							{' · '}
							<button
								type='button'
								className='link-btn'
								onClick={() => setParams({}, { replace: true })}>
								Quitar filtros
							</button>
						</>
					)}
				</p>
				{!isLoading && rows.length === 0 ? (
					<EmptyState
						title='Ningún reto con esos filtros'
						body='Prueba con otra área o quita la búsqueda. Si el problema que buscas no está, sugiérelo.'
					/>
				) : (
					<div className='tag-grid'>
						{rows.map((c, i) => (
							<ChallengeTag
								key={c.id}
								challenge={c}
								index={i}
								isNew={isNew(c)}
								isHot={signals.isHot(c)}
							/>
						))}
					</div>
				)}
			</section>
		</div>
	)
}
