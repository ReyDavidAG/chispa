import { useState } from 'react'

import { cn } from '@/utils/cn'

export function NewBadge({ count }: { count: number }) {
	const [shown, setShown] = useState(count)
	const [prevCount, setPrevCount] = useState(count)
	if (count !== prevCount) {
		setPrevCount(count)
		if (count > 0) setShown(count)
	}
	const leaving = count === 0 && shown > 0

	if (!shown) return null
	return (
		<span
			className={cn('nav-badge', leaving && 'is-leaving')}
			onAnimationEnd={() => leaving && setShown(0)}>
			<span className='sr-only'>, </span>
			{shown}
			<span className='sr-only'> {shown === 1 ? 'nuevo' : 'nuevos'}</span>
		</span>
	)
}
