import { CountUp } from '@/components/ui/count_up'
import { cn } from '@/utils/cn'
import { stagger } from '@/utils/stagger'

export interface Kpi {
	label: string
	value: number
	attention?: boolean
}

export function AreaKpis({ items }: { items: ReadonlyArray<Kpi> }) {
	return (
		<dl className='kpis'>
			{items.map(({ label, value, attention = false }, i) => (
				<div
					key={label}
					className={cn('kpi animate-tile-in', attention && 'is-attention')}
					style={stagger(i)}>
					<dt>{label}</dt>
					<dd className='num'>
						<CountUp to={value} delay={120 + i * 60} />
					</dd>
				</div>
			))}
		</dl>
	)
}
