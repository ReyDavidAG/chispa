import type { CSSProperties } from 'react'
import { Link } from 'react-router'

import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { currentStageIndex, useFair } from '@/hooks/fair/use_fair'
import { useCriteria } from '@/hooks/ideas/use_evaluation'
import { cn } from '@/utils/cn'
import { shortDate } from '@/utils/dates'

const FAQS = [
	[
		'¿Sólo cuentan ideas de software?',
		'No. La mayoría de los retos se resuelven con un sistema, pero un cambio de proceso, una herramienta o un acuerdo entre áreas cuentan igual.',
	],
	[
		'¿Puedo proponer para un reto que no es de mi área?',
		'Sí, y es de lo más valioso: alguien de fuera ve lo que quien está adentro ya no nota.',
	],
	[
		'¿Puedo mandar mi idea anónima?',
		'Sí. Tu nombre no se muestra a nadie; sólo el comité lo ve por si necesita preguntarte algo.',
	],
	[
		'¿Qué pasa si eligen mi chispa?',
		'Se presenta en la feria. Si avanza, se vuelve proyecto y, si marcaste que quieres participar, te invitamos al equipo.',
	],
	[
		'¿Avivar es votar?',
		'Ayuda al comité a ver qué le importa a la gente, pero la decisión se toma con la rúbrica. Una idea con pocas avivadas puede ganar.',
	],
	[
		'¿Y si veo un problema que no está publicado?',
		'Sugiérelo como reto. El encargado del área lo revisa y, si lo acepta, se publica para todos.',
	],
]

const GOOD_CHALLENGE = [
	'Cuenta el problema, no la solución.',
	'Dice a quién afecta y qué tan seguido.',
	'Cuenta qué ya se intentó.',
	'Dice cómo sabremos que se resolvió.',
]
const GOOD_IDEA = [
	'Se entiende en dos frases.',
	'Explica qué pasaría, paso a paso.',
	'Dice qué mejora, aunque sea a ojo.',
	'Puede ser sencilla: no tiene que costar.',
]

export default function HowItWorksPage() {
	const fair = useFair()
	const criteria = useCriteria()
	const current = fair.data ? currentStageIndex(fair.data) : -1

	return (
		<div className='wrap narrow-wide'>
			<header className='how-head'>
				<h1 className='display'>
					De un problema de todos los días a un proyecto de verdad.
				</h1>
				<p className='lede'>
					Chispa junta a quien vive el problema con quien tiene la idea. Así
					funciona la {fair.data?.name ?? 'Feria de Innovación'}.
				</p>
			</header>

			<section className='section'>
				<h2 className='h2'>Las cinco etapas</h2>
				<ol className='stage-detail' role='list'>
					{fair.data?.stages.map((s, i) => (
						<li
							key={s.code}
							className={cn('animate-tile-in', i === current && 'is-current')}
							style={{ '--i': i } as CSSProperties}>
							<span className='stage-detail__n num' aria-hidden='true'>
								{i + 1}
							</span>
							<div>
								<h3 className='h4'>{s.name}</h3>
								<p>{s.detail}</p>
								<p className='muted small'>
									{s.startsOn === s.endsOn
										? shortDate(s.startsOn)
										: `${shortDate(s.startsOn)} – ${shortDate(s.endsOn)}`}
								</p>
							</div>
						</li>
					))}
				</ol>
				<p className='muted small'>
					<Icon name='info' /> Fechas de ejemplo, por confirmar con el comité.
				</p>
			</section>

			<section className='section how-pair'>
				<div className='how-card'>
					<h2 className='h3'>Un buen reto</h2>
					<ul className='check-list' role='list'>
						{GOOD_CHALLENGE.map(t => (
							<li key={t}>
								<Icon name='check' />
								{t}
							</li>
						))}
					</ul>
				</div>
				<div className='how-card how-card--spark'>
					<h2 className='h3'>Una buena chispa</h2>
					<ul className='check-list' role='list'>
						{GOOD_IDEA.map(t => (
							<li key={t}>
								<Icon name='check' />
								{t}
							</li>
						))}
					</ul>
				</div>
			</section>

			<section className='section'>
				<h2 className='h2'>Cómo se evalúa</h2>
				<p className='lede'>
					El encargado del área y el comité califican cada chispa del 1 al 5 en
					cada criterio. Las de mayor calificación pasan a la feria.
				</p>
				<dl className='rubric'>
					{criteria.data?.map(c => (
						<div key={c.id}>
							<dt>
								{c.name}
								{c.weight !== 1 && (
									<span className='optional'> pesa ×{c.weight}</span>
								)}
							</dt>
							<dd>{c.hint}</dd>
						</div>
					))}
				</dl>
			</section>

			<section className='section'>
				<h2 className='h2'>Preguntas frecuentes</h2>
				<div className='faq'>
					{FAQS.map(([q, a]) => (
						<details key={q}>
							<summary>
								{q}
								<Icon name='chevronDown' />
							</summary>
							<div className='faq__body'>
								<p>{a}</p>
							</div>
						</details>
					))}
				</div>
			</section>

			<section className='how-cta'>
				<h2 className='h2'>¿Ya tienes una idea?</h2>
				<div className='btn-row btn-row--center'>
					<Link className='btn btn--spark btn--lg' to={ROUTES.propose}>
						<Icon name='plus' />
						Proponer chispa
					</Link>
					<Link className='btn btn--ghost btn--lg' to={ROUTES.challenges}>
						Ver los retos
					</Link>
				</div>
			</section>
		</div>
	)
}
