import { challengeRepository } from './challenge_repository'
import { evaluationRepository } from './evaluation_repository'
import { fairRepository } from './fair_repository'
import { ideaRepository } from './idea_repository'
import { sessionRepository } from './session_repository'

export const services = {
	session: sessionRepository,
	challenges: challengeRepository,
	ideas: ideaRepository,
	evaluations: evaluationRepository,
	fair: fairRepository,
}
