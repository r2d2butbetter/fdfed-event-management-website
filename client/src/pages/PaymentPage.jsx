import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import {
    Box,
    Container,
    Grid,
    Typography,
    CardContent,
    Button,
    TextField,
    Alert,
    Snackbar,
    Stack,
    Divider,
    Paper
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

const checkoutSchema = Yup.object().shape({
    leadEmail: Yup.string()
        .email('Invalid email address')
        .required('Email address is required')
});

function formatDate(dateStr) {
    try {
        const d = new Date(dateStr);
        return d.toLocaleString();
    } catch {
        return dateStr;
    }
}

function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

function PaymentPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [paymentData, setPaymentData] = useState(null);
    const [ticketsLeft, setTicketsLeft] = useState(null);
    const [ticketQuantity, setTicketQuantity] = useState(1);
    const [additionalEmails, setAdditionalEmails] = useState([]);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
    const [isProcessing, setIsProcessing] = useState(false);

    const imageUrl = useMemo(() => {
        if (!paymentData?.event?.image) return '';
        return (paymentData.event.image?.startsWith('http') ? paymentData.event.image : `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:3000')}`}/${paymentData.event.image}`);
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
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                throw new Error('Unable to load Razorpay checkout. Please check your internet connection and retry.');
            }

            const createOrderResponse = await api.post('/payments/create-order', {
                eventId: id,
                tickets: ticketQuantity,
                leadEmail: values.leadEmail,
                additionalEmails: additionalEmails.filter(email => email.trim() !== '')
            });

            if (!createOrderResponse?.success || !createOrderResponse?.order?.id) {
                throw new Error('Failed to initialize Razorpay order.');
            }

            const checkoutResult = await new Promise((resolve, reject) => {
                const options = {
                    key: createOrderResponse.key,
                    amount: createOrderResponse.order.amount,
                    currency: createOrderResponse.order.currency,
                    name: 'Event Management',
                    description: `Tickets for ${event.title}`,
                    order_id: createOrderResponse.order.id,
                    method: {
                        upi: true,
                        card: true,
                        netbanking: true,
                        wallet: true,
                        paylater: true
                    },
                    prefill: {
                        name: values.leadName,
                        email: values.leadEmail
                    },
                    notes: {
                        eventId: id,
                        tickets: String(ticketQuantity)
                    },
                    theme: {
                        color: '#1d4ed8'
                    },
                    modal: {
                        ondismiss: () => reject(new Error('Payment cancelled by user'))
                    },
                    handler: async function (razorpayResponse) {
                        try {
                            const verifyResponse = await api.post('/payments/verify-payment', {
                                eventId: id,
                                leadEmail: values.leadEmail,
                                additionalEmails: additionalEmails.filter(email => email.trim() !== ''),
                                razorpayOrderId: razorpayResponse.razorpay_order_id,
                                razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                                razorpaySignature: razorpayResponse.razorpay_signature
                            });
                            resolve(verifyResponse);
                        } catch (verifyError) {
                            reject(verifyError);
                        }
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    reject(new Error(response?.error?.description || 'Payment failed on Razorpay.'));
                });
                rzp.open();
            });

            setToast({ open: true, message: 'Payment successful! Registration confirmed.', severity: 'success' });
            setTicketsLeft(checkoutResult.ticketsLeft);
            resetForm();
            setTimeout(() => {
                navigate('/user/dashboard');
            }, 2000);
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
                                            INR {Number(event.ticketPrice || 0).toFixed(2)}
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

                                <Formik
                                    initialValues={{
                                        leadEmail: user?.email || ''
                                    }}
                                    enableReinitialize
                                    validationSchema={checkoutSchema}
                                    onSubmit={handlePaymentSubmit}
                                >
                                    {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                                        <Form>
                                            <Stack spacing={3}>
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
                                                />

                                                <Alert severity="info">
                                                    Choose UPI/Card/NetBanking directly in Razorpay Checkout.
                                                </Alert>

                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    size="large"
                                                    fullWidth
                                                    disabled={isSubmitting || isProcessing || ticketsLeft < ticketQuantity}
                                                >
                                                    {isProcessing ? 'Processing Payment...' : `Pay INR ${(Number(event.ticketPrice || 0) * ticketQuantity).toFixed(2)}`}
                                                </Button>
                                            </Stack>
                                        </Form>
                                    )}
                                </Formik>
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
                                                INR {Number(event.ticketPrice || 0).toFixed(2)}
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
                                        INR {(Number(event.ticketPrice || 0) * ticketQuantity).toFixed(2)}
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
