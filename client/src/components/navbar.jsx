import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { Link as RouterLink } from 'react-router-dom';

function Navbar() {
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
					<Button component={RouterLink} to="/become-organizer" sx={{ color: '#fff' }}>Host with Us</Button>
				</Box>
				<Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
					<Button component={RouterLink} to="/signup" variant="contained" sx={{ background: 'linear-gradient(90deg,#7b2cff,#b06cff)' }}>
						Sign Up
					</Button>
					<Button component={RouterLink} to="/login" variant="contained" sx={{ backgroundColor: '#6a35b7' }}>
						Log in
					</Button>
				</Box>
			</Toolbar>
		</AppBar>
	);
}

export default Navbar;