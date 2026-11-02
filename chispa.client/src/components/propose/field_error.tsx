import { useFormContext } from 'react-hook-form'

import type { ProposeIdeaForm } from '@/schemas/ideas/propose/propose_idea.schema'
import { cn } from '@/utils/cn'

export function FieldError({ name }: { name: keyof ProposeIdeaForm }) {
	const {
		formState: { errors },
	} = useFormContext<ProposeIdeaForm>()
	const message = errors[name]?.message
	return message ? (
		<p
			className='field__help is-error animate-nudge'
			id={`${name}-error`}
			role='alert'>
			{String(message)}
		</p>
	) : null
}

export function Counter({
	name,
	max,
}: {
	name: 'title' | 'summary'
	max: number
}) {
	const { watch } = useFormContext<ProposeIdeaForm>()
	const length = (watch(name) ?? '').length
	return (
		<span
			className={cn('counter', length > max && 'is-over')}
			aria-live='polite'>
			{length}/{max}
		</span>
	)
}
