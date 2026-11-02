import { type CSSProperties, type FormEvent, useState } from 'react'
import { toast } from 'sonner'

import { Icon } from '@/components/ui/icon'
import { BENEFITS, SOLUTION_TYPES } from '@/constants/status'
import {
	useRequirement,
	useSaveRequirement,
} from '@/hooks/ideas/use_evaluation'
import type { ChallengeDetail } from '@/types/challenge_type'
import type { IdeaDetail, Requirement } from '@/types/idea_type'
import { shortDate } from '@/utils/dates'

type Fields = Omit<Requirement, 'id' | 'updatedAt' | 'status'>

const LABELS: [keyof Fields, string][] = [
	['currentProblem', 'Problema actual'],
	['users', 'Usuarios afectados'],
	['volume', 'Volumen'],
	['proposal', 'Propuesta'],
	['needs', 'Se necesitaría'],
	['expectedBenefit', 'Beneficio esperado'],
	['successCriteria', 'Criterio de éxito'],
	['constraints', 'Restricciones'],
	['acceptanceCriteria', 'Criterios de aceptación'],
	['nextStep', 'Siguiente paso'],
]

const draftFrom = (idea: IdeaDetail, c: ChallengeDetail): Fields => ({
	currentProblem: c.problem,
	users: c.affects,
	volume: c.frequency,
	proposal: `${idea.summary} ${idea.how}`,
	needs: idea.needs.join(', ') || 'Por definir en el levantamiento',
	expectedBenefit: [
		idea.benefits.map(b => BENEFITS[b] ?? b).join(', '),
		idea.estimate,
	]
		.filter(Boolean)
		.join('. '),
	successCriteria: c.success,
	constraints: c.constraints,
	acceptanceCriteria: `1. ${c.success}\n2. Validado con ${c.departmentName ?? c.areaName}.`,
	nextStep:
		'Sesión de levantamiento con el área para validar alcance, usuarios y criterios de aceptación.',
})

export function RequirementSheet({
	idea,
	challenge,
}: {
	idea: IdeaDetail
	challenge: ChallengeDetail
}) {
	const saved = useRequirement(idea.id, true)
	if (saved.isLoading) return null
	return (
		<SheetForm
			key={saved.data?.updatedAt ?? 'draft'}
			idea={idea}
			challenge={challenge}
			saved={saved.data ?? null}
		/>
	)
}

function SheetForm({
	idea,
	challenge,
	saved,
}: {
	idea: IdeaDetail
	challenge: ChallengeDetail
	saved: Requirement | null
}) {
	const [fields, setFields] = useState<Fields>(() =>
		saved ? { ...saved } : draftFrom(idea, challenge)
	)
	const save = useSaveRequirement(idea.id)
	const kind =
		idea.solutionType === 'software'
			? 'Ficha de requerimiento'
			: 'Ficha de proyecto'
	const header = [
		['Folio', `REQ-${idea.folio}`],
		['Título', idea.title],
		[
			'Origen',
			`${challenge.folio} · ${challenge.areaName}${challenge.departmentName ? ` · ${challenge.departmentName}` : ''} · ${challenge.companyCode}`,
		],
		[
			'Tipo de solución',
			SOLUTION_TYPES[idea.solutionType] ?? idea.solutionType,
		],
	]

	const copy = async () => {
		const text = [...header, ...LABELS.map(([k, l]) => [l, fields[k] ?? ''])]
			.map(([k, v]) => `${k}: ${v}`)
			.join('\n')
		try {
			await navigator.clipboard.writeText(text)
			toast.success('Ficha copiada')
		} catch {
			toast.error('No se pudo copiar; selecciona el texto a mano')
		}
	}

	const submit = (e: FormEvent) => {
		e.preventDefault()
		save.mutate(fields, {
			onSuccess: () => toast.success('Ficha guardada'),
			onError: err =>
				toast.error(err instanceof Error ? err.message : 'No se pudo guardar'),
		})
	}

	return (
		<form
			className='req-sheet animate-panel-in'
			id='req-sheet'
			onSubmit={submit}
			aria-labelledby='req-title'>
			<header className='req-sheet__head'>
				<div>
					<p className='kicker'>
						{kind} ·{' '}
						{saved ? `guardada el ${shortDate(saved.updatedAt)}` : 'borrador'}
					</p>
					<h2 className='h3' id='req-title'>
						REQ-{idea.folio}
					</h2>
				</div>
				<button type='button' className='btn btn--ghost btn--sm' onClick={copy}>
					<Icon name='copy' />
					Copiar
				</button>
			</header>
			<dl className='req-sheet__list'>
				{header.slice(1).map(([k, v]) => (
					<div key={k}>
						<dt>{k}</dt>
						<dd>{v}</dd>
					</div>
				))}
				{LABELS.map(([k, label], i) => (
					<div
						key={k}
						className='animate-row-in'
						style={{ '--i': Math.min(i, 12) } as CSSProperties}>
						<dt>
							<label htmlFor={`req-${k}`}>{label}</label>
						</dt>
						<dd>
							<textarea
								id={`req-${k}`}
								className='req-sheet__input'
								rows={Math.min(8, Math.ceil((fields[k] ?? '').length / 64) + 1)}
								value={fields[k] ?? ''}
								onChange={e => setFields(f => ({ ...f, [k]: e.target.value }))}
							/>
						</dd>
					</div>
				))}
			</dl>
			<div className='req-sheet__actions'>
				<p className='req-sheet__foot'>
					Se arma con lo que escribieron el área y quien propuso. Es el punto de
					partida del levantamiento.
				</p>
				<button type='submit' className='btn' disabled={save.isPending}>
					{save.isPending ? 'Guardando…' : 'Guardar ficha'}
				</button>
			</div>
		</form>
	)
}
