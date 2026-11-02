import { useFormContext } from 'react-hook-form'
import { Link } from 'react-router'

import { Icon } from '@/components/ui/icon'
import { OrgLine } from '@/components/ui/org_line'
import { ROUTES } from '@/constants/routes'
import type { ProposeIdeaForm } from '@/schemas/ideas/propose/propose_idea.schema'
import type { ChallengeCard } from '@/types/challenge_type'
import { areaStyle } from '@/utils/area_hue'
import { closesLabel } from '@/utils/dates'

import { Counter, FieldError } from './field_error'

export function StepChallenge({ open }: { open: ChallengeCard[] }) {
	const { register } = useFormContext<ProposeIdeaForm>()
	return (
		<fieldset className='step-fieldset'>
			<legend className='h3'>¿Qué reto quieres resolver?</legend>
			<p className='muted'>
				Los retos abiertos de todas las áreas. No tiene que ser de la tuya.
			</p>
			<FieldError name='challengeId' />
			<div className='reto-picker'>
				{open.map(c => (
					<label
						key={c.id}
						className='reto-option'
						data-area=''
						style={areaStyle(c.areaCode + c.companyCode)}>
						<input type='radio' value={c.id} {...register('challengeId')} />
						<span className='reto-option__body'>
							<span className='reto-option__top'>
								<span className='folio'>{c.folio}</span>
								<OrgLine unit={c} />
							</span>
							<strong>{c.title}</strong>
							<span className='muted'>{closesLabel(c.closesOn)}</span>
						</span>
						<span className='choice__check' aria-hidden='true'>
							<Icon name='check' />
						</span>
					</label>
				))}
			</div>
			<p className='muted small'>
				¿Ves un problema que no está publicado?{' '}
				<Link to={ROUTES.challengeNew}>Sugiere un reto</Link>.
			</p>
		</fieldset>
	)
}

export function StepIdea() {
	const {
		register,
		formState: { errors },
	} = useFormContext<ProposeIdeaForm>()
	return (
		<div className='step-fieldset'>
			<h2 className='h3'>Cuéntala en corto</h2>
			<p className='muted'>
				Como se la contarías a un compañero en el comedor.
			</p>
			<div className='field'>
				<div className='field__label-row'>
					<label htmlFor='title'>Nombre de tu idea</label>
					<Counter name='title' max={90} />
				</div>
				<input
					id='title'
					className='input'
					autoFocus
					placeholder='Ej. Reportar la falla con un QR en cada equipo'
					aria-invalid={!!errors.title}
					aria-describedby={errors.title ? 'title-error' : undefined}
					{...register('title')}
				/>
				<FieldError name='title' />
			</div>
			<div className='field'>
				<div className='field__label-row'>
					<label htmlFor='summary'>En una o dos frases, ¿qué propones?</label>
					<Counter name='summary' max={280} />
				</div>
				<textarea
					id='summary'
					className='input textarea'
					rows={4}
					placeholder='Qué cambia y para quién.'
					aria-invalid={!!errors.summary}
					aria-describedby={errors.summary ? 'summary-error' : undefined}
					{...register('summary')}
				/>
				<FieldError name='summary' />
			</div>
		</div>
	)
}
