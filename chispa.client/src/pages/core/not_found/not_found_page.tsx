import { Link } from 'react-router'

import { EmptyState } from '@/components/ui/empty_state'
import { ROUTES } from '@/constants/routes'

export default function NotFoundPage() {
	return (
		<section className='wrap narrow'>
			<EmptyState
				title='No encontramos esa página'
				body='Puede que la liga esté incompleta o que el reto ya no exista.'
				action={
					<Link className='btn' to={ROUTES.home}>
						Volver al inicio
					</Link>
				}
			/>
		</section>
	)
}
