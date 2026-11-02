import { useFormContext } from 'react-hook-form'

import { Icon } from '@/components/ui/icon'
import { BenefitTag, SolutionTag } from '@/components/ui/tags'
import {
	BENEFIT_ICONS,
	BENEFITS,
	SOLUTION_HINTS,
	SOLUTION_ICONS,
	SOLUTION_TYPES,
} from '@/constants/status'
import type { ProposeIdeaForm } from '@/schemas/ideas/propose/propose_idea.schema'

import { FieldError } from './field_error'

export function StepHow() {
	const {
		register,
		formState: { errors },
	} = useFormContext<ProposeIdeaForm>()
	return (
		<div className='step-fieldset'>
			<h2 className='h3'>¿Cómo funcionaría?</h2>
			<div className='field'>
				<label htmlFor='how'>Paso a paso, ¿qué pasaría?</label>
				<textarea
					id='how'
					className='input textarea'
					rows={5}
					autoFocus
					placeholder='Quién hace qué, en qué momento y con qué.'
					aria-invalid={!!errors.how}
					{...register('how')}
				/>
				{errors.how ? (
					<FieldError name='how' />
				) : (
					<p className='field__help'>
						Si es un sistema, describe lo que verías en la pantalla.
					</p>
				)}
			</div>
			<fieldset className='field'>
				<legend>¿Qué tipo de solución es?</legend>
				<FieldError name='solutionType' />
				<div className='choice-grid'>
					{Object.entries(SOLUTION_TYPES).map(([id, name]) => (
						<label key={id} className='choice'>
							<input type='radio' value={id} {...register('solutionType')} />
							<span className='choice__icon' aria-hidden='true'>
								<Icon name={SOLUTION_ICONS[id]} />
							</span>
							<span className='choice__body'>
								<strong>{name}</strong>
								<span>{SOLUTION_HINTS[id]}</span>
							</span>
							<span className='choice__check' aria-hidden='true'>
								<Icon name='check' />
							</span>
						</label>
					))}
				</div>
			</fieldset>
			<div className='field'>
				<label htmlFor='needs'>
					¿Qué se necesitaría? <span className='optional'>Opcional</span>
				</label>
				<input
					id='needs'
					className='input'
					placeholder='Ej. etiquetas QR, una pantalla web'
					{...register('needs')}
				/>
				<p className='field__help'>Sepáralo con comas.</p>
			</div>
		</div>
	)
}

export function StepImpact() {
	const { register } = useFormContext<ProposeIdeaForm>()
	return (
		<div className='step-fieldset'>
			<h2 className='h3'>¿Qué mejoraría?</h2>
			<fieldset className='field'>
				<legend>Elige uno o más</legend>
				<FieldError name='benefits' />
				<div className='check-chips'>
					{Object.entries(BENEFITS).map(([id, name]) => (
						<label key={id} className='check-chip'>
							<input type='checkbox' value={id} {...register('benefits')} />
							<span>
								<Icon name={BENEFIT_ICONS[id]} className='chip-icon' />
								{name}
							</span>
						</label>
					))}
				</div>
			</fieldset>
			<div className='field'>
				<label htmlFor='estimate'>
					¿Cuánto, más o menos? <span className='optional'>Opcional</span>
				</label>
				<textarea
					id='estimate'
					className='input textarea'
					rows={3}
					placeholder='Ej. dejaríamos de capturar dos horas al día.'
					{...register('estimate')}
				/>
				<p className='field__help'>
					Un cálculo a ojo está bien. El comité lo afina.
				</p>
			</div>
			<div className='toggles'>
				<label className='switch'>
					<input type='checkbox' role='switch' {...register('wantsToJoin')} />
					<span className='switch__track' aria-hidden='true' />
					<span className='switch__text'>
						<strong>Quiero participar si se elige</strong>
						<span>Te buscaríamos para el equipo que la lleve a cabo.</span>
					</span>
				</label>
				<label className='switch'>
					<input type='checkbox' role='switch' {...register('isAnonymous')} />
					<span className='switch__track' aria-hidden='true' />
					<span className='switch__text'>
						<strong>Enviar como anónimo</strong>
						<span>
							Tu nombre no se muestra. El comité sí lo ve por si necesita
							contactarte.
						</span>
					</span>
				</label>
			</div>
		</div>
	)
}

export function StepReview({ authorName }: { authorName: string }) {
	const { getValues } = useFormContext<ProposeIdeaForm>()
	const v = getValues()
	return (
		<div className='step-fieldset'>
			<h2 className='h3'>Así se verá tu chispa</h2>
			<article className='preview-idea'>
				<div className='idea-row__top'>
					<span className='folio'>CHI-nueva</span>
					<SolutionTag code={v.solutionType} />
				</div>
				<h3 className='h3'>{v.title}</h3>
				<p>{v.summary}</p>
				<dl className='preview-idea__list'>
					<div>
						<dt>Cómo funciona</dt>
						<dd>{v.how}</dd>
					</div>
					{v.needs && (
						<div>
							<dt>Se necesitaría</dt>
							<dd>{v.needs}</dd>
						</div>
					)}
					<div>
						<dt>Mejora</dt>
						<dd className='type-list'>
							{v.benefits.map(b => (
								<BenefitTag key={b} code={b} />
							))}
						</dd>
					</div>
					{v.estimate && (
						<div>
							<dt>Cuánto</dt>
							<dd>{v.estimate}</dd>
						</div>
					)}
					<div>
						<dt>Firma</dt>
						<dd>
							{v.isAnonymous ? 'Anónimo' : authorName}
							{v.wantsToJoin && ' · quiere participar'}
						</dd>
					</div>
				</dl>
			</article>
			<p className='muted small'>
				Al enviarla, la ve el encargado del reto y cualquiera puede avivarla o
				comentarla.
			</p>
		</div>
	)
}
