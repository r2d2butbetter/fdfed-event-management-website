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
    Typography,
    TextField,
    FormControl,
    Select,
    MenuItem,
    InputAdornment,
    Collapse,
    IconButton,
    Skeleton,
    Alert,
    useMediaQuery,
    Card,
    CardContent,
    Stack,
    Divider,
} from '@mui/material';
import {
    Search,
    KeyboardArrowDown,
    KeyboardArrowUp,
    Receipt,
    Event,
    ConfirmationNumber,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const getStatusConfig = (status) => {
    switch (status) {
        case 'completed':
            return { label: 'Completed', color: 'success' };
        case 'refunded':
            return { label: 'Refunded', color: 'error' };
        case 'partial_refund':
            return { label: 'Partial Refund', color: 'warning' };
        default:
            return { label: status, color: 'default' };
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * PaymentHistoryTable - Table component for viewing payment/transaction history
 */
const PaymentHistoryTable = ({
    payments = [],
    loading = false,
    pagination,
    onPageChange,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Filter payments
    const filteredPayments = payments.filter((payment) => {
        const matchesSearch = payment.eventTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleToggleExpand = (paymentId) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(paymentId)) {
            newExpanded.delete(paymentId);
        } else {
            newExpanded.add(paymentId);
        }
        setExpandedRows(newExpanded);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        if (onPageChange) {
            onPageChange(newPage + 1); // API uses 1-based pages
        }
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Loading skeleton
    if (loading) {
        return (
            <Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Skeleton variant="rectangular" width={240} height={40} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: 1 }} />
                </Box>
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 1 }} />
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
                        placeholder="Search by event or transaction ID..."
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
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="refunded">Refunded</MenuItem>
                            <MenuItem value="partial_refund">Partial Refund</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                {/* Cards */}
                {filteredPayments.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        No transactions found matching your criteria.
                    </Alert>
                ) : (
                    <Stack spacing={2}>
                        {filteredPayments
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((payment) => {
                                const statusConfig = getStatusConfig(payment.status);
                                return (
                                    <Card key={payment._id}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {payment.transactionId}
                                                </Typography>
                                                <Chip
                                                    label={statusConfig.label}
                                                    color={statusConfig.color}
                                                    size="small"
                                                />
                                            </Box>

                                            <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
                                                {payment.eventTitle}
                                            </Typography>

                                            <Stack spacing={1}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2" color="text.secondary">Date</Typography>
                                                    <Typography variant="body2">{formatDate(payment.paymentDate)}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2" color="text.secondary">Tickets</Typography>
                                                    <Typography variant="body2">{payment.tickets}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2" color="text.secondary">Total Paid</Typography>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        ${payment.totalPrice.toFixed(2)}
                                                    </Typography>
                                                </Box>
                                                {payment.refundAmount > 0 && (
                                                    <>
                                                        <Divider />
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="body2" color="error.main">Refunded</Typography>
                                                            <Typography variant="body2" color="error.main">
                                                                -${payment.refundAmount.toFixed(2)}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="body2" color="text.secondary">Net Amount</Typography>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                ${payment.netAmount.toFixed(2)}
                                                            </Typography>
                                                        </Box>
                                                    </>
                                                )}
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                    </Stack>
                )}

                <TablePagination
                    component="div"
                    count={pagination?.totalCount || filteredPayments.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10]}
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
                    placeholder="Search by event or transaction ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ minWidth: 280 }}
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
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="refunded">Refunded</MenuItem>
                        <MenuItem value="partial_refund">Partial Refund</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell width={50} />
                            <TableCell>Transaction ID</TableCell>
                            <TableCell>Event</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell align="center">Tickets</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell align="center">Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPayments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Receipt sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                        <Typography color="text.secondary">
                                            No transactions found matching your criteria.
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPayments
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((payment) => {
                                    const statusConfig = getStatusConfig(payment.status);
                                    const isExpanded = expandedRows.has(payment._id);
                                    const hasRefund = payment.refundAmount > 0;

                                    return (
                                        <React.Fragment key={payment._id}>
                                            <TableRow sx={{ '& > *': { borderBottom: isExpanded ? 'unset' : undefined } }}>
                                                <TableCell>
                                                    {hasRefund && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleToggleExpand(payment._id)}
                                                        >
                                                            {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                                        </IconButton>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                        {payment.transactionId}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {payment.eventTitle}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDate(payment.eventDate)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {formatDate(payment.paymentDate)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        icon={<ConfirmationNumber sx={{ fontSize: 16 }} />}
                                                        label={payment.tickets}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight={600}>
                                                        ${payment.totalPrice.toFixed(2)}
                                                    </Typography>
                                                    {hasRefund && (
                                                        <Typography variant="caption" color="success.main">
                                                            Net: ${payment.netAmount.toFixed(2)}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={statusConfig.label}
                                                        color={statusConfig.color}
                                                        size="small"
                                                    />
                                                </TableCell>
                                            </TableRow>

                                            {/* Expandable refund details */}
                                            {hasRefund && (
                                                <TableRow>
                                                    <TableCell colSpan={7} sx={{ py: 0 }}>
                                                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                            <Box sx={{ py: 2, px: 3, bgcolor: 'action.hover', borderRadius: 1, my: 1 }}>
                                                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                                    Refund Details
                                                                </Typography>
                                                                <Stack direction="row" spacing={4}>
                                                                    <Box>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            Refunded Tickets
                                                                        </Typography>
                                                                        <Typography variant="body2">
                                                                            {payment.refundedTickets} of {payment.tickets}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            Refund Amount
                                                                        </Typography>
                                                                        <Typography variant="body2" color="error.main">
                                                                            -${payment.refundAmount.toFixed(2)}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            Refund Date
                                                                        </Typography>
                                                                        <Typography variant="body2">
                                                                            {formatDateTime(payment.refundDate)}
                                                                        </Typography>
                                                                    </Box>
                                                                </Stack>
                                                            </Box>
                                                        </Collapse>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={pagination?.totalCount || filteredPayments.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </TableContainer>
        </Box>
    );
};

export default PaymentHistoryTable;
