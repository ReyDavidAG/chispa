import { z } from 'zod'

const text = (min: number, max: number, msg: string) =>
	z.string().trim().min(min, msg).max(max, `Máximo ${max} caracteres.`)

export const newChallengeSchema = z.object({
	areaId: z.string().min(1, 'Elige el área.'),
	departmentId: z.string(),
	title: text(
		12,
		110,
		'Cuenta el problema en una frase de al menos 12 letras.'
	),
	summary: text(20, 200, 'Escribe un resumen de al menos 20 letras.'),
	problem: text(40, 2000, 'Cuéntalo con más detalle (al menos 40 letras).'),
	affects: text(4, 300, 'Este dato hace falta.'),
	frequency: text(2, 200, 'Este dato hace falta.'),
	tried: text(2, 1000, 'Si no se ha intentado nada, dilo.'),
	success: text(15, 1000, 'Di qué tendría que pasar para decir “listo”.'),
	constraints: z.string().max(1000),
	types: z.array(z.string()).min(1, 'Elige al menos un tipo.'),
	closesOn: z.string().min(10, 'Elige una fecha.'),
})

export type NewChallengeForm = z.infer<typeof newChallengeSchema>
