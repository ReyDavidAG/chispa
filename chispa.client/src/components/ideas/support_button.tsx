import { useState } from 'react'
import { toast } from 'sonner'

import { Icon } from '@/components/ui/icon'
import { useToggleSupport } from '@/hooks/ideas/use_ideas'
import type { IdeaCard } from '@/types/idea_type'
import { cn } from '@/utils/cn'

export function SupportButton({
	idea,
	large = false,
}: {
	idea: IdeaCard
	large?: boolean
}) {
	const toggle = useToggleSupport()
	const [pulse, setPulse] = useState<{ n: number; on: boolean } | null>(null)
	const on = idea.supportedByMe

	const flip = (next: boolean) => {
		setPulse(p => ({ n: (p?.n ?? 0) + 1, on: next }))
		toggle.mutate(
			{ idea, on: next },
			{
				onError: e =>
					toast.error(e instanceof Error ? e.message : 'No se pudo avivar'),
			}
		)
	}

	const click = () => {
		const next = !on
		flip(next)
		if (next)
			toast('Avivaste la chispa', {
				action: { label: 'Deshacer', onClick: () => flip(false) },
			})
	}

	return (
		<button
			type='button'
			className={cn(
				'support-btn',
				large && 'is-large',
				pulse && 'is-pop',
				pulse?.on && 'is-burst',
				pulse && !pulse.on && 'is-cool'
			)}
			aria-pressed={on}
			aria-label={`${on ? 'Quitar avivada' : 'Avivar esta chispa'}, ${idea.supportCount}`}
			onClick={click}>
			<span key={`i${pulse?.n ?? 0}`} className='support-btn__icon'>
				<Icon name='flame' />
				<span className='burst' aria-hidden='true'>
					<i />
					<i />
					<i />
					<i />
					<i />
					<i />
				</span>
			</span>
			<span key={`c${pulse?.n ?? 0}`} className='support-btn__count'>
				<span className='support-btn__num'>{idea.supportCount}</span>
			</span>
			{large && (
				<span className='support-btn__label'>{on ? 'Avivada' : 'Avivar'}</span>
			)}
		</button>
	)
}
