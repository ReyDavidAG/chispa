import { cn } from '@/utils/cn'

export function Wordmark({ large = false }: { large?: boolean }) {
	return (
		<span
			className={cn('wordmark', large && 'is-lg')}
			role='img'
			aria-label='Chispa'>
			<svg className='wordmark__mark' viewBox='0 0 24 24' aria-hidden='true'>
				<path d='M12 2C12.7 8 16 11.3 22 12C16 12.7 12.7 16 12 22C11.3 16 8 12.7 2 12C8 11.3 11.3 8 12 2Z' />
			</svg>
			<span aria-hidden='true'>chispa</span>
		</span>
	)
}
