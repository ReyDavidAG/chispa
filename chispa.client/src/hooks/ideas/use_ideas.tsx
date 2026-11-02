import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/query_keys'
import { useRequiredSession } from '@/hooks/auth/use_session'
import { services } from '@/services/api/unit_of_services'
import type { IdeaCard, IdeaStatus, NewIdea } from '@/types/idea_type'

export function useChallengeIdeas(challengeId: string | undefined) {
	return useQuery({
		queryKey: QUERY_KEYS.challengeIdeas(challengeId ?? ''),
		queryFn: () => services.ideas.byChallenge(challengeId!),
		enabled: !!challengeId,
	})
}

export function useMyIdeas() {
	const { person } = useRequiredSession()
	return useQuery({
		queryKey: QUERY_KEYS.myIdeas(person.id),
		queryFn: () => services.ideas.byAuthor(person.id),
	})
}

export function useSupportedIdeas() {
	const { person } = useRequiredSession()
	return useQuery({
		queryKey: QUERY_KEYS.supportedIdeas(person.id),
		queryFn: () => services.ideas.supportedBy(person.id),
	})
}

export function useAllIdeas() {
	return useQuery({
		queryKey: QUERY_KEYS.allIdeas,
		queryFn: () => services.ideas.all(),
	})
}

export function useIdea(folio: string) {
	return useQuery({
		queryKey: QUERY_KEYS.idea(folio),
		queryFn: () => services.ideas.byFolio(folio),
	})
}

export function useAuthors(ids: string[]) {
	return useQuery({
		queryKey: QUERY_KEYS.authors(ids),
		queryFn: () => services.ideas.authors(ids),
		enabled: ids.length > 0,
		staleTime: 5 * 60_000,
	})
}

export function useAuthorMap(ideas: ReadonlyArray<Pick<IdeaCard, 'authorId'>>) {
	const ids = useMemo(
		() => [...new Set(ideas.flatMap(i => (i.authorId ? [i.authorId] : [])))],
		[ideas]
	)
	const { data } = useAuthors(ids)
	return useMemo(() => new Map((data ?? []).map(a => [a.id, a])), [data])
}

const patchIdea = (on: boolean) => (idea: IdeaCard) => ({
	...idea,
	supportedByMe: on,
	supportCount: Math.max(0, idea.supportCount + (on ? 1 : -1)),
})

export function useToggleSupport() {
	const client = useQueryClient()
	const { person } = useRequiredSession()
	return useMutation({
		mutationFn: ({ idea, on }: { idea: IdeaCard; on: boolean }) =>
			services.ideas.setSupport(idea.id, person.id, on),
		onMutate: ({ idea, on }) => {
			const apply = patchIdea(on)
			client.setQueriesData<IdeaCard[] | IdeaCard | null>(
				{ queryKey: ['ideas'] },
				data => {
					if (!data) return data
					if (Array.isArray(data))
						return data.map(i => (i.id === idea.id ? apply(i) : i))
					return data.id === idea.id ? { ...data, ...apply(data) } : data
				}
			)
		},
		onSettled: () => {
			void client.invalidateQueries({ queryKey: ['ideas'] })
			void client.invalidateQueries({ queryKey: QUERY_KEYS.challenges })
		},
	})
}

export function useCreateIdea() {
	const client = useQueryClient()
	return useMutation({
		mutationFn: (input: NewIdea) => services.ideas.create(input),
		onSuccess: () => {
			void client.invalidateQueries({ queryKey: ['ideas'] })
			void client.invalidateQueries({ queryKey: QUERY_KEYS.challenges })
		},
	})
}

export function useSetIdeaStatus() {
	const client = useQueryClient()
	return useMutation({
		mutationFn: ({ ideaId, status }: { ideaId: string; status: IdeaStatus }) =>
			services.ideas.setStatus(ideaId, status),
		onSuccess: () => void client.invalidateQueries({ queryKey: ['ideas'] }),
	})
}

export function useComments(ideaId: string) {
	return useQuery({
		queryKey: QUERY_KEYS.comments(ideaId),
		queryFn: () => services.ideas.comments(ideaId),
	})
}

export function useAddComment(ideaId: string) {
	const client = useQueryClient()
	const { person } = useRequiredSession()
	return useMutation({
		mutationFn: (body: string) =>
			services.ideas.addComment(ideaId, person.id, body),
		onSuccess: () => {
			void client.invalidateQueries({ queryKey: QUERY_KEYS.comments(ideaId) })
			void client.invalidateQueries({ queryKey: ['ideas'] })
		},
	})
}
