import { cn } from '@/utils/cn'

export function WizardProgress({
	steps,
	current,
}: {
	steps: string[]
	current: number
}) {
	return (
		<>
			<ol className='wizard-progress' aria-label='Pasos'>
				{steps.map((name, i) => (
					<li
						key={name}
						className={cn(
							i < current && 'is-done',
							i === current && 'is-current'
						)}
						aria-current={i === current ? 'step' : undefined}>
						<span
							key={i === current ? `c${current}` : 'b'}
							className='wizard-progress__bar'
							aria-hidden='true'
						/>
						<span className='wizard-progress__name'>{name}</span>
					</li>
				))}
			</ol>
			<p className='step-count'>
				Paso {current + 1} de {steps.length}
			</p>
		</>
	)
}
