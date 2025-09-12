// XML AJAX utility for React frontend with Material-UI integration
// This file provides helper functions for making AJAX calls that work with XML responses
import React from 'react';

/**
 * Parse XML response to JavaScript object
 * @param {string} xmlString - XML string to parse
 * @returns {Object} Parsed JavaScript object
 */
export const parseXMLResponse = (xmlString) => {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

        // Check for parsing errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error('XML parsing error: ' + parserError.textContent);
        }

        return xmlToObject(xmlDoc.documentElement);
    } catch (error) {
        console.error('Error parsing XML:', error);
        throw error;
    }
};

/**
 * Convert XML node to JavaScript object
 * @param {Node} node - XML node
 * @returns {*} JavaScript value
 */
const xmlToObject = (node) => {
    if (!node) return null;

    // If it's a text node, return its value
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent.trim();
    }

    // Handle empty elements
    if (!node.hasChildNodes()) {
        return null;
    }

    // If it has only text content, return the text
    if (node.childNodes.length === 1 && node.firstChild.nodeType === Node.TEXT_NODE) {
        const text = node.firstChild.textContent.trim();
        // Try to convert to appropriate type
        if (text === 'true') return true;
        if (text === 'false') return false;
        if (!isNaN(text) && text !== '') return Number(text);
        return text;
    }

    const result = {};
    const childNodes = Array.from(node.childNodes).filter(child => child.nodeType === Node.ELEMENT_NODE);

    childNodes.forEach(child => {
        const name = child.nodeName;
        const value = xmlToObject(child);

        // Handle arrays (multiple elements with same name)
        if (result[name] !== undefined) {
            if (!Array.isArray(result[name])) {
                result[name] = [result[name]];
            }
            result[name].push(value);
        } else {
            result[name] = value;
        }
    });

    return result;
};

/**
 * Make an XML AJAX request
 * @param {string} url - API endpoint URL
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Promise that resolves to parsed response
 */
export const xmlAjaxRequest = async (url, options = {}) => {
    const {
        method = 'GET',
        headers = {},
        body = null,
        token = null,
        timeout = 10000
    } = options;

    // Prepare headers for XML response
    const requestHeaders = {
        'Accept': 'application/xml',
        'Content-Type': 'application/json',
        ...headers
    };

    // Add authentication token if provided
    if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Add format parameter to ensure XML response
    const separator = url.includes('?') ? '&' : '?';
    const xmlUrl = `${url}${separator}format=xml`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(xmlUrl, {
            method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : null,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            let errorData = {};

            try {
                errorData = parseXMLResponse(errorText);
            } catch {
                errorData = { message: `HTTP ${response.status}: ${errorText}` };
            }

            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const responseText = await response.text();
        return parseXMLResponse(responseText);

    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    }
};

/**
 * Create an API client with XML AJAX support
 * @param {string} baseURL - Base URL for API
 * @param {string} token - Authentication token
 * @returns {Object} API client with methods
 */
export const createXMLApiClient = (baseURL = 'http://localhost:3000/api', token = null) => {
    const client = {
        setToken: (newToken) => {
            token = newToken;
        },

        get: (endpoint, options = {}) => {
            return xmlAjaxRequest(`${baseURL}${endpoint}`, {
                method: 'GET',
                token,
                ...options
            });
        },

        post: (endpoint, data, options = {}) => {
            return xmlAjaxRequest(`${baseURL}${endpoint}`, {
                method: 'POST',
                body: data,
                token,
                ...options
            });
        },

        put: (endpoint, data, options = {}) => {
            return xmlAjaxRequest(`${baseURL}${endpoint}`, {
                method: 'PUT',
                body: data,
                token,
                ...options
            });
        },

        delete: (endpoint, options = {}) => {
            return xmlAjaxRequest(`${baseURL}${endpoint}`, {
                method: 'DELETE',
                token,
                ...options
            });
        }
    };

    return client;
};

/**
 * React hook for XML AJAX requests with loading and error states
 * Note: This is a simplified version. For production use, consider using a proper data fetching library.
 * @param {string} url - API endpoint URL
 * @returns {Object} { data, loading, error, refetch }
 */
export const useXMLApi = (url) => {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const fetchData = React.useCallback(async (options = {}) => {
        if (!url) return;

        setLoading(true);
        setError(null);

        try {
            const result = await xmlAjaxRequest(url, options);
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [url]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refetch: fetchData
    };
};

/**
 * Handle XML API responses for Material-UI components
 * @param {Object} response - Parsed XML response
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export const handleXMLApiResponse = (response, onSuccess, onError) => {
    if (response && response.success === true) {
        onSuccess(response.data, response.message);
    } else {
        const errorMessage = response?.message || 'An error occurred';
        const errors = response?.errors || [];
        onError(errorMessage, errors);
    }
};

/**
 * Format validation errors for Material-UI form display
 * @param {Array} errors - Array of validation error objects
 * @returns {Object} Object with field names as keys and error messages as values
 */
export const formatValidationErrors = (errors) => {
    if (!Array.isArray(errors)) return {};

    return errors.reduce((acc, error) => {
        if (error.field && error.message) {
            acc[error.field] = error.message;
        }
        return acc;
    }, {});
};

/**
 * Show Material-UI snackbar notification from XML API response
 * @param {Object} response - Parsed XML response
 * @param {Function} showSnackbar - Function to show snackbar
 */
export const showApiResponseNotification = (response, showSnackbar) => {
    if (response && response.message) {
        const severity = response.success ? 'success' : 'error';
        showSnackbar(response.message, severity);
    }
};

// Example usage in React component:
/*
import { useXMLApi, createXMLApiClient, handleXMLApiResponse } from './utils/xmlAjax';
import { Snackbar, Alert } from '@mui/material';

const MyComponent = () => {
    const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'info' });
    
    // Using the hook
    const { data, loading, error } = useXMLApi('/auth/profile');
    
    // Using the client
    const apiClient = createXMLApiClient();
    
    const handleLogin = async (credentials) => {
        try {
            const response = await apiClient.post('/auth/login-api', credentials);
            handleXMLApiResponse(
                response,
                (data, message) => {
                    // Success
                    localStorage.setItem('token', data.token);
                    setSnackbar({ open: true, message, severity: 'success' });
                },
                (message, errors) => {
                    // Error
                    setSnackbar({ open: true, message, severity: 'error' });
                }
            );
        } catch (error) {
            setSnackbar({ open: true, message: error.message, severity: 'error' });
        }
    };
    
    return React.createElement('div', null, 
        React.createElement(Snackbar, {
            open: snackbar.open,
            autoHideDuration: 6000,
            onClose: () => setSnackbar(prev => ({ ...prev, open: false }))
        }, React.createElement(Alert, { severity: snackbar.severity }, snackbar.message))
    );
};
*/