import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
	const { user, isAuthenticated, logout } = useAuth();
	const navigate = useNavigate();
	const [anchorEl, setAnchorEl] = useState(null);

	// Determine where "Host with Us" should navigate
	const handleHostWithUs = () => {
		if (isAuthenticated && user?.role === 'organizer' || user?.role === 'admin') {
			// User is already an organizer, go to dashboard
			navigate('/organizer/dashboard');
		} else {
			// User is not an organizer or not logged in, go to become organizer form
			navigate('/become-organizer');
		}
	};

	const handleLogout = async () => {
		handleMenuClose();
		await logout();
		navigate('/');
	};

	const handleMenuOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleDashboard = () => {
		handleMenuClose();
		// Everyone goes to user dashboard (organizers are also users)
		navigate('/user/dashboard');
	};

	return (
		<AppBar position="static" color="default" sx={{ backgroundColor: '#0b0b0b' }}>
			<Toolbar sx={{ gap: 2 }}>
				<Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, color: '#fff', textDecoration: 'none', fontWeight: 800 }}>
					NIGHT LIFE
				</Typography>
				<Box sx={{ display: 'flex', gap: 2 }}>
					<Button component={RouterLink} to="/" sx={{ color: '#fff' }}>Home</Button>
					<Button component={RouterLink} to="/categories/concerts" sx={{ color: '#fff' }}>Categories</Button>
					<Button component={RouterLink} to="/contact-us" sx={{ color: '#fff' }}>Contact Us</Button>
					<Button onClick={handleHostWithUs} sx={{ color: '#fff' }}>Host with Us</Button>
				</Box>
				<Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
					{!isAuthenticated ? (
						<>
							<Button component={RouterLink} to="/signup" variant="contained" sx={{ background: 'linear-gradient(90deg,#7b2cff,#b06cff)' }}>
								Sign Up
							</Button>
							<Button component={RouterLink} to="/login" variant="contained" sx={{ backgroundColor: '#6a35b7' }}>
								Log in
							</Button>
						</>
					) : (
						<>
							<IconButton
								onClick={handleMenuOpen}
								sx={{
									color: '#fff',
									border: '2px solid #9353d3',
									'&:hover': {
										backgroundColor: 'rgba(147, 83, 211, 0.1)',
									},
								}}
							>
								<AccountCircle />
							</IconButton>
							<Menu
								anchorEl={anchorEl}
								open={Boolean(anchorEl)}
								onClose={handleMenuClose}
								anchorOrigin={{
									vertical: 'bottom',
									horizontal: 'right',
								}}
								transformOrigin={{
									vertical: 'top',
									horizontal: 'right',
								}}
								PaperProps={{
									sx: {
										mt: 1,
										background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(22, 33, 62, 0.98) 100%)',
										backdropFilter: 'blur(10px)',
										border: '1px solid rgba(147, 83, 211, 0.3)',
										borderRadius: 2,
										minWidth: 180,
									},
								}}
							>
								<MenuItem
									onClick={handleDashboard}
									sx={{
										color: '#fff',
										'&:hover': {
											backgroundColor: 'rgba(147, 83, 211, 0.2)',
										},
									}}
								>
									Dashboard
								</MenuItem>
								<MenuItem
									onClick={handleLogout}
									sx={{
										color: '#f43f5e',
										'&:hover': {
											backgroundColor: 'rgba(244, 63, 94, 0.1)',
										},
									}}
								>
									Logout
								</MenuItem>
							</Menu>
						</>
					)}
				</Box>
			</Toolbar>
		</AppBar>
	);
}

export default Navbar;