export const ROUTES = {
	signIn: '/sign-in',
	home: '/home',
	challenges: '/challenges',
	challengeNew: '/challenges/new',
	challenge: (folio: string) => `/challenges/${folio}`,
	propose: '/propose',
	idea: (folio: string) => `/ideas/${folio}`,
	myIdeas: '/my-ideas',
	myArea: '/my-area',
	howItWorks: '/how-it-works',
} as const
