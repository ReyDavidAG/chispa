import type { ReactNode } from 'react'

const PATHS = {
	spark: (
		<path d='M12 2C12.7 8 16 11.3 22 12C16 12.7 12.7 16 12 22C11.3 16 8 12.7 2 12C8 11.3 11.3 8 12 2Z' />
	),
	search: (
		<>
			<circle cx='11' cy='11' r='7' />
			<path d='M20 20l-3.5-3.5' />
		</>
	),
	plus: <path d='M12 5v14M5 12h14' />,
	arrowLeft: <path d='M19 12H5M11 18l-6-6 6-6' />,
	arrowRight: <path d='M5 12h14M13 6l6 6-6 6' />,
	chevronDown: <path d='M6 9l6 6 6-6' />,
	chevronRight: <path d='M9 6l6 6-6 6' />,
	check: <path d='M20 6L9 17l-5-5' />,
	home: (
		<path d='M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z' />
	),
	tag: (
		<>
			<path d='M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z' />
			<circle cx='7.5' cy='7.5' r='1.5' />
		</>
	),
	building: (
		<path d='M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M3 21h18M8 7h4M8 11h4M8 15h4' />
	),
	clock: (
		<>
			<circle cx='12' cy='12' r='9' />
			<path d='M12 7v5l3 2' />
		</>
	),
	calendar: (
		<>
			<rect x='3' y='5' width='18' height='16' rx='2' />
			<path d='M3 10h18M8 3v4M16 3v4' />
		</>
	),
	flame: (
		<path d='M12 3c.6 3.2 4.8 5.3 4.8 10.2a4.8 4.8 0 0 1-9.6 0c0-1.9.8-3.4 1.9-4.4.2 1.6 1 2.6 2.1 2.9-.6-2.9.1-5.8.8-8.7z' />
	),
	logout: (
		<path d='M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 16l4-4-4-4M20 12H10' />
	),
	info: (
		<>
			<circle cx='12' cy='12' r='9' />
			<path d='M12 11v6M12 7.5v.01' />
		</>
	),
	refresh: (
		<path d='M20 11a8 8 0 0 0-14.6-4.5L3 9M3 4v5h5M4 13a8 8 0 0 0 14.6 4.5L21 15M21 20v-5h-5' />
	),
	message: <path d='M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z' />,
	sliders: (
		<path d='M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6' />
	),
	file: (
		<path d='M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4' />
	),
	copy: (
		<>
			<rect x='9' y='9' width='11' height='11' rx='2' />
			<path d='M5 15V5a1 1 0 0 1 1-1h10' />
		</>
	),
	send: <path d='M21 3L10 14M21 3l-7 18-4-7-7-4z' />,
	users: (
		<path d='M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.2.6 3.5 2.6 3.5 6M12.5 8a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z' />
	),
	eyeOff: (
		<path d='M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 9 6 9 6a17 17 0 0 1-2.6 3.2M6.6 6.6C4.1 8.2 3 12 3 12s4 6 9 6c1.6 0 3-.4 4.3-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2' />
	),
	monitor: (
		<>
			<rect x='3' y='4' width='18' height='12' rx='2' />
			<path d='M8 20h8M12 16v4' />
		</>
	),
	process: (
		<path d='M4 7h12l-3-3M20 17H8l3 3M20 7a3 3 0 0 1-3 3M4 17a3 3 0 0 1 3-3' />
	),
	wrench: (
		<path d='M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.1-.4-.4-2.1z' />
	),
	bulb: (
		<path d='M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z' />
	),
	money: (
		<>
			<circle cx='12' cy='12' r='9' />
			<path d='M14.5 9a2.5 2.5 0 0 0-2.5-1.5c-1.4 0-2.5.8-2.5 2s1.1 1.6 2.5 2 2.5.9 2.5 2-1.1 2-2.5 2A2.6 2.6 0 0 1 9.5 15M12 6v1.5M12 16.5V18' />
		</>
	),
	shield: (
		<path d='M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6zM9 12l2 2 4-4' />
	),
	award: (
		<>
			<circle cx='12' cy='9' r='6' />
			<path d='M8.5 14L7 22l5-3 5 3-1.5-8' />
		</>
	),
	smile: (
		<>
			<circle cx='12' cy='12' r='9' />
			<path d='M8 14s1.5 2 4 2 4-2 4-2M9 9.5h.01M15 9.5h.01' />
		</>
	),
	gauge: <path d='M12 14l4-4M3.5 18a9 9 0 1 1 17 0M12 14a1 1 0 1 0 0 .01' />,
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof PATHS

export function Icon({
	name,
	className = '',
}: {
	name: IconName
	className?: string
}) {
	return (
		<svg
			className={`icon ${className}`}
			viewBox='0 0 24 24'
			aria-hidden='true'
			focusable='false'>
			{PATHS[name]}
		</svg>
	)
}
