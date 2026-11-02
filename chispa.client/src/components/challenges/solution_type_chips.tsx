import { useFormContext } from 'react-hook-form'

import { Icon } from '@/components/ui/icon'
import { SOLUTION_ICONS, SOLUTION_TYPES } from '@/constants/status'
import type { NewChallengeForm } from '@/schemas/challenges/new/new_challenge.schema'
import { cn } from '@/utils/cn'

export function SolutionTypeChips() {
	const { register, formState } = useFormContext<NewChallengeForm>()
	const error = formState.errors.types?.message

	return (
		<fieldset className='field'>
			<legend>¿Qué tipo de solución imaginas?</legend>
			<p className={cn('field__help', error && 'is-error')}>
				{error ?? 'Puedes elegir varios. Es una pista, no un límite.'}
			</p>
			<div className='check-chips'>
				{Object.entries(SOLUTION_TYPES).map(([id, name]) => (
					<label key={id} className='check-chip'>
						<input type='checkbox' value={id} {...register('types')} />
						<span>
							<Icon name={SOLUTION_ICONS[id]} className='chip-icon' />
							{name}
						</span>
					</label>
				))}
			</div>
		</fieldset>
	)
}
