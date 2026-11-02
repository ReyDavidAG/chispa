import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router'

import { AreaKpis, type Kpi } from '@/components/area/area_kpis'
import { ChallengeQueueRow, IdeaQueueRow } from '@/components/area/queue_rows'
import { SuggestedChallenges } from '@/components/area/suggested_challenges'
import { Combobox } from '@/components/ui/combobox'
import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/use_session'
import { useChallenges } from '@/hooks/challenges/use_challenges'
import { useScores } from '@/hooks/ideas/use_evaluation'
import { useAllIdeas, useAuthorMap } from '@/hooks/ideas/use_ideas'
import { canManage } from '@/utils/permissions'
import { plural } from '@/utils/plural'

export default function MyAreaPage() {
	const session = useRequiredSession()
	const challenges = useChallenges()
	const ideas = useAllIdeas()
	const scores = useScores()
	const [areaFilter, setAreaFilter] = useState('')

	const scoped = useMemo(
		() =>
			(challenges.data ?? []).filter(
				c => canManage(session, c) && (!areaFilter || c.areaId === areaFilter)
			),
		[challenges.data, session, areaFilter]
	)
	const scopedIds = useMemo(() => new Set(scoped.map(c => c.id)), [scoped])
	const challengeById = useMemo(
		() => new Map(scoped.map(c => [c.id, c])),
		[scoped]
	)
	const ideasIn = useMemo(
		() => (ideas.data ?? []).filter(i => scopedIds.has(i.challengeId)),
		[ideas.data, scopedIds]
	)
	const scoreById = useMemo(
		() => new Map((scores.data ?? []).map(s => [s.ideaId, s])),
		[scores.data]
	)
	const pending = useMemo(
		() =>
			ideasIn
				.filter(i => i.status === 'received' || i.status === 'review')
				.sort((a, b) => b.supportCount - a.supportCount),
		[ideasIn]
	)
	const unscored = pending.filter(i => !scoreById.has(i.id))
	const selected = ideasIn.filter(i => i.status === 'selected')
	const suggested = scoped.filter(c => c.status === 'suggested')
	const published = scoped.filter(
		c => c.status !== 'suggested' && c.status !== 'archived'
	)
	const authorById = useAuthorMap(pending)
	const areaOptions = useMemo(() => {
		const m = new Map<string, { label: string; description: string }>()
		for (const c of challenges.data ?? [])
			m.set(c.areaId, { label: c.areaName, description: c.companyName })
		return [...m]
			.map(([value, v]) => ({ value, ...v, keywords: v.description }))
			.sort((a, b) => a.label.localeCompare(b.label))
	}, [challenges.data])

	if (session.role === 'member') return <Navigate to={ROUTES.home} replace />

	const committee = session.role === 'committee'
	const kpis: Kpi[] = [
		{
			label: 'Retos abiertos',
			value: published.filter(c => c.status === 'open').length,
		},
		{ label: 'Chispas recibidas', value: ideasIn.length },
		{ label: 'Sin calificar', value: unscored.length, attention: true },
		{ label: 'Seleccionadas', value: selected.length },
	]

	return (
		<div className='wrap'>
			<header className='page-head'>
				<div>
					<p className='kicker'>
						{committee ? 'Comité de la feria' : 'Encargado'}
					</p>
					<h1 className='h1'>{committee ? 'Evaluación' : 'Mi área'}</h1>
					<p className='lede'>
						{committee
							? 'Todas las chispas de todas las áreas. Califica con la rúbrica y elige las finalistas.'
							: 'Los retos que te tocan y las chispas que recibieron. Califica las pendientes.'}
					</p>
				</div>
				<Link className='btn btn--spark' to={ROUTES.challengeNew}>
					<Icon name='plus' />
					Publicar reto
				</Link>
			</header>

			{committee && (
				<div className='area-filter'>
					<Combobox
						variant='pill'
						label='Filtrar por área'
						options={areaOptions}
						value={areaFilter}
						onChange={setAreaFilter}
						clearLabel='Todas las áreas'
						placeholder='Todas las áreas'
						searchPlaceholder='Buscar área o empresa'
					/>
				</div>
			)}

			<AreaKpis items={kpis} />
			<SuggestedChallenges challenges={suggested} />

			<div className='panel-split'>
				<section className='section'>
					<div className='section__head'>
						<h2 className='h3'>Por evaluar · {pending.length}</h2>
					</div>
					{pending.length ? (
						<ul className='queue' role='list'>
							{[...pending]
								.sort((a, b) => b.supportCount - a.supportCount)
								.map((idea, i) => (
									<IdeaQueueRow
										key={idea.id}
										idea={idea}
										index={i}
										author={
											idea.authorId ? authorById.get(idea.authorId) : undefined
										}
										score={scoreById.get(idea.id)}
										challenge={challengeById.get(idea.challengeId)}
									/>
								))}
						</ul>
					) : (
						<p className='muted'>No hay chispas pendientes.</p>
					)}
				</section>
				<section className='section'>
					<div className='section__head'>
						<h2 className='h3'>
							{committee ? 'Retos' : 'Mis retos'} · {published.length}
						</h2>
					</div>
					<ul className='queue' role='list'>
						{published.map((c, i) => (
							<ChallengeQueueRow key={c.id} c={c} index={i} />
						))}
					</ul>
				</section>
			</div>
			<p className='muted small'>
				{plural(
					selected.length,
					'chispa seleccionada',
					'chispas seleccionadas'
				)}{' '}
				para la feria hasta ahora.
			</p>
		</div>
	)
}
