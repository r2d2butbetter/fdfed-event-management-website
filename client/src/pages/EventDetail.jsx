import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { api } from '../api/client';
import {
	Box, Container, Grid, Typography, Chip, Button, Card, CardMedia, CardContent, Stack, TextField, Snackbar, Alert
} from '@mui/material';

function formatDate(dateStr) {
	try {
		const d = new Date(dateStr);
		return d.toLocaleString();
	} catch { return dateStr; }
}

function EventDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [event, setEvent] = useState(null);
	const [related, setRelated] = useState([]);
	const [ticketsLeft, setTicketsLeft] = useState(null);
	const [saved, setSaved] = useState(false);
	const [tickets, setTickets] = useState(1);
	const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

	const imageUrl = useMemo(() => {
		if (!event?.image) return '';
		// server serves uploads statically
		return `http://localhost:3000/${event.image}`;
	}, [event]);

	useEffect(() => {
		let mounted = true;
		async function load() {
			try {
				const resp = await api.get(`/events/${id}`);
				if (!mounted) return;
				setEvent(resp.data.event);
				setRelated(resp.data.relatedEvents || []);
				setTicketsLeft(resp.data.event.ticketsLeft);
			} catch (e) {
				setToast({ open: true, message: e.message || 'Failed to load event', severity: 'error' });
			}
			try {
				const savedResp = await api.get(`/user/check-saved-status?eventId=${id}`);
				if (!mounted) return;
				if (savedResp?.success) {
					setSaved(!!savedResp.isSaved);
				}
			} catch (error) {
				console.error('Error checking saved status:', error);
			}
		}
		load();
		return () => { mounted = false; };
	}, [id]);

	const handleSaveToggle = async () => {
		try {
			if (!saved) {
				const resp = await api.post('/user/save-event', { eventId: id });
				if (resp?.success) {
					setSaved(true);
					setToast({ open: true, message: 'Saved', severity: 'success' });
				}
			} else {
				const resp = await api.post('/user/unsave-event', { eventId: id });
				if (resp?.success) {
					setSaved(false);
					setToast({ open: true, message: 'Removed from saved', severity: 'info' });
				}
			}
		} catch (e) {
			if ((e.message || '').toLowerCase().includes('unauthorized') || (e.message || '').includes('log in')) {
				navigate('/login');
				return;
			}
			setToast({ open: true, message: e.message || 'Failed', severity: 'error' });
		}
	};

	const handleRegister = async () => {
		try {
			const resp = await api.post('/payments/process-payment', { eventId: id, tickets });
			if (resp?.success) {
				setTicketsLeft((prev) => (typeof prev === 'number' ? Math.max(prev - tickets, 0) : prev));
				setToast({ open: true, message: 'Registration successful', severity: 'success' });
			}
		} catch (e) {
			if ((e.message || '').toLowerCase().includes('unauthorized')) {
				navigate('/login');
				return;
			}
			setToast({ open: true, message: e.message || 'Registration failed', severity: 'error' });
		}
	};

	if (!event) {
		return <Container sx={{ py: 6 }}><Typography>Loading...</Typography></Container>;
	}

	return (
		<Container sx={{ py: 6 }}>
			<Grid container spacing={4}>
				<Grid item xs={12} md={6}>
					<Card sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: '#111' }}>
						{imageUrl && <CardMedia component="img" image={imageUrl} alt={event.title} />}
					</Card>
				</Grid>
				<Grid item xs={12} md={6}>
					<Typography variant="h2" sx={{ fontWeight: 800, color: '#b47bff', mb: 1 }}>
						{event.title}
					</Typography>
					<Chip label={(event.category || '').toUpperCase()} sx={{ bgcolor: '#6a35b7', color: '#fff', mb: 3 }} />
					<Stack spacing={2} sx={{ mb: 3 }}>
						<Typography><b>Start:</b> {formatDate(event.startDateTime)}</Typography>
						<Typography><b>End:</b> {formatDate(event.endDateTime)}</Typography>
						<Typography><b>Venue:</b> {event.venue}</Typography>
						<Typography><b>Price:</b> ${Number(event.ticketPrice || 0).toFixed(2)}</Typography>
						<Typography><b>Capacity:</b> {event.capacity}</Typography>
						<Typography><b>Status:</b> {event.status}</Typography>
						<Typography><b>Tickets left:</b> {ticketsLeft ?? '-'}</Typography>
					</Stack>
					<Stack direction="row" spacing={2} alignItems="center">
						<Button onClick={handleRegister} variant="contained" sx={{ px: 4, py: 1.5, background: 'linear-gradient(90deg,#ff4d7e,#ff7eb3)' }}>
							REGISTER NOW
						</Button>
						<Button onClick={handleSaveToggle} variant="contained" sx={{ px: 4, py: 1.5, background: '#6a35b7' }}>
							{saved ? 'SAVED' : 'SAVE'}
						</Button>
						<TextField
							type="number"
							label="Tickets"
							size="small"
							value={tickets}
							onChange={(e) => setTickets(Math.max(1, Number(e.target.value) || 1))}
							sx={{ width: 120 }}
						/>
					</Stack>
				</Grid>
			</Grid>

			<Box sx={{ mt: 6 }}>
				<Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>About This Event</Typography>
				<Typography sx={{ maxWidth: 900 }}>{event.description}</Typography>
			</Box>

			<Box sx={{ mt: 6 }}>
				<Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Related Events</Typography>
				<Grid container spacing={3}>
					{related.map((ev) => (
						<Grid item xs={12} sm={6} md={3} key={ev._id}>
							<Card
								component={RouterLink}
								to={`/events/${ev._id}`}
								sx={{
									textDecoration: 'none',
									borderRadius: 3,
									height: '100%',
									width: '100%',
									display: 'flex',
									flexDirection: 'column',
									transition: 'transform 0.2s',
									'&:hover': {
										transform: 'translateY(-4px)'
									}
								}}
							>
								{ev.image && (
									<CardMedia
										component="img"
										image={`http://localhost:3000/${ev.image}`}
										alt={ev.title}
										sx={{
											width: '100%',
											height: 200,
											objectFit: 'cover'
										}}
									/>
								)}
								<CardContent sx={{ flexGrow: 1 }}>
									<Typography sx={{ fontWeight: 700 }}>{ev.title}</Typography>
								</CardContent>
							</Card>
						</Grid>
					))}
				</Grid>
			</Box>

			<Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
				<Alert severity={toast.severity} variant="filled" sx={{ width: '100%' }}>{toast.message}</Alert>
			</Snackbar>
		</Container>
	);
}

export default EventDetail;
