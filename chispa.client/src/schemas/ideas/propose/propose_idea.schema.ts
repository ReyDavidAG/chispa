import { z } from 'zod'

export const proposeIdeaSchema = z.object({
	challengeId: z.string().min(1, 'Elige un reto para continuar.'),
	title: z
		.string()
		.trim()
		.min(8, 'Ponle un nombre de al menos 8 letras.')
		.max(90, 'Máximo 90 caracteres.'),
	summary: z
		.string()
		.trim()
		.min(20, 'Cuéntala en al menos una frase completa.')
		.max(280, 'Máximo 280 caracteres.'),
	how: z.string().trim().min(20, 'Describe un poco más cómo funcionaría.'),
	solutionType: z.string().min(1, 'Elige el tipo que más se parezca.'),
	needs: z.string().max(400),
	benefits: z.array(z.string()).min(1, 'Elige al menos una mejora.'),
	estimate: z.string().max(400),
	isAnonymous: z.boolean(),
	wantsToJoin: z.boolean(),
})

export type ProposeIdeaForm = z.infer<typeof proposeIdeaSchema>

export const PROPOSE_STEPS: {
	name: string
	fields: (keyof ProposeIdeaForm)[]
}[] = [
	{ name: 'Reto', fields: ['challengeId'] },
	{ name: 'Tu idea', fields: ['title', 'summary'] },
	{ name: 'Cómo funciona', fields: ['how', 'solutionType', 'needs'] },
	{ name: 'Impacto', fields: ['benefits', 'estimate'] },
	{ name: 'Revisar', fields: [] },
]

export const EMPTY_IDEA: ProposeIdeaForm = {
	challengeId: '',
	title: '',
	summary: '',
	how: '',
	solutionType: '',
	needs: '',
	benefits: [],
	estimate: '',
	isAnonymous: false,
	wantsToJoin: false,
}
