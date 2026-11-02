export function readDraft<T>(key: string): T | null {
	try {
		const raw = localStorage.getItem(key)
		return raw ? (JSON.parse(raw) as T) : null
	} catch {
		return null
	}
}

export function writeDraft(key: string, value: unknown) {
	try {
		if (value === null) localStorage.removeItem(key)
		else localStorage.setItem(key, JSON.stringify(value))
	} catch {
		return
	}
}
