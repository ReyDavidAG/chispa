import {
	type KeyboardEvent,
	type ReactNode,
	type RefObject,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from 'react'
import * as Popover from '@radix-ui/react-popover'

import { cn } from '@/utils/cn'

import { Icon } from './icon'

export interface ComboboxOption {
	value: string
	label: string
	description?: string
	keywords?: string
	leading?: ReactNode
}

interface Props {
	options: ReadonlyArray<ComboboxOption>
	value: string
	onChange: (value: string) => void
	placeholder?: string
	searchPlaceholder?: string
	clearLabel?: string
	disabled?: boolean
	invalid?: boolean
	id?: string
	label?: string
	describedBy?: string
	variant?: 'field' | 'pill'
}

const norm = (s: string) =>
	s
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()

interface ListProps {
	listRef: RefObject<HTMLUListElement | null>
	listId: string
	options: ReadonlyArray<ComboboxOption>
	active: number
	value: string
	onHover: (idx: number) => void
	onPick: (opt: ComboboxOption) => void
}

function ComboboxList({
	listRef,
	listId,
	options,
	active,
	value,
	onHover,
	onPick,
}: ListProps) {
	return (
		<ul ref={listRef} id={listId} role='listbox' className='combo-pop__list'>
			{options.length === 0 ? (
				<li className='combo-pop__empty' role='presentation'>
					Sin coincidencias
				</li>
			) : (
				options.map((opt, idx) => {
					const isSel = opt.value === value
					return (
						<li
							key={opt.value || '__clear__'}
							id={`${listId}-${idx}`}
							data-idx={idx}
							role='option'
							aria-selected={isSel}
							className={cn(
								'combo-opt',
								idx === active && 'is-active',
								isSel && 'is-selected'
							)}
							onMouseEnter={() => onHover(idx)}
							onMouseDown={e => e.preventDefault()}
							onClick={() => onPick(opt)}>
							{opt.leading}
							<span className='combo-opt__text'>
								<span className='combo-opt__label'>{opt.label}</span>
								{opt.description && (
									<span className='combo-opt__desc'>{opt.description}</span>
								)}
							</span>
							{isSel && <Icon name='check' className='combo-opt__check' />}
						</li>
					)
				})
			)}
		</ul>
	)
}

export function Combobox({
	options,
	value,
	onChange,
	placeholder = 'Selecciona…',
	searchPlaceholder = 'Buscar…',
	clearLabel,
	disabled,
	invalid,
	id,
	label,
	describedBy,
	variant = 'field',
}: Props) {
	const listId = useId()
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState('')
	const [active, setActive] = useState(0)
	const inputRef = useRef<HTMLInputElement>(null)
	const listRef = useRef<HTMLUListElement>(null)

	const all = useMemo<ReadonlyArray<ComboboxOption>>(
		() =>
			clearLabel != null
				? [{ value: '', label: clearLabel }, ...options]
				: options,
		[clearLabel, options]
	)
	const filtered = useMemo(() => {
		const words = norm(query).split(/\s+/).filter(Boolean)
		if (!words.length) return all
		return all.filter(o => {
			const text = norm(`${o.label} ${o.description ?? ''} ${o.keywords ?? ''}`)
			return words.every(w => text.includes(w))
		})
	}, [all, query])
	const selected = all.find(o => o.value === value)

	const toggle = (next: boolean) => {
		if (next) {
			setQuery('')
			setActive(
				Math.max(
					0,
					all.findIndex(o => o.value === value)
				)
			)
		}
		setOpen(next)
	}

	useEffect(() => {
		if (!open) return
		listRef.current
			?.querySelector<HTMLElement>(`[data-idx="${active}"]`)
			?.scrollIntoView({ block: 'nearest' })
	}, [active, open])

	const commit = (opt: ComboboxOption) => {
		onChange(opt.value)
		setOpen(false)
	}

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault()
			setActive(a => Math.min(a + 1, filtered.length - 1))
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			setActive(a => Math.max(a - 1, 0))
		} else if (e.key === 'Home') {
			e.preventDefault()
			setActive(0)
		} else if (e.key === 'End') {
			e.preventDefault()
			setActive(filtered.length - 1)
		} else if (e.key === 'Enter') {
			e.preventDefault()
			const opt = filtered[active]
			if (opt) commit(opt)
		}
	}

	return (
		<Popover.Root open={open} onOpenChange={toggle}>
			<Popover.Trigger asChild>
				<button
					type='button'
					id={id}
					disabled={disabled}
					aria-haspopup='listbox'
					aria-expanded={open}
					aria-label={
						label ? `${label}: ${selected?.label ?? placeholder}` : undefined
					}
					aria-invalid={invalid || undefined}
					aria-describedby={describedBy}
					className={cn('combo', variant === 'pill' && 'combo--pill')}>
					<span className='combo__value'>
						{selected?.leading}
						<span className={cn('combo__label', !selected && 'is-placeholder')}>
							{selected?.label ?? placeholder}
						</span>
						{selected?.description && variant === 'field' && (
							<span className='combo__desc'>{selected.description}</span>
						)}
					</span>
					<Icon name='chevronDown' className='combo__chevron' />
				</button>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					align='start'
					sideOffset={6}
					collisionPadding={12}
					className='combo-pop'
					style={{ width: 'max(var(--radix-popover-trigger-width), 240px)' }}
					onOpenAutoFocus={e => {
						e.preventDefault()
						inputRef.current?.focus()
					}}>
					<div className='combo-pop__search'>
						<Icon name='search' />
						<input
							ref={inputRef}
							role='combobox'
							aria-expanded='true'
							aria-controls={listId}
							aria-activedescendant={
								filtered[active] ? `${listId}-${active}` : undefined
							}
							aria-autocomplete='list'
							aria-label={searchPlaceholder}
							value={query}
							placeholder={searchPlaceholder}
							onChange={e => {
								setQuery(e.target.value)
								setActive(0)
							}}
							onKeyDown={onKeyDown}
						/>
					</div>
					<ComboboxList
						listRef={listRef}
						listId={listId}
						options={filtered}
						active={active}
						value={value}
						onHover={setActive}
						onPick={commit}
					/>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	)
}
