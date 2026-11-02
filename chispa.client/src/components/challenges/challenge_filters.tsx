import { useEffect, useMemo, useRef, useState } from 'react'

import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { Icon } from '@/components/ui/icon'
import { type Filters } from '@/constants/challenge_filters'
import { SOLUTION_ICONS, SOLUTION_TYPES } from '@/constants/status'
import { useIndicator } from '@/hooks/ui/use_indicator'

const STATUS = [
	['open', 'Abiertos'],
	['review', 'En evaluación'],
	['building', 'En desarrollo'],
	['solved', 'Resueltos'],
	['all', 'Todos'],
] as const

const SORTS = [
	['recent', 'Más recientes'],
	['new', 'Nuevos primero'],
	['trending', 'En tendencia'],
	['fewest', 'Menos chispas'],
	['closing', 'Cierran pronto'],
] as const

const TYPE_OPTIONS: ComboboxOption[] = Object.entries(SOLUTION_TYPES).map(
	([value, label]) => ({
		value,
		label,
		leading: <Icon name={SOLUTION_ICONS[value]} />,
	})
)

const SORT_OPTIONS: ComboboxOption[] = SORTS.map(([value, label]) => ({
	value,
	label,
}))

interface Props {
	value: Filters
	areas: { id: string; label: string; description: string }[]
	onChange: (next: Partial<Filters>) => void
}

export function ChallengeFilters({ value, areas, onChange }: Props) {
	const [q, setQ] = useState(value.q)
	const areaOptions = useMemo(
		() =>
			areas.map(a => ({
				value: a.id,
				label: a.label,
				description: a.description,
				keywords: a.description,
			})),
		[areas]
	)
	const segmented = useRef<HTMLDivElement>(null)
	useIndicator(
		segmented,
		'.segmented__item:has(input:checked)',
		'status',
		value.status
	)

	useEffect(() => {
		if (q === value.q) return
		const t = setTimeout(() => onChange({ q }), 300)
		return () => clearTimeout(t)
	}, [q, value.q, onChange])

	return (
		<form className='filters' role='search' onSubmit={e => e.preventDefault()}>
			<div className='search'>
				<Icon name='search' />
				<label className='sr-only' htmlFor='q'>
					Buscar retos
				</label>
				<input
					className='input'
					id='q'
					type='search'
					placeholder='Buscar por palabra o folio'
					autoComplete='off'
					value={q}
					onChange={e => setQ(e.target.value)}
				/>
			</div>
			<div className='filters__row'>
				<div
					ref={segmented}
					className='segmented has-indicator'
					role='radiogroup'
					aria-label='Estado'>
					{STATUS.map(([id, label]) => (
						<label key={id} className='segmented__item'>
							<input
								type='radio'
								name='status'
								value={id}
								checked={value.status === id}
								onChange={() => onChange({ status: id })}
							/>
							<span>{label}</span>
						</label>
					))}
				</div>
				<div className='filters__selects'>
					<Combobox
						variant='pill'
						label='Área'
						options={areaOptions}
						value={value.area}
						onChange={area => onChange({ area })}
						clearLabel='Todas las áreas'
						placeholder='Todas las áreas'
						searchPlaceholder='Buscar área o empresa'
					/>
					<Combobox
						variant='pill'
						label='Tipo de solución'
						options={TYPE_OPTIONS}
						value={value.type}
						onChange={type => onChange({ type })}
						clearLabel='Cualquier solución'
						placeholder='Cualquier solución'
						searchPlaceholder='Buscar tipo'
					/>
					<Combobox
						variant='pill'
						label='Ordenar'
						options={SORT_OPTIONS}
						value={value.sort}
						onChange={sort => onChange({ sort })}
						searchPlaceholder='Buscar orden'
					/>
				</div>
			</div>
		</form>
	)
}
