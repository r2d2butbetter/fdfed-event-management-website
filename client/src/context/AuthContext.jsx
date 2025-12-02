import React, { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(false);

	const login = async ({ email, password, role }) => {
		setLoading(true);
		console.log(' AuthContext: login called with role:', role);
		try {
			console.log(' AuthContext: Making API call to /login');
			const resp = await api.post('/login', { email, password });
			console.log(' AuthContext: API response:', resp);

			if (resp?.success) {
				// using role from backend for security
				// frontend role is just for UI flow
				const userData = resp.data;
				console.log(' AuthContext: User data received:', userData);

				const canAccessRole = (userRole, requestedRole) => {
					if (userRole === 'admin') return true; // Admin can access all roles
					if (userRole === 'organizer' && (requestedRole === 'organizer' || requestedRole === 'user')) return true;
					if (userRole === 'user' && requestedRole === 'user') return true;
					return false;
				};

				if (!canAccessRole(userData.role, role)) {
					console.log('AuthContext: Role access denied. User role:', userData.role, 'Requested:', role);
					return {
						success: false,
						message: `You don't have ${role} privileges. Your account is registered as a ${userData.role}.`
					};
				}

				console.log('AuthContext: Role verified, setting user with requested role:', role);
				// Store both the actual user role and the currently selected role
				const userWithSelectedRole = { ...userData, selectedRole: role };
				setUser(userWithSelectedRole);
				return { success: true, data: userWithSelectedRole };
			}
			console.log('AuthContext: Login failed:', resp?.message);
			return { success: false, message: resp?.message || 'Login failed' };
		} catch (e) {
			console.log('AuthContext: Exception during login:', e.message);
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
		try {
			await api.get('/logout');
		} catch (error) {
			console.error('Error during logout:', error);
		}
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
