import { type RefObject, useLayoutEffect } from 'react'

const last = new Map<string, { x: number; w: number }>()
const reduced = () =>
	window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function useIndicator(
	container: RefObject<HTMLElement | null>,
	activeSelector: string,
	key: string,
	activeKey: string
) {
	useLayoutEffect(() => {
		const host = container.current
		if (!host) return
		const place = () => {
			const active = host.querySelector<HTMLElement>(activeSelector)
			let bar = host.querySelector<HTMLElement>(':scope > .indicator')
			if (!active) {
				bar?.classList.remove('is-visible')
				return
			}
			if (!bar) {
				bar = document.createElement('span')
				bar.className = 'indicator'
				bar.setAttribute('aria-hidden', 'true')
				host.prepend(bar)
			}
			const box = host.getBoundingClientRect()
			const r = active.getBoundingClientRect()
			const next = { x: r.left - box.left + host.scrollLeft, w: r.width }
			const prev = last.get(key)
			const apply = (p: { x: number; w: number }) => {
				bar!.style.transform = `translateX(${p.x}px)`
				bar!.style.width = `${p.w}px`
			}
			if (prev && !reduced() && !bar.classList.contains('is-ready')) {
				apply(prev)
				void bar.offsetWidth
			}
			bar.classList.add('is-ready', 'is-visible')
			apply(next)
			last.set(key, next)
		}
		place()
		const observer = new ResizeObserver(place)
		observer.observe(host)
		return () => observer.disconnect()
	}, [container, activeSelector, key, activeKey])
}
