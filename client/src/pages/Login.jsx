import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  InputAdornment,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { Lock, Person, Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/theme-context'; // import your context

const steps = ['Account Type', 'Personal Information', 'Complete Login'];

function Login() {
  const { isDarkMode } = useContext(ThemeContext); // get dark mode from context

  const [activeStep, setActiveStep] = useState(0);
  const [accountType, setAccountType] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleNext = async () => {
    if (activeStep === 0 && !accountType) {
      setError('Please select account type');
      return;
    }

    if (activeStep === 1) {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }
      try {
        const result = await login({ ...formData });
        if (result.success) {
          setActiveStep(prev => prev + 1);
          setTimeout(() => {
            if (accountType === 'admin') navigate('/admin/dashboard');
            else if (accountType === 'organizer') navigate('/organizer/dashboard');
            else navigate('/user/dashboard');
          }, 1500);
          return;
        }
      } catch (err) {
        setError(err.message || 'Login failed');
        return;
      }
    }

    setError('');
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep(prev => prev - 1);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 6,
          width: 600,
          maxWidth: 580,
          borderRadius: 4,
          background: isDarkMode ? '#000' : '#fff', // dark mode black, light mode white
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: '#2196f3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
          }}
        >
          <LoginIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #646cff 0%, #61dafb 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 3,
          }}
        >
          Sign In
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, flexWrap: 'wrap' }}>
          {steps.map((label, index) => (
            <Step key={label} sx={{ width: 'auto' }}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    color: isDarkMode ? 'white !important' : 'black !important',
                    fontSize: '0.9rem',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                  },
                  '& .MuiStepIcon-root': {
                    color: activeStep > index
                      ? '#2196f3'
                      : isDarkMode
                      ? 'rgba(255,255,255,0.3)'
                      : 'rgba(0,0,0,0.2)',
                  },
                  '& .Mui-active': { color: '#2196f3 !important' },
                  '& .Mui-completed': { color: '#2196f3 !important' },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <>
            <Typography variant="h6" sx={{ mb: 3, color: isDarkMode ? 'white' : 'black' }}>
              Choose Account Type
            </Typography>
            <TextField
              select
              fullWidth
              label="Account Type"
              value={accountType}
              onChange={e => setAccountType(e.target.value)}
              SelectProps={{ sx: { '& .MuiSvgIcon-root': { color: isDarkMode ? 'white' : 'black' } } }}
              sx={{
                mb: 4,
                '& .MuiInputLabel-root': { color: isDarkMode ? 'white' : 'black' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: accountType ? '#2196f3' : isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' },
                  '&:hover fieldset': { borderColor: '#2196f3' },
                  '&.Mui-focused fieldset': { borderColor: '#2196f3' },
                },
                '& .MuiInputBase-input': { color: isDarkMode ? 'white' : 'black' },
              }}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="organizer">Organizer</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </TextField>
          </>
        )}

        {activeStep === 1 && (
          <>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              sx={{
                mb: 3,
                '& .MuiInputLabel-root': { color: isDarkMode ? 'white' : 'black' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#2196f3' },
                  '&:hover fieldset': { borderColor: '#64b5f6' },
                  '&.Mui-focused fieldset': { borderColor: '#2196f3' },
                },
                '& .MuiInputBase-input': { color: isDarkMode ? 'white' : 'black' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: '#2196f3' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              sx={{
                mb: 3,
                '& .MuiInputLabel-root': { color: isDarkMode ? 'white' : 'black' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#2196f3' },
                  '&:hover fieldset': { borderColor: '#64b5f6' },
                  '&.Mui-focused fieldset': { borderColor: '#2196f3' },
                },
                '& .MuiInputBase-input': { color: isDarkMode ? 'white' : 'black' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#2196f3' }} />
                  </InputAdornment>
                ),
              }}
            />
          </>
        )}

        {error && (
          <Typography color="error" sx={{ mb: 3 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
            sx={{
              backgroundColor: '#2196f3',
              color: '#fff',
              px: 5,
              py: 1.5,
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : activeStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Box>

        {activeStep < 2 && (
          <Typography variant="body2" sx={{ mt: 3, color: isDarkMode ? 'white' : 'black' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#2196f3', fontWeight: 600 }}>
              Sign up here
            </Link>
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

export default Login;
