import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Container,
    Typography,
    Tabs,
    Tab,
    AppBar,
    Toolbar,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    Divider,
    Alert,
    Snackbar,
    CircularProgress,
    useMediaQuery,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    FormControl,
    InputLabel,
    Skeleton,
    LinearProgress,
    Pagination,
    Card,
    CardContent,
    InputAdornment,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    VerifiedUser as VerifiedIcon,
    PendingActions as PendingIcon,
    Business as BusinessIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    Search as SearchIcon,
    Visibility as ViewIcon,
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Description as DocumentIcon,
    ThumbDown as ThumbDownIcon,
    ThumbUp as ThumbUpIcon,
    Assessment as StatsIcon,
    HourglassEmpty as HourglassIcon,
    Block as BlockIcon,
    Groups as GroupsIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import { ThemeContextProvider, useThemeMode } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { ThemeToggle, UserStatsCard } from '../../components/user';

// Tab Panel component
function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`manager-tabpanel-${index}`}
            aria-labelledby={`manager-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

// Status chip mapping
function getStatusChip(status) {
    const config = {
        pending: { label: 'Pending', color: 'warning' },
        approved: { label: 'Approved', color: 'success' },
        rejected: { label: 'Rejected', color: 'error' },
        not_submitted: { label: 'Not Submitted', color: 'default' },
    };
    const c = config[status] || config.not_submitted;
    return <Chip label={c.label} color={c.color} size="small" />;
}

// Main Dashboard Content Component
function ManagerDashboardContent() {
    const theme = useTheme();
    useThemeMode();
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

    // State
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [dashboardData, setDashboardData] = useState(null);
    const [organizers, setOrganizers] = useState([]);
    const [organizersLoading, setOrganizersLoading] = useState(false);
    const [organizersPagination, setOrganizersPagination] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [anchorEl, setAnchorEl] = useState(null);

    // Detail dialog state
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedOrganizer, setSelectedOrganizer] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // Reject dialog state
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectTarget, setRejectTarget] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Auth check
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        try {
            const response = await api.get('/manager/dashboard');
            if (response.success) {
                setDashboardData(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            showSnackbar('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch organizers list
    const fetchOrganizers = useCallback(async (page = 1) => {
        setOrganizersLoading(true);
        try {
            let url = `/manager/organizers?page=${page}&limit=10`;
            if (statusFilter !== 'all') url += `&status=${statusFilter}`;
            if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

            const response = await api.get(url);
            if (response.success) {
                setOrganizers(response.data.organizers || []);
                setOrganizersPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch organizers:', error);
        } finally {
            setOrganizersLoading(false);
        }
    }, [statusFilter, searchQuery]);

    // Fetch organizer details
    const fetchOrganizerDetails = async (id) => {
        setDetailLoading(true);
        setDetailDialogOpen(true);
        try {
            const response = await api.get(`/manager/organizers/${id}`);
            if (response.success) {
                setSelectedOrganizer(response.data);
            }
        } catch {
            showSnackbar('Failed to load organizer details', 'error');
            setDetailDialogOpen(false);
        } finally {
            setDetailLoading(false);
        }
    };

    // Approve organizer
    const handleApprove = async (id) => {
        setActionLoading(true);
        try {
            const response = await api.put(`/manager/organizers/${id}/approve`);
            if (response.success) {
                showSnackbar('Organizer approved successfully! Email notification sent.', 'success');
                fetchDashboardData();
                fetchOrganizers();
                setDetailDialogOpen(false);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            showSnackbar(error.message || 'Failed to approve organizer', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // Open reject dialog
    const openRejectDialog = (org) => {
        setRejectTarget(org);
        setRejectReason('');
        setRejectDialogOpen(true);
    };

    // Confirm reject
    const handleReject = async () => {
        if (!rejectTarget) return;
        setActionLoading(true);
        try {
            const response = await api.put(`/manager/organizers/${rejectTarget._id}/reject`, {
                reason: rejectReason
            });
            if (response.success) {
                showSnackbar('Organizer rejected. Email notification sent.', 'info');
                setRejectDialogOpen(false);
                setDetailDialogOpen(false);
                fetchDashboardData();
                fetchOrganizers();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            showSnackbar(error.message || 'Failed to reject organizer', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        if (isAuthenticated) {
            fetchDashboardData();
        }
    }, [isAuthenticated, fetchDashboardData]);

    // Fetch organizers when tab changes or filters change
    useEffect(() => {
        if (activeTab === 1) {
            fetchOrganizers();
        }
    }, [activeTab, fetchOrganizers]);

    // Snackbar helper
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleMenuClose();
        await logout();
        navigate('/login');
    };

    // Tab configuration
    const tabs = [
        { label: 'Overview', icon: <DashboardIcon /> },
        { label: 'Organizers', icon: <BusinessIcon /> },
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* App Bar */}
            <AppBar position="sticky" elevation={0}>
                <Toolbar>
                    <VerifiedIcon sx={{ mr: 1.5 }} />
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                        Manager Dashboard
                    </Typography>

                    <ThemeToggle />

                    <IconButton onClick={handleMenuOpen} sx={{ ml: 1 }} aria-label="account menu">
                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '1rem' }}>
                            {dashboardData?.manager?.name?.charAt(0)?.toUpperCase() || 'M'}
                        </Avatar>
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <Box sx={{ px: 2, py: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {dashboardData?.manager?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {dashboardData?.manager?.email}
                            </Typography>
                        </Box>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* Welcome Message */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Welcome, {dashboardData?.manager?.name?.split(' ')[0] || 'Manager'}!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Review and manage organizer verification requests.
                    </Typography>
                </Box>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant={isMobile ? 'scrollable' : 'standard'}
                        scrollButtons={isMobile ? 'auto' : false}
                        aria-label="manager dashboard tabs"
                    >
                        {tabs.map((tab, index) => (
                            <Tab
                                key={index}
                                label={isSmall ? '' : tab.label}
                                icon={tab.icon}
                                iconPosition="start"
                                aria-label={tab.label}
                            />
                        ))}
                    </Tabs>
                </Box>

                {/* Overview Tab */}
                <TabPanel value={activeTab} index={0}>
                    {/* Stats Cards */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: 'repeat(2, 1fr)',
                                sm: 'repeat(2, 1fr)',
                                md: 'repeat(5, 1fr)',
                            },
                            gap: { xs: 2, md: 3 },
                            mb: 4,
                        }}
                    >
                        <UserStatsCard
                            title="Total Organizers"
                            value={dashboardData?.stats?.totalOrganizers || 0}
                            icon={<GroupsIcon />}
                            color="primary"
                            loading={loading}
                            subtitle="All organizers"
                        />
                        <UserStatsCard
                            title="Pending Review"
                            value={dashboardData?.stats?.pendingVerifications || 0}
                            icon={<HourglassIcon />}
                            color="warning"
                            loading={loading}
                            subtitle="Awaiting review"
                        />
                        <UserStatsCard
                            title="Approved"
                            value={dashboardData?.stats?.approvedOrganizers || 0}
                            icon={<ThumbUpIcon />}
                            color="success"
                            loading={loading}
                            subtitle="Verified organizers"
                        />
                        <UserStatsCard
                            title="Rejected"
                            value={dashboardData?.stats?.rejectedOrganizers || 0}
                            icon={<BlockIcon />}
                            color="error"
                            loading={loading}
                            subtitle="Not approved"
                        />
                        <UserStatsCard
                            title="Not Submitted"
                            value={dashboardData?.stats?.notSubmitted || 0}
                            icon={<PendingIcon />}
                            color="info"
                            loading={loading}
                            subtitle="No request yet"
                        />
                    </Box>

                    {/* Pending Verification Requests */}
                    <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                        Pending Verification Requests
                    </Typography>
                    {dashboardData?.recentRequests?.length > 0 ? (
                        <TableContainer component={Paper} sx={{ mb: 4 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Organization</TableCell>
                                        <TableCell>Owner</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Request Date</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dashboardData.recentRequests.map((org) => (
                                        <TableRow key={org._id} hover>
                                            <TableCell>
                                                <Typography fontWeight={600}>{org.organizationName}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {org.orgType || 'Not specified'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{org.userId?.name || 'N/A'}</TableCell>
                                            <TableCell>{org.userId?.email || 'N/A'}</TableCell>
                                            <TableCell>
                                                {org.verificationRequestDate
                                                    ? new Date(org.verificationRequestDate).toLocaleDateString()
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<ViewIcon />}
                                                        onClick={() => fetchOrganizerDetails(org._id)}
                                                    >
                                                        Review
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="success"
                                                        startIcon={<ApproveIcon />}
                                                        onClick={() => handleApprove(org._id)}
                                                        disabled={actionLoading}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        startIcon={<RejectIcon />}
                                                        onClick={() => openRejectDialog(org)}
                                                        disabled={actionLoading}
                                                    >
                                                        Reject
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
                            No pending verification requests at this time.
                        </Alert>
                    )}

                    {/* Recently Reviewed */}
                    <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                        Recently Reviewed
                    </Typography>
                    {dashboardData?.recentReviews?.length > 0 ? (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Organization</TableCell>
                                        <TableCell>Owner</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Review Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dashboardData.recentReviews.map((org) => (
                                        <TableRow key={org._id} hover>
                                            <TableCell>
                                                <Typography fontWeight={600}>{org.organizationName}</Typography>
                                            </TableCell>
                                            <TableCell>{org.userId?.name || 'N/A'}</TableCell>
                                            <TableCell>{getStatusChip(org.verificationStatus)}</TableCell>
                                            <TableCell>
                                                {org.verificationReviewDate
                                                    ? new Date(org.verificationReviewDate).toLocaleDateString()
                                                    : 'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            No reviews completed yet.
                        </Alert>
                    )}
                </TabPanel>

                {/* Organizers Tab */}
                <TabPanel value={activeTab} index={1}>
                    <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                        All Organizers
                    </Typography>

                    {/* Filters */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                        <TextField
                            size="small"
                            placeholder="Search by organization name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') fetchOrganizers(); }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ minWidth: 280 }}
                        />
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="approved">Approved</MenuItem>
                                <MenuItem value="rejected">Rejected</MenuItem>
                                <MenuItem value="not_submitted">Not Submitted</MenuItem>
                            </Select>
                        </FormControl>
                        <Button variant="contained" onClick={() => fetchOrganizers()} startIcon={<SearchIcon />}>
                            Search
                        </Button>
                    </Box>

                    {/* Organizers Table */}
                    {organizersLoading ? (
                        <Box>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 1 }} />
                            ))}
                        </Box>
                    ) : organizers.length > 0 ? (
                        <>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Organization</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Owner</TableCell>
                                            <TableCell>Contact</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Request Date</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {organizers.map((org) => (
                                            <TableRow key={org._id} hover>
                                                <TableCell>
                                                    <Typography fontWeight={600}>{org.organizationName}</Typography>
                                                </TableCell>
                                                <TableCell>{org.orgType || '-'}</TableCell>
                                                <TableCell>{org.userId?.name || 'N/A'}</TableCell>
                                                <TableCell>{org.contactNo || '-'}</TableCell>
                                                <TableCell>{getStatusChip(org.verificationStatus)}</TableCell>
                                                <TableCell>
                                                    {org.verificationRequestDate
                                                        ? new Date(org.verificationRequestDate).toLocaleDateString()
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<ViewIcon />}
                                                            onClick={() => fetchOrganizerDetails(org._id)}
                                                        >
                                                            View
                                                        </Button>
                                                        {org.verificationStatus === 'pending' && (
                                                            <>
                                                                <Button
                                                                    size="small"
                                                                    variant="contained"
                                                                    color="success"
                                                                    onClick={() => handleApprove(org._id)}
                                                                    disabled={actionLoading}
                                                                >
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="error"
                                                                    onClick={() => openRejectDialog(org)}
                                                                    disabled={actionLoading}
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Pagination */}
                            {organizersPagination && organizersPagination.totalPages > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                    <Pagination
                                        count={organizersPagination.totalPages}
                                        page={organizersPagination.page}
                                        onChange={(e, page) => fetchOrganizers(page)}
                                        color="primary"
                                    />
                                </Box>
                            )}
                        </>
                    ) : (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            No organizers found matching your criteria.
                        </Alert>
                    )}
                </TabPanel>
            </Container>

            {/* Organizer Detail Dialog */}
            <Dialog
                open={detailDialogOpen}
                onClose={() => setDetailDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon color="primary" />
                        <Typography variant="h6">Organizer Details</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {detailLoading ? (
                        <Box sx={{ py: 4 }}>
                            <LinearProgress />
                            <Typography sx={{ mt: 2, textAlign: 'center' }} color="text.secondary">
                                Loading details...
                            </Typography>
                        </Box>
                    ) : selectedOrganizer ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Basic Info */}
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Basic Information</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Organization Name</Typography>
                                            <Typography fontWeight={600}>{selectedOrganizer.organizer.organizationName}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Organization Type</Typography>
                                            <Typography>{selectedOrganizer.organizer.orgType || 'Not specified'}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Owner Name</Typography>
                                            <Typography>{selectedOrganizer.organizer.userId?.name || 'N/A'}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Owner Email</Typography>
                                            <Typography>{selectedOrganizer.organizer.userId?.email || 'N/A'}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Contact</Typography>
                                            <Typography>{selectedOrganizer.organizer.contactNo || 'N/A'}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Events Created</Typography>
                                            <Typography>{selectedOrganizer.eventCount}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Status</Typography>
                                            <Box sx={{ mt: 0.5 }}>
                                                {getStatusChip(selectedOrganizer.organizer.verificationStatus)}
                                            </Box>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Website</Typography>
                                            <Typography>{selectedOrganizer.organizer.website || 'N/A'}</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Description */}
                            {selectedOrganizer.organizer.description && (
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Description</Typography>
                                        <Typography>{selectedOrganizer.organizer.description}</Typography>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Verification Document */}
                            {selectedOrganizer.organizer.verificationDocument && (
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            <DocumentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Verification Document
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            href={`http://localhost:3000/${selectedOrganizer.organizer.verificationDocument}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            startIcon={<ViewIcon />}
                                        >
                                            View Document
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Address */}
                            {selectedOrganizer.organizer.registeredAddress?.line1 && (
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Registered Address</Typography>
                                        <Typography>
                                            {[
                                                selectedOrganizer.organizer.registeredAddress.line1,
                                                selectedOrganizer.organizer.registeredAddress.line2,
                                                selectedOrganizer.organizer.registeredAddress.city,
                                                selectedOrganizer.organizer.registeredAddress.state,
                                                selectedOrganizer.organizer.registeredAddress.postalCode,
                                                selectedOrganizer.organizer.registeredAddress.country,
                                            ].filter(Boolean).join(', ')}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Rejection reason (if previously rejected) */}
                            {selectedOrganizer.organizer.rejectionReason && (
                                <Alert severity="error">
                                    <Typography variant="subtitle2">Previous Rejection Reason:</Typography>
                                    {selectedOrganizer.organizer.rejectionReason}
                                </Alert>
                            )}
                        </Box>
                    ) : null}
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
                    {selectedOrganizer?.organizer?.verificationStatus === 'pending' && (
                        <>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<ApproveIcon />}
                                onClick={() => handleApprove(selectedOrganizer.organizer._id)}
                                disabled={actionLoading}
                            >
                                Approve
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<RejectIcon />}
                                onClick={() => openRejectDialog(selectedOrganizer.organizer)}
                                disabled={actionLoading}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Reject Confirmation Dialog */}
            <Dialog
                open={rejectDialogOpen}
                onClose={() => setRejectDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ThumbDownIcon color="error" />
                        <Typography variant="h6">Reject Verification</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        Rejecting verification for <strong>{rejectTarget?.organizationName}</strong>.
                        Please provide a reason:
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Rejection Reason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g., Submitted document is not valid or incomplete..."
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleReject}
                        disabled={actionLoading || !rejectReason.trim()}
                        startIcon={<RejectIcon />}
                    >
                        Confirm Reject
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

// Main ManagerDashboard component with ThemeProvider
function ManagerDashboard() {
    return (
        <ThemeContextProvider defaultMode="light">
            <ManagerDashboardContent />
        </ThemeContextProvider>
    );
}

export default ManagerDashboard;
