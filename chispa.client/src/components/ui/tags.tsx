import {
	BENEFIT_ICONS,
	BENEFITS,
	SOLUTION_ICONS,
	SOLUTION_TYPES,
} from '@/constants/status'

import { Icon } from './icon'

export function SolutionTag({ code }: { code: string }) {
	return (
		<span className='type-tag'>
			<Icon name={SOLUTION_ICONS[code] ?? 'bulb'} />
			{SOLUTION_TYPES[code] ?? code}
		</span>
	)
}

export function BenefitTag({ code }: { code: string }) {
	return (
		<span className='benefit-tag'>
			<Icon name={BENEFIT_ICONS[code] ?? 'check'} />
			{BENEFITS[code] ?? code}
		</span>
	)
}

export function SolutionIcons({ codes }: { codes: string[] }) {
	if (!codes.length) return null
	return (
		<span
			className='type-icons'
			role='img'
			aria-label={`Soluciones: ${codes.map(c => SOLUTION_TYPES[c] ?? c).join(', ')}`}>
			{codes.map(c => (
				<span
					key={c}
					className='type-icons__item'
					title={SOLUTION_TYPES[c] ?? c}>
					<Icon name={SOLUTION_ICONS[c] ?? 'bulb'} />
				</span>
			))}
		</span>
	)
}
