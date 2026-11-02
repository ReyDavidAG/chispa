import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'

import { ConfirmStep } from '@/components/auth/confirm_step'
import { NumberStep } from '@/components/auth/number_step'
import { SignInStory } from '@/components/auth/sign_in_story'
import { ROUTES } from '@/constants/routes'
import { useSession } from '@/hooks/auth/use_session'
import type { Session } from '@/types/session_type'

export default function SignInPage() {
	const { session, signIn, confirm, signOut } = useSession()
	const navigate = useNavigate()
	const location = useLocation()
	const [pending, setPending] = useState<Session | null>(null)
	const [number, setNumber] = useState('')
	const [error, setError] = useState<string | null>(null)

	if (session && !pending) return <Navigate to={ROUTES.home} replace />

	const lookUp = async (employeeNumber: string) => {
		setNumber(employeeNumber)
		setError(null)
		try {
			setPending(await signIn(employeeNumber))
		} catch (e) {
			setError(e instanceof Error ? e.message : 'No se pudo entrar.')
		}
	}

	const enter = () => {
		if (!pending) return
		confirm(pending)
		const from = (location.state as { from?: string } | null)?.from
		navigate(from && from !== ROUTES.signIn ? from : ROUTES.home, {
			replace: true,
		})
	}

	const back = async () => {
		await signOut()
		setPending(null)
	}

	return (
		<div className='signin'>
			<SignInStory />
			<section className='signin__panel'>
				<div className='signin__panel-inner'>
					{pending ? (
						<ConfirmStep session={pending} onConfirm={enter} onBack={back} />
					) : (
						<NumberStep
							defaultValue={number}
							serverError={error}
							onSubmit={lookUp}
						/>
					)}
				</div>
			</section>
		</div>
	)
}
