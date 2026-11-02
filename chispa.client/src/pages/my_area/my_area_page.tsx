import { type CSSProperties, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router'
import { toast } from 'sonner'

import { ChallengeQueueRow, IdeaQueueRow } from '@/components/area/queue_rows'
import { Combobox } from '@/components/ui/combobox'
import { CountUp } from '@/components/ui/count_up'
import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/use_session'
import { useSetChallengeStatus } from '@/hooks/challenges/use_challenge_admin'
import { useChallenges } from '@/hooks/challenges/use_challenges'
import { useScores } from '@/hooks/ideas/use_evaluation'
import { useAllIdeas, useAuthors } from '@/hooks/ideas/use_ideas'
import { canManage } from '@/utils/permissions'
import { plural } from '@/utils/plural'

export default function MyAreaPage() {
	const session = useRequiredSession()
	const challenges = useChallenges()
	const ideas = useAllIdeas()
	const scores = useScores()
	const setStatus = useSetChallengeStatus()
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
		() => ideasIn.filter(i => i.status === 'received' || i.status === 'review'),
		[ideasIn]
	)
	const unscored = pending.filter(i => !scoreById.has(i.id))
	const selected = ideasIn.filter(i => i.status === 'selected')
	const suggested = scoped.filter(c => c.status === 'suggested')
	const published = scoped.filter(
		c => c.status !== 'suggested' && c.status !== 'archived'
	)
	const authorIds = useMemo(
		() => [
			...new Set(pending.map(i => i.authorId).filter((x): x is string => !!x)),
		],
		[pending]
	)
	const authors = useAuthors(authorIds)
	const authorById = useMemo(
		() => new Map((authors.data ?? []).map(a => [a.id, a])),
		[authors.data]
	)
	const areaOptions = useMemo(() => {
		const m = new Map<string, { label: string; description: string }>()
		for (const c of challenges.data ?? [])
			m.set(c.areaId, { label: c.areaName, description: c.companyName })
		return [...m]
			.map(([value, v]) => ({ value, ...v, keywords: v.description }))
			.sort((a, b) => a.label.localeCompare(b.label))
	}, [challenges.data])

	if (session.role === 'member') return <Navigate to={ROUTES.home} replace />

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

	const committee = session.role === 'committee'
	const kpis = [
		[
			'Retos abiertos',
			published.filter(c => c.status === 'open').length,
			false,
		],
		['Chispas recibidas', ideasIn.length, false],
		['Sin calificar', unscored.length, true],
		['Seleccionadas', selected.length, false],
	] as const

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

			<dl className='kpis'>
				{kpis.map(([label, value, attention], i) => (
					<div
						key={label}
						className={
							attention
								? 'kpi is-attention animate-tile-in'
								: 'kpi animate-tile-in'
						}
						style={{ '--i': i } as CSSProperties}>
						<dt>{label}</dt>
						<dd className='num'>
							<CountUp to={value} delay={120 + i * 60} />
						</dd>
					</div>
				))}
			</dl>

			{suggested.length > 0 && (
				<section className='section'>
					<div className='section__head'>
						<h2 className='h3'>
							Retos sugeridos por colaboradores · {suggested.length}
						</h2>
					</div>
					<ul className='queue' role='list'>
						{suggested.map((c, i) => (
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
			)}

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
