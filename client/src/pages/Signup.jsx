import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Signup() {
	const [form, setForm] = useState({ name: '', email: '', password1: '', password2: '' });
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const { signup, loading } = useAuth();
	const navigate = useNavigate();

	const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const onSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		try {
			const resp = await signup(form);
			if (resp?.success) {
				setSuccess('Account created! Please log in.');
				setTimeout(() => navigate('/login'), 1200);
			} else {
				setError(resp?.message || 'Sign up failed');
			}
		} catch (err) {
			setError(err.message || 'Sign up failed');
		}
	};

	return (
		<Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
			<Paper elevation={3} sx={{ p: 5, width: 600, borderRadius: 4 }}>
				<Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Create your account</Typography>
				<Box component="form" onSubmit={onSubmit}>
					<TextField fullWidth label="Name" name="name" value={form.name} onChange={onChange} sx={{ mb: 2 }} />
					<TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={onChange} sx={{ mb: 2 }} />
					<TextField fullWidth label="Password" name="password1" type="password" value={form.password1} onChange={onChange} sx={{ mb: 2 }} />
					<TextField fullWidth label="Confirm Password" name="password2" type="password" value={form.password2} onChange={onChange} sx={{ mb: 3 }} />
					{error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
					{success && <Typography color="primary" sx={{ mb: 2 }}>{success}</Typography>}
					<Button type="submit" variant="contained" disabled={loading} sx={{ px: 4 }}>
						Sign Up
					</Button>
				</Box>
			</Paper>
		</Box>
	);
}

export default Signup;
