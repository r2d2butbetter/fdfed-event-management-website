import React, { useState } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Chip,
    IconButton,
    Button,
    TextField,
    InputAdornment,
    FormControl,
    Select,
    MenuItem,
    Typography,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Skeleton,
    useMediaQuery,
    Card,
    CardContent,
    Stack,
} from '@mui/material';
import {
    Search,
    Cancel,
    Event,
    LocationOn,
    ConfirmationNumber,
    Warning,
    CheckCircle,
    Visibility,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const getStatusColor = (status) => {
    switch (status) {
        case 'upcoming':
            return 'success';
        case 'completed':
            return 'info';
        case 'cancelled':
            return 'error';
        default:
            return 'default';
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'upcoming':
            return 'Upcoming';
        case 'completed':
            return 'Completed';
        case 'cancelled':
            return 'Cancelled';
        default:
            return status;
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * BookingTable - Enhanced bookings table with filters and cancel functionality
 */
const BookingTable = ({
    bookings = [],
    loading = false,
    onCancelBooking,
}) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [ticketsToCancel, setTicketsToCancel] = useState(1);
    const [cancelLoading, setCancelLoading] = useState(false);

    // Filter bookings
    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch = booking.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.venue?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenCancelDialog = async (booking) => {
        setSelectedBooking(booking);
        setTicketsToCancel(1);
        setCancelDialogOpen(true);
    };

    const handleCloseCancelDialog = () => {
        setCancelDialogOpen(false);
        setSelectedBooking(null);
        setTicketsToCancel(1);
    };

    const handleConfirmCancel = async () => {
        if (!selectedBooking || !onCancelBooking) return;

        setCancelLoading(true);
        try {
            await onCancelBooking(selectedBooking, ticketsToCancel);
            handleCloseCancelDialog();
        } catch (error) {
            console.error('Error cancelling booking:', error);
        } finally {
            setCancelLoading(false);
        }
    };

    const getRefundInfo = (booking) => {
        if (!booking.canCancel) return null;
        return {
            percentage: booking.refundPercentage,
            amountPerTicket: booking.refundAmountPerTicket,
            totalRefund: booking.refundAmountPerTicket * ticketsToCancel,
        };
    };

    // Loading skeleton
    if (loading) {
        return (
            <Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Skeleton variant="rectangular" width={240} height={40} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: 1 }} />
                </Box>
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={72} sx={{ mb: 1, borderRadius: 1 }} />
                ))}
            </Box>
        );
    }

    // Mobile card view
    if (isMobile) {
        return (
            <Box>
                {/* Filters */}
                <Stack direction="column" spacing={2} sx={{ mb: 3 }}>
                    <TextField
                        size="small"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                        }}
                        fullWidth
                    />
                    <FormControl size="small" fullWidth>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="all">All Status</MenuItem>
                            <MenuItem value="upcoming">Upcoming</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                {/* Cards */}
                {filteredBookings.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        No bookings found matching your criteria.
                    </Alert>
                ) : (
                    <Stack spacing={2}>
                        {filteredBookings
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((booking) => (
                                <Card key={`${booking.eventId}-${booking.registrationStatus}`}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                                                {booking.title}
                                            </Typography>
                                            <Chip
                                                label={getStatusLabel(booking.status)}
                                                color={getStatusColor(booking.status)}
                                                size="small"
                                            />
                                        </Box>

                                        <Stack spacing={1} sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Event sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatDate(booking.startDateTime)} at {formatTime(booking.startDateTime)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {booking.venue}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <ConfirmationNumber sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {booking.ticketCount} ticket(s) × ${booking.price}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        {booking.canCancel && (
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                startIcon={<Cancel />}
                                                onClick={() => handleOpenCancelDialog(booking)}
                                                fullWidth
                                                sx={{ mb: 1 }}
                                            >
                                                Cancel Booking
                                            </Button>
                                        )}
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            size="small"
                                            startIcon={<Visibility />}
                                            onClick={() => navigate(`/events/${booking.eventId}`)}
                                            fullWidth
                                        >
                                            View Event
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                    </Stack>
                )}

                <TablePagination
                    component="div"
                    count={filteredBookings.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10]}
                />

                {/* Cancel Dialog */}
                <CancelBookingDialog
                    open={cancelDialogOpen}
                    booking={selectedBooking}
                    ticketsToCancel={ticketsToCancel}
                    setTicketsToCancel={setTicketsToCancel}
                    refundInfo={selectedBooking ? getRefundInfo(selectedBooking) : null}
                    onClose={handleCloseCancelDialog}
                    onConfirm={handleConfirmCancel}
                    loading={cancelLoading}
                />
            </Box>
        );
    }

    // Desktop table view
    return (
        <Box>
            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    size="small"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ minWidth: 240 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                    }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="upcoming">Upcoming</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Event</TableCell>
                            <TableCell>Date & Time</TableCell>
                            <TableCell>Venue</TableCell>
                            <TableCell align="center">Tickets</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredBookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        No bookings found matching your criteria.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredBookings
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((booking) => (
                                    <TableRow key={`${booking.eventId}-${booking.registrationStatus}`}>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {booking.title}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatDate(booking.startDateTime)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatTime(booking.startDateTime)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{booking.venue}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={booking.ticketCount}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight={600}>
                                                ${(booking.price * booking.ticketCount).toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={getStatusLabel(booking.status)}
                                                color={getStatusColor(booking.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                                <Tooltip title="View event">
                                                    <IconButton
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => navigate(`/events/${booking.eventId}`)}
                                                    >
                                                        <Visibility />
                                                    </IconButton>
                                                </Tooltip>
                                                {booking.canCancel ? (
                                                    <Tooltip title="Cancel booking">
                                                        <IconButton
                                                            color="error"
                                                            size="small"
                                                            onClick={() => handleOpenCancelDialog(booking)}
                                                        >
                                                            <Cancel />
                                                        </IconButton>
                                                    </Tooltip>
                                                ) : null}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={filteredBookings.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </TableContainer>

            {/* Cancel Dialog */}
            <CancelBookingDialog
                open={cancelDialogOpen}
                booking={selectedBooking}
                ticketsToCancel={ticketsToCancel}
                setTicketsToCancel={setTicketsToCancel}
                refundInfo={selectedBooking ? getRefundInfo(selectedBooking) : null}
                onClose={handleCloseCancelDialog}
                onConfirm={handleConfirmCancel}
                loading={cancelLoading}
            />
        </Box>
    );
};

// Cancel Booking Dialog Component
const CancelBookingDialog = ({
    open,
    booking,
    ticketsToCancel,
    setTicketsToCancel,
    refundInfo,
    onClose,
    onConfirm,
    loading,
}) => {
    if (!booking) return null;

    const maxTickets = booking.activeTicketCount || booking.ticketCount;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning color="warning" />
                    Cancel Booking
                </Box>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Are you sure you want to cancel your booking for <strong>{booking.title}</strong>?
                </Typography>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Number of tickets to cancel:
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                            value={ticketsToCancel}
                            onChange={(e) => setTicketsToCancel(e.target.value)}
                        >
                            {[...Array(maxTickets)].map((_, i) => (
                                <MenuItem key={i + 1} value={i + 1}>
                                    {i + 1} ticket{i > 0 ? 's' : ''}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {refundInfo && (
                    <Alert
                        severity={refundInfo.percentage === 100 ? 'success' : refundInfo.percentage > 0 ? 'warning' : 'error'}
                        icon={refundInfo.percentage > 0 ? <CheckCircle /> : <Warning />}
                        sx={{ mb: 2 }}
                    >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Refund Policy
                        </Typography>
                        <Typography variant="body2">
                            {refundInfo.percentage === 100 && 'Full refund available (more than 7 days before event)'}
                            {refundInfo.percentage === 50 && '50% refund available (3-7 days before event)'}
                            {refundInfo.percentage === 0 && 'No refund available (less than 3 days before event)'}
                        </Typography>
                        {refundInfo.percentage > 0 && (
                            <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                                Refund amount: ${refundInfo.totalRefund.toFixed(2)} ({refundInfo.percentage}%)
                            </Typography>
                        )}
                    </Alert>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button onClick={onClose} disabled={loading}>
                    Keep Booking
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={onConfirm}
                    disabled={loading}
                >
                    {loading ? 'Cancelling...' : 'Confirm Cancellation'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BookingTable;
