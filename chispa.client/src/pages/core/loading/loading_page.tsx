import { Wordmark } from '@/components/ui/wordmark'

export default function LoadingPage() {
	return (
		<div className='loading-page' role='status' aria-live='polite'>
			<Wordmark large />
			<span className='sr-only'>Cargando</span>
		</div>
	)
}
