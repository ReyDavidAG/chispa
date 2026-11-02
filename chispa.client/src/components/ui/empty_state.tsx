import type { ReactNode } from 'react'

import { Icon } from './icon'

export function EmptyState({
	title,
	body,
	action,
}: {
	title: string
	body: string
	action?: ReactNode
}) {
	return (
		<div className='empty'>
			<span className='empty__mark' aria-hidden='true'>
				<Icon name='spark' />
			</span>
			<h3>{title}</h3>
			<p>{body}</p>
			{action}
		</div>
	)
}
