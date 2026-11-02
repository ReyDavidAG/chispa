import { useEffect, useState } from 'react'

export function useCountUp(to: number, delay = 0) {
	const reduced =
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches
	const [value, setValue] = useState(reduced ? to : 0)

	useEffect(() => {
		if (reduced || !to) return
		let frame = 0
		const duration = Math.min(1100, 520 + to * 12)
		const start = performance.now() + delay
		const tick = (now: number) => {
			const t = Math.min(1, Math.max(0, (now - start) / duration))
			setValue(Math.round(to * (1 - Math.pow(1 - t, 3))))
			if (t < 1) frame = requestAnimationFrame(tick)
		}
		frame = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(frame)
	}, [to, delay, reduced])

	return reduced || !to ? to : value
}
