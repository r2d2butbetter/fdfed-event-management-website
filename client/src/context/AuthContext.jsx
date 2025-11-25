import React, { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(false);

	const login = async ({ email, password }) => {
		setLoading(true);
		try {
			const resp = await api.post('/login', { email, password });
			if (resp?.success) {
				setUser(resp.data);
				return { success: true };
			}
			return { success: false, message: resp?.message || 'Login failed' };
		} catch (e) {
			return { success: false, message: e.message };
		} finally {
			setLoading(false);
		}
	};

	const signup = async ({ name, email, password1, password2 }) => {
		setLoading(true);
		try {
			return await api.post('/sign-up', { name, email, password1, password2 });
		} finally {
			setLoading(false);
		}
	};

	const logout = async () => {
		try { await api.get('/logout'); } catch {}
		setUser(null);
	};

	const value = useMemo(() => ({ user, isAuthenticated: !!user, loading, login, signup, logout }), [user, loading]);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
}
