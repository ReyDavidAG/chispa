import { Icon } from './icon'

export function NewFlag() {
	return (
		<span className='flag flag--new'>
			<Icon name='spark' />
			Nuevo
		</span>
	)
}

export function HotFlag({ label = 'En tendencia' }: { label?: string }) {
	return (
		<span className='flag flag--hot'>
			<Icon name='flame' />
			{label}
		</span>
	)
}
