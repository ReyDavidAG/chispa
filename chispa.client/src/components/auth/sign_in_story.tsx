import { Wordmark } from '@/components/ui/wordmark'
import { areaStyle } from '@/utils/area_hue'
import { stagger } from '@/utils/stagger'

const SAMPLE = [
	{
		folio: 'RET-002',
		area: 'Recursos Humanos',
		title: 'Pedir vacaciones toma hasta cinco días y tres firmas en papel',
	},
	{
		folio: 'RET-005',
		area: 'Seguridad',
		title: 'Casi nadie reporta los casi-accidentes',
	},
	{
		folio: 'RET-001',
		area: 'Mantenimiento',
		title: 'Las órdenes de mantenimiento se pierden entre papel y WhatsApp',
	},
]

export function SignInStory() {
	return (
		<section className='signin__story'>
			<span className='signin__brand'>
				<Wordmark large />
			</span>
			<div className='signin__copy'>
				<p className='signin__event'>Feria de Innovación 2026</p>
				<h1 className='display'>Toda mejora empieza con una chispa.</h1>
				<p className='lede'>
					Las áreas publican sus retos. Tú propones cómo resolverlos. Las
					mejores ideas se presentan en la feria y se vuelven proyecto.
				</p>
			</div>
			<div className='signin__stack' aria-hidden='true'>
				{SAMPLE.map((t, i) => (
					<div
						key={t.folio}
						className='signin-tag'
						data-area=''
						style={{ ...areaStyle(t.area), ...stagger(i) }}>
						<span className='tag-hole' />
						<span className='folio'>{t.folio}</span>
						<p>{t.title}</p>
					</div>
				))}
			</div>
		</section>
	)
}
