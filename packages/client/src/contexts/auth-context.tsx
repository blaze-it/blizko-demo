import { createContext, type ReactNode, useContext, useState } from 'react'

interface AuthContextValue {
	isUnauthorized: boolean
	setUnauthorized: (v: boolean) => void
}

const AuthContext = createContext<AuthContextValue>({
	isUnauthorized: false,
	setUnauthorized: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
	const [isUnauthorized, setUnauthorized] = useState(false)
	return (
		<AuthContext.Provider value={{ isUnauthorized, setUnauthorized }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	return useContext(AuthContext)
}
