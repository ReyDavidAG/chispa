import { type RefObject, useLayoutEffect } from 'react'

interface Box {
	x: number
	w: number
}

const last = new Map<string, Box>()
const reduced = () =>
	window.matchMedia('(prefers-reduced-motion: reduce)').matches

const moveBar = (bar: HTMLElement, p: Box) => {
	bar.style.transform = `translateX(${p.x}px)`
	bar.style.width = `${p.w}px`
}

const ensureBar = (host: HTMLElement) => {
	const found = host.querySelector<HTMLElement>(':scope > .indicator')
	if (found) return found
	const bar = document.createElement('span')
	bar.className = 'indicator'
	bar.setAttribute('aria-hidden', 'true')
	host.prepend(bar)
	return bar
}

function placeIndicator(
	host: HTMLElement,
	activeSelector: string,
	key: string
) {
	const active = host.querySelector<HTMLElement>(activeSelector)
	if (!active) {
		host.querySelector(':scope > .indicator')?.classList.remove('is-visible')
		return
	}
	const bar = ensureBar(host)
	const box = host.getBoundingClientRect()
	const r = active.getBoundingClientRect()
	const next = { x: r.left - box.left + host.scrollLeft, w: r.width }
	const prev = last.get(key)
	if (prev && !reduced() && !bar.classList.contains('is-ready')) {
		moveBar(bar, prev)
		void bar.offsetWidth
	}
	bar.classList.add('is-ready', 'is-visible')
	moveBar(bar, next)
	last.set(key, next)
}

export function useIndicator(
	container: RefObject<HTMLElement | null>,
	activeSelector: string,
	key: string,
	activeKey: string
) {
	useLayoutEffect(() => {
		const host = container.current
		if (!host) return
		const place = () => placeIndicator(host, activeSelector, key)
		place()
		const observer = new ResizeObserver(place)
		observer.observe(host)
		return () => observer.disconnect()
	}, [container, activeSelector, key, activeKey])
}
