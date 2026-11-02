import { useFormContext } from 'react-hook-form'

import type { NewChallengeForm } from '@/schemas/challenges/new/new_challenge.schema'
import { cn } from '@/utils/cn'

const FIELDS: {
	id: keyof NewChallengeForm
	label: string
	hint?: string
	max?: number
	rows?: number
	ph?: string
	optional?: boolean
}[] = [
	{
		id: 'title',
		label: '¿Cuál es el problema?',
		hint: 'Una frase. Cuenta el problema, no la solución.',
		max: 110,
		ph: 'Ej. Las órdenes de mantenimiento se pierden entre papel y WhatsApp',
	},
	{
		id: 'summary',
		label: 'En corto, ¿qué está pasando?',
		hint: 'Aparece en la tarjeta del reto.',
		max: 200,
		rows: 2,
	},
	{
		id: 'problem',
		label: 'Cuéntalo con detalle',
		hint: 'Cómo se hace hoy y dónde se atora.',
		rows: 5,
	},
	{ id: 'affects', label: '¿A quién afecta?', ph: 'Puestos, turnos o áreas' },
	{
		id: 'frequency',
		label: '¿Qué tan seguido pasa?',
		ph: 'Ej. unas 40 veces por semana',
	},
	{
		id: 'tried',
		label: '¿Qué ya se intentó?',
		hint: 'Si no se ha intentado nada, dilo.',
		rows: 3,
	},
	{
		id: 'success',
		label: '¿Cómo sabremos que se resolvió?',
		hint: 'Lo que tendría que pasar para decir “listo”.',
		rows: 3,
	},
	{
		id: 'constraints',
		label: '¿Qué hay que tomar en cuenta?',
		rows: 2,
		ph: 'Señal, horarios, normas, presupuesto…',
		optional: true,
	},
]

export function ChallengeTextFields() {
	const {
		register,
		watch,
		formState: { errors },
	} = useFormContext<NewChallengeForm>()

	return (
		<>
			{FIELDS.map(f => {
				const error = errors[f.id]?.message
				const length = f.max ? String(watch(f.id) ?? '').length : 0
				const describedBy = `${f.id}-help`
				const props = {
					id: f.id,
					placeholder: f.ph,
					'aria-invalid': !!error,
					'aria-describedby': describedBy,
					...register(f.id),
				}
				return (
					<div key={f.id} className='field'>
						<div className='field__label-row'>
							<label htmlFor={f.id}>
								{f.label}
								{f.optional && <span className='optional'> Opcional</span>}
							</label>
							{f.max && (
								<span className={cn('counter', length > f.max && 'is-over')}>
									{length}/{f.max}
								</span>
							)}
						</div>
						{f.rows ? (
							<textarea className='input textarea' rows={f.rows} {...props} />
						) : (
							<input className='input' {...props} />
						)}
						<p
							className={cn('field__help', error && 'is-error')}
							id={describedBy}>
							{error ? String(error) : f.hint}
						</p>
					</div>
				)
			})}
		</>
	)
}
