import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Chip,
    Stepper,
    Step,
    StepLabel,
    LinearProgress,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    CheckCircle as CheckIcon,
    HourglassEmpty as PendingIcon,
    Cancel as RejectedIcon,
    Description as DocIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { API_BASE_URL } from '../../api/client';

function OrganizerVerification({ onVerified }) {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const fetchStatus = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/organizer/verification-status`, {
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                setStatus(data.data);
                if (data.data.verificationStatus === 'approved' && onVerified) {
                    onVerified();
                }
            }
        } catch {
            // Silently handle fetch errors
        } finally {
            setLoading(false);
        }
    }, [onVerified]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
            setError('');
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            setError('Please select a document to upload');
            return;
        }

        setUploading(true);
        setError('');
        setSuccessMsg('');

        try {
            const formData = new FormData();
            formData.append('verificationDocument', selectedFile);

            const response = await fetch(`${API_BASE_URL}/organizer/submit-verification`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                setSuccessMsg(data.message);
                setSelectedFile(null);
                fetchStatus();
            } else {
                setError(data.message || 'Failed to submit verification request');
            }
        } catch {
            setError('Failed to submit verification request. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress sx={{ color: '#9353d3' }} />
            </Box>
        );
    }

    const getStepIndex = () => {
        switch (status?.verificationStatus) {
            case 'not_submitted': return 0;
            case 'pending': return 1;
            case 'approved': return 3;
            case 'rejected': return 0;
            default: return 0;
        }
    };

    const steps = ['Submit Document', 'Under Review', 'Verified'];

    return (
        <Paper
            sx={{
                p: 4,
                mb: 4,
                background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
                border: '1px solid rgba(147, 83, 211, 0.3)',
                borderRadius: 3,
            }}
        >
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                Organizer Verification
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                Get verified to create events and start selling tickets
            </Typography>

            {/* Progress Stepper */}
            <Stepper
                activeStep={getStepIndex()}
                alternativeLabel
                sx={{
                    mb: 4,
                    '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.5)' },
                    '& .MuiStepLabel-label.Mui-active': { color: '#9353d3' },
                    '& .MuiStepLabel-label.Mui-completed': { color: '#10b981' },
                    '& .MuiStepIcon-root': { color: 'rgba(255,255,255,0.2)' },
                    '& .MuiStepIcon-root.Mui-active': { color: '#9353d3' },
                    '& .MuiStepIcon-root.Mui-completed': { color: '#10b981' },
                }}
            >
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {/* Status-specific content */}
            {status?.verificationStatus === 'approved' && (
                <Alert
                    severity="success"
                    icon={<CheckIcon />}
                    sx={{
                        bgcolor: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                >
                    <Typography fontWeight={600}>You are verified!</Typography>
                    You can create events and sell tickets.
                </Alert>
            )}

            {status?.verificationStatus === 'pending' && (
                <Box>
                    <Alert
                        severity="warning"
                        icon={<PendingIcon />}
                        sx={{
                            bgcolor: 'rgba(245, 158, 11, 0.15)',
                            color: '#fbbf24',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            mb: 2,
                        }}
                    >
                        <Typography fontWeight={600}>Verification Under Review</Typography>
                        Your document has been submitted and is being reviewed by a manager. You will receive an email once the review is complete.
                    </Alert>
                    {status.verificationRequestDate && (
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            Submitted on: {new Date(status.verificationRequestDate).toLocaleString()}
                        </Typography>
                    )}
                </Box>
            )}

            {status?.verificationStatus === 'rejected' && (
                <Box>
                    <Alert
                        severity="error"
                        icon={<RejectedIcon />}
                        sx={{
                            bgcolor: 'rgba(239, 68, 68, 0.15)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            mb: 2,
                        }}
                    >
                        <Typography fontWeight={600}>Verification Rejected</Typography>
                        {status.rejectionReason || 'Your verification request was not approved.'}
                    </Alert>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>
                        You can update your document and resubmit for verification.
                    </Typography>

                    {/* Re-upload form */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<UploadIcon />}
                            sx={{
                                color: '#9353d3',
                                borderColor: 'rgba(147, 83, 211, 0.5)',
                                '&:hover': { borderColor: '#9353d3', bgcolor: 'rgba(147, 83, 211, 0.1)' },
                            }}
                        >
                            Select Document
                            <input type="file" hidden onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                        </Button>
                        {selectedFile && (
                            <Chip
                                icon={<DocIcon />}
                                label={selectedFile.name}
                                onDelete={() => setSelectedFile(null)}
                                sx={{ color: '#fff', '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.5)' } }}
                            />
                        )}
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={uploading || !selectedFile}
                            sx={{
                                background: 'linear-gradient(135deg, #9353d3 0%, #643d88 100%)',
                                '&:hover': { background: 'linear-gradient(135deg, #a463e3 0%, #744d98 100%)' },
                            }}
                        >
                            {uploading ? <CircularProgress size={24} color="inherit" /> : 'Resubmit'}
                        </Button>
                    </Box>
                </Box>
            )}

            {(status?.verificationStatus === 'not_submitted' || !status?.verificationStatus) && (
                <Box>
                    <Alert
                        severity="info"
                        sx={{
                            bgcolor: 'rgba(6, 182, 212, 0.15)',
                            color: '#22d3ee',
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                            mb: 3,
                        }}
                    >
                        <Typography fontWeight={600}>Verification Required</Typography>
                        Please upload a verification document (business registration, government ID, or relevant certification) to get verified. Once verified, you can create events.
                    </Alert>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<UploadIcon />}
                            sx={{
                                color: '#9353d3',
                                borderColor: 'rgba(147, 83, 211, 0.5)',
                                '&:hover': { borderColor: '#9353d3', bgcolor: 'rgba(147, 83, 211, 0.1)' },
                            }}
                        >
                            Select Document
                            <input type="file" hidden onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                        </Button>
                        {selectedFile && (
                            <Chip
                                icon={<DocIcon />}
                                label={selectedFile.name}
                                onDelete={() => setSelectedFile(null)}
                                sx={{ color: '#fff', '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.5)' } }}
                            />
                        )}
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={uploading || !selectedFile}
                            sx={{
                                background: 'linear-gradient(135deg, #9353d3 0%, #643d88 100%)',
                                '&:hover': { background: 'linear-gradient(135deg, #a463e3 0%, #744d98 100%)' },
                            }}
                        >
                            {uploading ? <CircularProgress size={24} color="inherit" /> : 'Submit for Verification'}
                        </Button>
                    </Box>
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}
            {successMsg && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    {successMsg}
                </Alert>
            )}
        </Paper>
    );
}

export default OrganizerVerification;
