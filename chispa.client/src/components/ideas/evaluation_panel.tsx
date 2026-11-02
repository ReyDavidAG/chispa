import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'

import { Combobox } from '@/components/ui/combobox'
import { Icon } from '@/components/ui/icon'
import { IDEA_STATUS } from '@/constants/status'
import {
	useCriteria,
	useMyEvaluation,
	useSaveEvaluation,
} from '@/hooks/ideas/use_evaluation'
import { useSetIdeaStatus } from '@/hooks/ideas/use_ideas'
import type {
	Criterion,
	Evaluation,
	IdeaDetail,
	IdeaStatus,
} from '@/types/idea_type'

const isIdeaStatus = (v: string): v is IdeaStatus => v in IDEA_STATUS

const STATUS_OPTIONS = Object.entries(IDEA_STATUS).map(([value, s]) => ({
	value,
	label: s.label,
	leading: <span className={`status-dot tone-${s.tone}`} aria-hidden='true' />,
}))

interface Props {
	idea: IdeaDetail
	onShowRequirement: () => void
}

export function EvaluationPanel({ idea, onShowRequirement }: Props) {
	const criteria = useCriteria()
	const mine = useMyEvaluation(idea.id, true)
	if (!criteria.data || mine.isLoading)
		return <section className='eval-panel' aria-busy='true' />
	return (
		<EvaluationForm
			key={mine.data?.id ?? 'new'}
			idea={idea}
			criteria={criteria.data}
			saved={mine.data ?? null}
			onShowRequirement={onShowRequirement}
		/>
	)
}

function EvaluationForm({
	idea,
	criteria,
	saved,
	onShowRequirement,
}: Props & { criteria: Criterion[]; saved: Evaluation | null }) {
	const [scores, setScores] = useState<Record<string, number>>(() =>
		Object.fromEntries(criteria.map(c => [c.id, saved?.scores[c.id] ?? 3]))
	)
	const [statusDraft, setStatusDraft] = useState<IdeaStatus | null>(null)
	const status = statusDraft ?? idea.status
	const save = useSaveEvaluation(idea.id)
	const setIdeaStatus = useSetIdeaStatus()
	const total = Object.values(scores).reduce((a, b) => a + b, 0)
	const busy = save.isPending || setIdeaStatus.isPending

	const submit = async (e: FormEvent) => {
		e.preventDefault()
		try {
			await save.mutateAsync({ scores, comment: saved?.comment ?? '' })
			if (status !== idea.status)
				await setIdeaStatus.mutateAsync({ ideaId: idea.id, status })
			setStatusDraft(null)
			toast.success('Evaluación guardada')
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'No se pudo guardar')
		}
	}

	return (
		<section className='eval-panel' aria-labelledby='eval-title'>
			<div className='eval-panel__head'>
				<h2 className='h4' id='eval-title'>
					<Icon name='sliders' />
					Evaluación
				</h2>
				<p className='eval-score'>
					<span key={total} className='num is-bump'>
						{total}
					</span>
					<span>/ {criteria.length * 5}</span>
				</p>
			</div>
			<form className='eval-form' onSubmit={submit}>
				{criteria.map(c => (
					<div key={c.id} className='range-field'>
						<div className='range-field__top'>
							<label htmlFor={`r-${c.id}`}>
								{c.name}
								{c.weight !== 1 && (
									<span className='optional'> peso ×{c.weight}</span>
								)}
							</label>
							<output className='num' htmlFor={`r-${c.id}`}>
								{scores[c.id]}
							</output>
						</div>
						<input
							type='range'
							id={`r-${c.id}`}
							min={1}
							max={5}
							step={1}
							value={scores[c.id]}
							aria-describedby={`h-${c.id}`}
							onChange={e =>
								setScores(s => ({ ...s, [c.id]: Number(e.target.value) }))
							}
						/>
						<p className='field__help' id={`h-${c.id}`}>
							{c.hint}
						</p>
					</div>
				))}
				<div className='field'>
					<label htmlFor='idea-status'>Estado</label>
					<Combobox
						id='idea-status'
						options={STATUS_OPTIONS}
						value={status}
						onChange={v => isIdeaStatus(v) && setStatusDraft(v)}
						searchPlaceholder='Buscar estado'
					/>
				</div>
				<button type='submit' className='btn btn--block' disabled={busy}>
					{busy
						? 'Guardando…'
						: saved
							? 'Actualizar evaluación'
							: 'Guardar evaluación'}
				</button>
			</form>
			<button
				type='button'
				className='btn btn--ghost btn--block'
				onClick={onShowRequirement}>
				<Icon name='file' />
				{idea.solutionType === 'software'
					? 'Ficha de requerimiento'
					: 'Ficha de proyecto'}
			</button>
		</section>
	)
}
