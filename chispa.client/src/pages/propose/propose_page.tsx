import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { ContextCard } from '@/components/propose/context_card'
import { ProposeSuccess } from '@/components/propose/propose_success'
import { StepChallenge, StepIdea } from '@/components/propose/steps_basic'
import {
	StepHow,
	StepImpact,
	StepReview,
} from '@/components/propose/steps_detail'
import { WizardProgress } from '@/components/propose/wizard_progress'
import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/use_session'
import { useChallenges } from '@/hooks/challenges/use_challenges'
import { useCreateIdea } from '@/hooks/ideas/use_ideas'
import LoadingPage from '@/pages/core/loading/loading_page'
import {
	EMPTY_IDEA,
	PROPOSE_STEPS,
	type ProposeIdeaForm,
	proposeIdeaSchema,
} from '@/schemas/ideas/propose/propose_idea.schema'
import type { ChallengeCard } from '@/types/challenge_type'
import { readDraft, writeDraft } from '@/utils/draft_storage'

const draftKey = (personId: string) => `chispa.draft.idea.${personId}`
type Draft = ProposeIdeaForm & { step: number }

export default function ProposePage() {
	const { person } = useRequiredSession()
	const [params] = useSearchParams()
	const { data, isLoading } = useChallenges()
	const open = useMemo(
		() => (data ?? []).filter(c => c.status === 'open'),
		[data]
	)
	const preset = open.find(c => c.folio === params.get('challenge'))

	if (isLoading) return <LoadingPage />
	return (
		<ProposeWizard
			key={preset?.id ?? 'free'}
			personId={person.id}
			authorName={person.fullName}
			open={open}
			presetId={preset?.id}
		/>
	)
}

interface WizardProps {
	personId: string
	authorName: string
	open: ChallengeCard[]
	presetId?: string
}

function ProposeWizard({ personId, authorName, open, presetId }: WizardProps) {
	const key = draftKey(personId)
	const [initial] = useState(() => {
		const saved = readDraft<Draft>(key)
		if (saved && (!presetId || saved.challengeId === presetId)) return saved
		return {
			...EMPTY_IDEA,
			challengeId: presetId ?? '',
			step: presetId ? 1 : 0,
		}
	})
	const [step, setStep] = useState(initial.step)
	const [dir, setDir] = useState(1)
	const [done, setDone] = useState<string | null>(null)
	const create = useCreateIdea()
	const methods = useForm<ProposeIdeaForm>({
		resolver: zodResolver(proposeIdeaSchema),
		defaultValues: { ...EMPTY_IDEA, ...initial },
		mode: 'onTouched',
	})
	const challengeId = methods.watch('challengeId')
	const challenge = open.find(c => c.id === challengeId)

	useEffect(() => {
		const sub = methods.watch((values, { name }) => {
			writeDraft(key, { ...values, step })
			if (name && methods.getFieldState(name).error) void methods.trigger(name)
		})
		return () => sub.unsubscribe()
	}, [methods, step, key])

	const go = (next: number) => {
		setDir(next > step ? 1 : -1)
		setStep(next)
		writeDraft(key, { ...methods.getValues(), step: next })
		window.scrollTo({ top: 0 })
	}

	const submit = async (e: FormEvent) => {
		e.preventDefault()
		const ok = await methods.trigger(PROPOSE_STEPS[step].fields)
		if (!ok) return
		if (step < PROPOSE_STEPS.length - 1) return go(step + 1)
		const v = methods.getValues()
		try {
			const res = await create.mutateAsync({
				challengeId: v.challengeId,
				title: v.title.trim(),
				summary: v.summary.trim(),
				how: v.how.trim(),
				solutionType: v.solutionType,
				needs: v.needs
					.split(',')
					.map(s => s.trim())
					.filter(Boolean),
				benefits: v.benefits,
				estimate: v.estimate.trim(),
				isAnonymous: v.isAnonymous,
				wantsToJoin: v.wantsToJoin,
			})
			writeDraft(key, null)
			setDone(res.folio)
			window.scrollTo({ top: 0 })
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : 'No se pudo enviar tu chispa'
			)
		}
	}

	if (done && challenge)
		return (
			<div className='wrap'>
				<ProposeSuccess folio={done} challenge={challenge} />
			</div>
		)

	const last = step === PROPOSE_STEPS.length - 1
	const views = [
		<StepChallenge key='c' open={open} />,
		<StepIdea key='i' />,
		<StepHow key='h' />,
		<StepImpact key='m' />,
		<StepReview key='r' authorName={authorName} />,
	]

	return (
		<div className='wrap'>
			<div className='wizard'>
				<div className='wizard__main'>
					<h1 className='sr-only'>Proponer una chispa</h1>
					<WizardProgress
						steps={PROPOSE_STEPS.map(s => s.name)}
						current={step}
					/>
					<FormProvider {...methods}>
						<form className='wizard-form' noValidate onSubmit={submit}>
							<div
								key={step}
								className='animate-panel-in'
								style={{ '--dir': dir }}>
								{views[step]}
							</div>
							<div className='wizard-actions'>
								{step > 0 ? (
									<button
										type='button'
										className='btn btn--ghost'
										onClick={() => go(step - 1)}>
										<Icon name='arrowLeft' />
										Atrás
									</button>
								) : (
									<Link className='btn btn--ghost' to={ROUTES.challenges}>
										Cancelar
									</Link>
								)}
								<button
									type='submit'
									className={last ? 'btn btn--spark btn--lg' : 'btn btn--lg'}
									disabled={create.isPending}>
									{last ? (
										<>
											<Icon name='send' />
											{create.isPending ? 'Enviando…' : 'Enviar mi chispa'}
										</>
									) : (
										<>
											Continuar
											<Icon name='arrowRight' />
										</>
									)}
								</button>
							</div>
							<p className='draft-note'>
								<Icon name='check' />
								El borrador se guarda solo en este equipo.
							</p>
						</form>
					</FormProvider>
				</div>
				<aside className='wizard__aside'>
					<ContextCard challenge={challenge} />
				</aside>
			</div>
		</div>
	)
}
