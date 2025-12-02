import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import {
    Box,
    Container,
    Grid,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Button,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Alert,
    Snackbar,
    Stack,
    Divider,
    Paper
} from '@mui/material';
import { CreditCard, AccountBalance } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

// Validation schemas for different payment methods
const cardSchema = Yup.object().shape({
    leadName: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Lead guest name is required'),
    leadEmail: Yup.string()
        .email('Invalid email address')
        .required('Email address is required'),
    cardNumber: Yup.string()
        .matches(/^[0-9]{16}$/, 'Card number must be 16 digits')
        .required('Card number is required'),
    cardName: Yup.string()
        .min(3, 'Name must be at least 3 characters')
        .required('Cardholder name is required'),
    cardExpiry: Yup.string()
        .matches(/^[0-9]{4}$/, 'Expiry date must be 4 digits (MMYY)')
        .required('Expiry date is required')
        .test('valid-month', 'Month must be between 01 and 12', function (value) {
            if (!value || value.length < 2) return false;
            const month = parseInt(value.substring(0, 2), 10);
            return month >= 1 && month <= 12;
        })
        .test('not-expired', 'Card has expired', function (value) {
            if (!value || value.length !== 4) return false;
            const month = parseInt(value.substring(0, 2), 10);
            const year = parseInt(value.substring(2, 4), 10);
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
            const currentMonth = currentDate.getMonth() + 1; // 0-indexed

            if (year < currentYear) return false;
            if (year === currentYear && month < currentMonth) return false;
            return true;
        }),
    cardCvv: Yup.string()
        .matches(/^[0-9]{3}$/, 'CVV must be 3 digits')
        .required('CVV is required'),
    tickets: Yup.number()
        .integer('Tickets must be a whole number')
        .min(1, 'At least 1 ticket required')
        .required('Number of tickets is required')
});

const upiSchema = Yup.object().shape({
    leadName: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Lead guest name is required'),
    leadEmail: Yup.string()
        .email('Invalid email address')
        .required('Email address is required'),
    upiId: Yup.string()
        .matches(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, 'Invalid UPI ID format (e.g., user@bank)')
        .required('UPI ID is required'),
    tickets: Yup.number()
        .integer('Tickets must be a whole number')
        .min(1, 'At least 1 ticket required')
        .required('Number of tickets is required')
});

function formatDate(dateStr) {
    try {
        const d = new Date(dateStr);
        return d.toLocaleString();
    } catch {
        return dateStr;
    }
}

// Format card number with spaces every 4 digits
function formatCardNumber(value) {
    if (!value) return '';
    const v = String(value).replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
        return parts.join(' ');
    }
    return v;
}

// Format expiry date with auto-slash (MM/YY)
function formatExpiryDate(value) {
    if (!value) return '';
    const v = String(value).replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
        return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
}

function PaymentPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [paymentData, setPaymentData] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [ticketsLeft, setTicketsLeft] = useState(null);
    const [ticketQuantity, setTicketQuantity] = useState(1);
    const [additionalEmails, setAdditionalEmails] = useState([]);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
    const [isProcessing, setIsProcessing] = useState(false);

    const imageUrl = useMemo(() => {
        if (!paymentData?.event?.image) return '';
        return `http://localhost:3000/${paymentData.event.image}`;
    }, [paymentData]);

    // Fetch initial payment data
    useEffect(() => {
        let mounted = true;
        async function loadPaymentData() {
            try {
                const resp = await api.get(`/payments/${id}`);
                if (!mounted) return;
                if (resp?.success) {
                    setPaymentData(resp.data);
                    setTicketsLeft(resp.data.ticketsLeft);
                } else {
                    setToast({ open: true, message: 'Failed to load payment data', severity: 'error' });
                }
            } catch (e) {
                if (!mounted) return;
                if ((e.message || '').toLowerCase().includes('unauthorized') || (e.message || '').includes('log in')) {
                    navigate('/login');
                    return;
                }
                setToast({ open: true, message: e.message || 'Failed to load event', severity: 'error' });
            }
        }
        loadPaymentData();
        return () => { mounted = false; };
    }, [id, navigate]);

    // Auto-update tickets left every 5 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const resp = await api.get(`/payments/events/${id}/tickets-left`);
                if (resp?.ticketsLeft !== undefined) {
                    setTicketsLeft(resp.ticketsLeft);
                }
            } catch (e) {
                console.error('Failed to update tickets:', e);
            }
        }, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, [id]);

    const handlePaymentSubmit = async (values, { setSubmitting, resetForm }) => {
        // Validate additional emails before submission
        const invalidEmails = additionalEmails.filter(email => {
            const trimmed = email.trim();
            return trimmed !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
        });

        if (invalidEmails.length > 0) {
            setToast({ open: true, message: 'Please fix invalid email addresses before submitting', severity: 'error' });
            setSubmitting(false);
            return;
        }

        setIsProcessing(true);
        try {
            const resp = await api.post('/payments/process-payment', {
                eventId: id,
                tickets: values.tickets,
                paymentMethod,
                leadName: values.leadName,
                leadEmail: values.leadEmail,
                additionalEmails: additionalEmails.filter(email => email.trim() !== ''),
                ...(paymentMethod === 'card' ? {
                    cardNumber: values.cardNumber,
                    cardName: values.cardName,
                    cardExpiry: values.cardExpiry,
                    cardCvv: values.cardCvv
                } : {
                    upiId: values.upiId
                })
            });

            if (resp?.success) {
                setToast({ open: true, message: 'Payment successful! Registration confirmed.', severity: 'success' });
                setTicketsLeft(resp.ticketsLeft);
                resetForm();
                // Navigate to user dashboard after 2 seconds
                setTimeout(() => {
                    navigate('/user/dashboard');
                }, 2000);
            } else {
                setToast({ open: true, message: 'Payment failed. Please try again.', severity: 'error' });
            }
        } catch (e) {
            if ((e.message || '').toLowerCase().includes('unauthorized')) {
                navigate('/login');
                return;
            }
            setToast({ open: true, message: e.message || 'Payment processing failed', severity: 'error' });
        } finally {
            setIsProcessing(false);
            setSubmitting(false);
        }
    };

    if (!paymentData) {
        return (
            <Container sx={{ py: 6 }}>
                <Typography>Loading payment information...</Typography>
            </Container>
        );
    }

    const { event, user } = paymentData;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
                    Checkout
                </Typography>

                <Grid container spacing={3}>
                    {/* Main Content */}
                    <Grid item xs={12} md={7}>
                        <Paper elevation={1} sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Order Summary
                                </Typography>

                                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                    {imageUrl && (
                                        <Box
                                            component="img"
                                            src={imageUrl}
                                            alt={event.title}
                                            sx={{
                                                width: 120,
                                                height: 120,
                                                objectFit: 'cover',
                                                borderRadius: 1
                                            }}
                                        />
                                    )}
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            {event.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatDate(event.startDateTime)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {event.venue}
                                        </Typography>
                                        <Typography variant="body2" color="success.main" sx={{ mt: 1, fontWeight: 500 }}>
                                            {ticketsLeft ?? '-'} tickets available
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Price
                                        </Typography>
                                        <Typography variant="h6">
                                            ${Number(event.ticketPrice || 0).toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Paper>

                        <Paper elevation={1}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Payment Details
                                </Typography>

                                <ToggleButtonGroup
                                    value={paymentMethod}
                                    exclusive
                                    onChange={(event, newMethod) => {
                                        if (newMethod !== null) {
                                            setPaymentMethod(newMethod);
                                        }
                                    }}
                                    fullWidth
                                    sx={{ mt: 2, mb: 3 }}
                                >
                                    <ToggleButton value="card">
                                        <CreditCard sx={{ mr: 1 }} />
                                        Card
                                    </ToggleButton>
                                    <ToggleButton value="upi">
                                        <AccountBalance sx={{ mr: 1 }} />
                                        UPI
                                    </ToggleButton>
                                </ToggleButtonGroup>

                                {/* Payment Forms */}
                                {paymentMethod === 'card' ? (
                                    <Formik
                                        initialValues={{
                                            leadName: user?.name || '',
                                            leadEmail: user?.email || '',
                                            cardNumber: '',
                                            cardName: '',
                                            cardExpiry: '',
                                            cardCvv: '',
                                            tickets: ticketQuantity
                                        }}
                                        enableReinitialize
                                        validationSchema={cardSchema}
                                        onSubmit={handlePaymentSubmit}
                                    >
                                        {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => (
                                            <Form>
                                                <Stack spacing={3}>
                                                    <TextField
                                                        fullWidth
                                                        label="Lead Guest Name"
                                                        name="leadName"
                                                        value={values.leadName}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={touched.leadName && Boolean(errors.leadName)}
                                                        helperText={touched.leadName && errors.leadName}
                                                    />

                                                    <TextField
                                                        fullWidth
                                                        label="Email Address"
                                                        name="leadEmail"
                                                        type="email"
                                                        value={values.leadEmail}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={touched.leadEmail && Boolean(errors.leadEmail)}
                                                        helperText={touched.leadEmail && errors.leadEmail}
                                                        disabled
                                                    />

                                                    <TextField
                                                        fullWidth
                                                        label="Card Number"
                                                        name="cardNumber"
                                                        value={formatCardNumber(values.cardNumber)}
                                                        onChange={(e) => {
                                                            const rawValue = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                                                            setFieldValue('cardNumber', rawValue);
                                                        }}
                                                        onBlur={handleBlur}
                                                        error={touched.cardNumber && Boolean(errors.cardNumber)}
                                                        helperText={touched.cardNumber && errors.cardNumber}
                                                        placeholder="1234 5678 9012 3456"
                                                        inputProps={{ maxLength: 19 }}
                                                    />

                                                    <TextField
                                                        fullWidth
                                                        label="Cardholder Name"
                                                        name="cardName"
                                                        value={values.cardName}
                                                        onChange={(e) => {
                                                            const alphabeticValue = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                                            setFieldValue('cardName', alphabeticValue);
                                                        }}
                                                        onBlur={handleBlur}
                                                        error={touched.cardName && Boolean(errors.cardName)}
                                                        helperText={touched.cardName && errors.cardName}
                                                        placeholder="JOHN DOE"
                                                    />

                                                    <Grid container spacing={2}>
                                                        <Grid item xs={6}>
                                                            <TextField
                                                                fullWidth
                                                                label="Expiry Date"
                                                                name="cardExpiry"
                                                                value={formatExpiryDate(values.cardExpiry)}
                                                                onChange={(e) => {
                                                                    const rawValue = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                                                                    setFieldValue('cardExpiry', rawValue);
                                                                }}
                                                                onBlur={handleBlur}
                                                                error={touched.cardExpiry && Boolean(errors.cardExpiry)}
                                                                helperText={touched.cardExpiry && errors.cardExpiry}
                                                                placeholder="MM/YY"
                                                                inputProps={{ maxLength: 5 }}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <TextField
                                                                fullWidth
                                                                label="CVV"
                                                                name="cardCvv"
                                                                type="password"
                                                                value={values.cardCvv}
                                                                onChange={(e) => {
                                                                    const numericValue = e.target.value.replace(/[^0-9]/gi, '');
                                                                    setFieldValue('cardCvv', numericValue);
                                                                }}
                                                                onBlur={handleBlur}
                                                                error={touched.cardCvv && Boolean(errors.cardCvv)}
                                                                helperText={touched.cardCvv && errors.cardCvv}
                                                                placeholder="123"
                                                                inputProps={{ maxLength: 3 }}
                                                            />
                                                        </Grid>
                                                    </Grid>

                                                    <Alert severity="info">
                                                        This is a demo payment. No actual charges will be made.
                                                    </Alert>

                                                    <Button
                                                        type="submit"
                                                        variant="contained"
                                                        size="large"
                                                        fullWidth
                                                        disabled={isSubmitting || isProcessing || ticketsLeft < ticketQuantity}
                                                    >
                                                        {isProcessing ? 'Processing Payment...' : `Pay $${(Number(event.ticketPrice || 0) * ticketQuantity).toFixed(2)}`}
                                                    </Button>
                                                </Stack>
                                            </Form>
                                        )}
                                    </Formik>
                                ) : (
                                    <Formik
                                        initialValues={{
                                            leadName: user?.name || '',
                                            leadEmail: user?.email || '',
                                            upiId: '',
                                            tickets: ticketQuantity
                                        }}
                                        enableReinitialize
                                        validationSchema={upiSchema}
                                        onSubmit={handlePaymentSubmit}
                                    >
                                        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                                            <Form>
                                                <Stack spacing={3}>
                                                    <TextField
                                                        fullWidth
                                                        label="Lead Guest Name"
                                                        name="leadName"
                                                        value={values.leadName}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={touched.leadName && Boolean(errors.leadName)}
                                                        helperText={touched.leadName && errors.leadName}
                                                    />

                                                    <TextField
                                                        fullWidth
                                                        label="Email Address"
                                                        name="leadEmail"
                                                        type="email"
                                                        value={values.leadEmail}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={touched.leadEmail && Boolean(errors.leadEmail)}
                                                        helperText={touched.leadEmail && errors.leadEmail}
                                                        disabled
                                                    />

                                                    <TextField
                                                        fullWidth
                                                        label="UPI ID"
                                                        name="upiId"
                                                        value={values.upiId}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={touched.upiId && Boolean(errors.upiId)}
                                                        helperText={touched.upiId && errors.upiId}
                                                        placeholder="username@bank"
                                                    />

                                                    <Alert severity="info">
                                                        This is a demo payment. No actual charges will be made.
                                                    </Alert>

                                                    <Button
                                                        type="submit"
                                                        variant="contained"
                                                        size="large"
                                                        fullWidth
                                                        disabled={isSubmitting || isProcessing || ticketsLeft < ticketQuantity}
                                                    >
                                                        {isProcessing ? 'Processing Payment...' : `Pay $${(Number(event.ticketPrice || 0) * ticketQuantity).toFixed(2)}`}
                                                    </Button>
                                                </Stack>
                                            </Form>
                                        )}
                                    </Formik>
                                )}
                            </CardContent>
                        </Paper>
                    </Grid>

                    {/* Order Summary Sidebar */}
                    <Grid item xs={12} md={5}>
                        <Paper elevation={1} sx={{ position: 'sticky', top: 16 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Order Details
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                <Stack spacing={2}>
                                    <Box>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">
                                                Ticket Price
                                            </Typography>
                                            <Typography variant="body2">
                                                ${Number(event.ticketPrice || 0).toFixed(2)}
                                            </Typography>
                                        </Stack>
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Quantity
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                                                disabled={ticketQuantity <= 1}
                                            >
                                                -
                                            </Button>
                                            <Typography variant="body1" sx={{ minWidth: 40, textAlign: 'center' }}>
                                                {ticketQuantity}
                                            </Typography>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => setTicketQuantity(Math.min(ticketsLeft, ticketQuantity + 1))}
                                                disabled={ticketQuantity >= ticketsLeft}
                                            >
                                                +
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Stack>

                                <Divider sx={{ my: 2 }} />

                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1">
                                        Total
                                    </Typography>
                                    <Typography variant="h6" color="primary">
                                        ${(Number(event.ticketPrice || 0) * ticketQuantity).toFixed(2)}
                                    </Typography>
                                </Stack>

                                <Divider sx={{ my: 2 }} />

                                <Typography variant="subtitle2" gutterBottom>
                                    Additional Email Recipients
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                                    Add email addresses to receive tickets and confirmations
                                </Typography>
                                <Stack spacing={2}>
                                    {additionalEmails.map((email, index) => {
                                        const isInvalid = email.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                                        return (
                                            <Stack key={index} direction="row" spacing={1}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => {
                                                        const newEmails = [...additionalEmails];
                                                        newEmails[index] = e.target.value;
                                                        setAdditionalEmails(newEmails);
                                                    }}
                                                    placeholder="email@example.com"
                                                    error={isInvalid}
                                                    helperText={isInvalid ? 'Invalid email format' : ''}
                                                />
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() => {
                                                        setAdditionalEmails(additionalEmails.filter((_, i) => i !== index));
                                                    }}
                                                    sx={{ minWidth: 'auto' }}
                                                >
                                                    Remove
                                                </Button>
                                            </Stack>
                                        );
                                    })}
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => setAdditionalEmails([...additionalEmails, ''])}
                                    >
                                        + Add Email
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Paper>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button
                        variant="text"
                        onClick={() => navigate(`/events/${id}`)}
                    >
                        ← Back to Event
                    </Button>
                </Box>

                <Snackbar
                    open={toast.open}
                    autoHideDuration={4000}
                    onClose={() => setToast({ ...toast, open: false })}
                >
                    <Alert severity={toast.severity} sx={{ width: '100%' }}>
                        {toast.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
}

export default PaymentPage;
