import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'

import AuthGuard from '@/layouts/auth/auth_guard'
import NotFoundPage from '@/pages/core/not_found/not_found_page'

const SignInPage = lazy(() => import('@/pages/auth/sign_in/sign_in_page'))
const ProtectedLayout = lazy(
	() => import('@/layouts/protected/protected_layout')
)
const HomePage = lazy(() => import('@/pages/home/home_page'))
const ChallengesPage = lazy(
	() => import('@/pages/challenges/list/challenges_page')
)
const ChallengeNewPage = lazy(
	() => import('@/pages/challenges/new/challenge_new_page')
)
const ProposePage = lazy(() => import('@/pages/propose/propose_page'))
const IdeaDetailPage = lazy(
	() => import('@/pages/ideas/detail/idea_detail_page')
)
const MyIdeasPage = lazy(() => import('@/pages/my_ideas/my_ideas_page'))
const MyAreaPage = lazy(() => import('@/pages/my_area/my_area_page'))
const HowItWorksPage = lazy(
	() => import('@/pages/how_it_works/how_it_works_page')
)
const ChallengeDetailPage = lazy(
	() => import('@/pages/challenges/detail/challenge_detail_page')
)

const router = createBrowserRouter([
	{ path: '/sign-in', element: <SignInPage /> },
	{
		element: <AuthGuard />,
		children: [
			{
				element: <ProtectedLayout />,
				children: [
					{ index: true, element: <Navigate to='/home' replace /> },
					{ path: '/home', element: <HomePage /> },
					{ path: '/challenges', element: <ChallengesPage /> },
					{
						path: '/challenges/new',
						element: <ChallengeNewPage />,
					},
					{ path: '/challenges/:folio', element: <ChallengeDetailPage /> },
					{
						path: '/propose',
						element: <ProposePage />,
					},
					{
						path: '/ideas/:folio',
						element: <IdeaDetailPage />,
					},
					{
						path: '/my-ideas',
						element: <MyIdeasPage />,
					},
					{ path: '/my-area', element: <MyAreaPage /> },
					{
						path: '/how-it-works',
						element: <HowItWorksPage />,
					},
					{ path: '*', element: <NotFoundPage /> },
				],
			},
		],
	},
])

export default router
