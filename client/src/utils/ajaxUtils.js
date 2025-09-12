/**
 * AJAX Utilities for Event Management Frontend
 * Uses XMLHttpRequest for all backend communication
 * Supports both JSON and XML content negotiation
 */

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Generic AJAX request handler using XMLHttpRequest
 * @param {Object} config - Request configuration
 * @param {string} config.url - Request URL (relative to API base)
 * @param {string} config.method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object|FormData} config.data - Request data
 * @param {Object} config.headers - Additional headers
 * @param {boolean} config.includeAuth - Whether to include auth token
 * @param {string} config.responseType - Expected response type ('json', 'xml', 'text')
 * @param {function} config.onUploadProgress - Upload progress callback
 * @returns {Promise} Promise that resolves with response data
 */
function makeAjaxRequest(config) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const url = config.url.startsWith('http') ? config.url : `${API_BASE_URL}${config.url}`;

        // Configure request
        xhr.open(config.method.toUpperCase(), url, true);
        xhr.timeout = REQUEST_TIMEOUT;

        // Set default headers
        const headers = {
            ...config.headers
        };

        // Add auth token if required
        if (config.includeAuth !== false) {
            const token = getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        // Set content type if not FormData
        if (config.data && !(config.data instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        // Set response format preference
        if (config.responseType === 'xml') {
            headers['Accept'] = 'application/xml';
        } else {
            headers['Accept'] = 'application/json';
        }

        // Apply headers
        Object.keys(headers).forEach(key => {
            xhr.setRequestHeader(key, headers[key]);
        });

        // Handle upload progress
        if (config.onUploadProgress && xhr.upload) {
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    config.onUploadProgress(percentComplete);
                }
            });
        }

        // Handle response
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                try {
                    let responseData;

                    // Parse response based on content type
                    const contentType = xhr.getResponseHeader('content-type') || '';

                    if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
                        responseData = parseXMLResponse(xhr.responseText);
                    } else if (contentType.includes('application/json')) {
                        responseData = xhr.responseText ? JSON.parse(xhr.responseText) : {};
                    } else {
                        responseData = { data: xhr.responseText };
                    }

                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve({
                            success: true,
                            data: responseData,
                            status: xhr.status,
                            statusText: xhr.statusText,
                            headers: parseResponseHeaders(xhr.getAllResponseHeaders())
                        });
                    } else {
                        reject({
                            success: false,
                            error: responseData,
                            status: xhr.status,
                            statusText: xhr.statusText,
                            message: responseData.message || `Request failed with status ${xhr.status}`
                        });
                    }
                } catch (error) {
                    reject({
                        success: false,
                        error: error.message,
                        status: xhr.status,
                        statusText: xhr.statusText,
                        message: 'Failed to parse response'
                    });
                }
            }
        };

        // Handle network errors
        xhr.onerror = function () {
            reject({
                success: false,
                error: 'Network error',
                message: 'Failed to connect to server'
            });
        };

        // Handle timeout
        xhr.ontimeout = function () {
            reject({
                success: false,
                error: 'Request timeout',
                message: 'Request timed out'
            });
        };

        // Send request
        try {
            if (config.data) {
                if (config.data instanceof FormData) {
                    xhr.send(config.data);
                } else {
                    xhr.send(JSON.stringify(config.data));
                }
            } else {
                xhr.send();
            }
        } catch (error) {
            reject({
                success: false,
                error: error.message,
                message: 'Failed to send request'
            });
        }
    });
}

/**
 * Parse XML response to JavaScript object
 * @param {string} xmlText - XML response text
 * @returns {Object} Parsed object
 */
function parseXMLResponse(xmlText) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        return xmlToObject(xmlDoc.documentElement);
    } catch (error) {
        console.error('XML parsing error:', error);
        return { error: 'Failed to parse XML response' };
    }
}

/**
 * Convert XML element to JavaScript object
 * @param {Element} element - XML element
 * @returns {Object} JavaScript object
 */
function xmlToObject(element) {
    const obj = {};

    // Handle attributes
    if (element.attributes && element.attributes.length > 0) {
        obj['@attributes'] = {};
        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            obj['@attributes'][attr.nodeName] = attr.nodeValue;
        }
    }

    // Handle child elements
    if (element.children && element.children.length > 0) {
        for (let i = 0; i < element.children.length; i++) {
            const child = element.children[i];
            const childObj = xmlToObject(child);

            if (obj[child.nodeName]) {
                if (!Array.isArray(obj[child.nodeName])) {
                    obj[child.nodeName] = [obj[child.nodeName]];
                }
                obj[child.nodeName].push(childObj);
            } else {
                obj[child.nodeName] = childObj;
            }
        }
    } else if (element.textContent) {
        // If no children, return text content
        return element.textContent.trim();
    }

    return obj;
}

/**
 * Parse response headers string into object
 * @param {string} headerStr - Headers string
 * @returns {Object} Headers object
 */
function parseResponseHeaders(headerStr) {
    const headers = {};
    if (!headerStr) return headers;

    headerStr.split('\r\n').forEach(line => {
        const parts = line.split(': ');
        if (parts.length === 2) {
            headers[parts[0].toLowerCase()] = parts[1];
        }
    });

    return headers;
}

/**
 * Get authentication token from localStorage
 * @returns {string|null} Auth token
 */
function getAuthToken() {
    try {
        return localStorage.getItem('authToken');
    } catch (error) {
        console.warn('Failed to get auth token:', error);
        return null;
    }
}

/**
 * Set authentication token in localStorage
 * @param {string} token - Auth token
 */
function setAuthToken(token) {
    try {
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    } catch (error) {
        console.warn('Failed to set auth token:', error);
    }
}

/**
 * Build query string from object
 * @param {Object} params - Query parameters
 * @returns {string} Query string
 */
function buildQueryString(params) {
    if (!params || Object.keys(params).length === 0) return '';

    const queryParams = Object.keys(params)
        .filter(key => params[key] !== null && params[key] !== undefined && params[key] !== '')
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');

    return queryParams ? `?${queryParams}` : '';
}

// API Methods

/**
 * Authentication API methods
 */
export const authAPI = {
    /**
     * User login
     * @param {Object} credentials - Login credentials
     * @param {string} credentials.email - User email
     * @param {string} credentials.password - User password
     * @returns {Promise} Login response
     */
    login: (credentials) => {
        return makeAjaxRequest({
            url: '/auth/login',
            method: 'POST',
            data: credentials,
            includeAuth: false
        });
    },

    /**
     * User registration
     * @param {Object} userData - Registration data
     * @returns {Promise} Registration response
     */
    register: (userData) => {
        return makeAjaxRequest({
            url: '/auth/sign-up-api',
            method: 'POST',
            data: userData,
            includeAuth: false
        });
    },

    /**
     * Organizer registration
     * @param {Object} orgData - Organizer data
     * @returns {Promise} Registration response
     */
    registerOrganizer: (orgData) => {
        return makeAjaxRequest({
            url: '/auth/host_with_us-api',
            method: 'POST',
            data: orgData,
            includeAuth: true
        });
    },

    /**
     * User logout
     * @returns {Promise} Logout response
     */
    logout: () => {
        return makeAjaxRequest({
            url: '/auth/logout-api',
            method: 'POST',
            includeAuth: true
        });
    },

    /**
     * Refresh auth token
     * @param {string} refreshToken - Refresh token
     * @returns {Promise} Token refresh response
     */
    refreshToken: (refreshToken) => {
        return makeAjaxRequest({
            url: '/auth/refresh-token',
            method: 'POST',
            data: { refreshToken },
            includeAuth: false
        });
    },

    /**
     * Get organizer status
     * @returns {Promise} Organizer status response
     */
    getOrganizerStatus: () => {
        return makeAjaxRequest({
            url: '/auth/organizer-status',
            method: 'GET',
            includeAuth: true
        });
    }
};

/**
 * Event API methods
 */
export const eventAPI = {
    /**
     * Get all events with optional filtering
     * @param {Object} params - Query parameters
     * @returns {Promise} Events response
     */
    getAll: (params = {}) => {
        const queryString = buildQueryString(params);
        return makeAjaxRequest({
            url: `/events/${queryString}`,
            method: 'GET',
            includeAuth: false
        });
    },

    /**
     * Get event by ID
     * @param {string} id - Event ID
     * @returns {Promise} Event response
     */
    getById: (id) => {
        return makeAjaxRequest({
            url: `/events/${id}`,
            method: 'GET',
            includeAuth: false
        });
    },

    /**
     * Create new event (organizer only)
     * @param {FormData} eventData - Event data with file uploads
     * @param {function} onUploadProgress - Upload progress callback
     * @returns {Promise} Event creation response
     */
    create: (eventData, onUploadProgress) => {
        return makeAjaxRequest({
            url: '/organizer/events',
            method: 'POST',
            data: eventData,
            includeAuth: true,
            onUploadProgress
        });
    },

    /**
     * Update event (organizer only)
     * @param {string} id - Event ID
     * @param {FormData} eventData - Updated event data
     * @returns {Promise} Event update response
     */
    update: (id, eventData) => {
        return makeAjaxRequest({
            url: `/organizer/events/${id}`,
            method: 'PUT',
            data: eventData,
            includeAuth: true
        });
    },

    /**
     * Delete event (organizer only)
     * @param {string} id - Event ID
     * @returns {Promise} Event deletion response
     */
    delete: (id) => {
        return makeAjaxRequest({
            url: `/organizer/events/${id}`,
            method: 'DELETE',
            includeAuth: true
        });
    }
};

/**
 * User API methods
 */
export const userAPI = {
    /**
     * Get user profile
     * @returns {Promise} Profile response
     */
    getProfile: () => {
        return makeAjaxRequest({
            url: '/users/profile',
            method: 'GET',
            includeAuth: true
        });
    },

    /**
     * Update user profile
     * @param {Object} profileData - Updated profile data
     * @returns {Promise} Profile update response
     */
    updateProfile: (profileData) => {
        return makeAjaxRequest({
            url: '/users/profile',
            method: 'PUT',
            data: profileData,
            includeAuth: true
        });
    },

    /**
     * Get user dashboard data
     * @returns {Promise} Dashboard response
     */
    getDashboard: () => {
        return makeAjaxRequest({
            url: '/users/dashboard',
            method: 'GET',
            includeAuth: true
        });
    },

    /**
     * Register for event
     * @param {string} eventId - Event ID
     * @returns {Promise} Registration response
     */
    registerForEvent: (eventId) => {
        return makeAjaxRequest({
            url: `/users/register/${eventId}`,
            method: 'POST',
            includeAuth: true
        });
    },

    /**
     * Save/bookmark event
     * @param {string} eventId - Event ID
     * @returns {Promise} Save response
     */
    saveEvent: (eventId) => {
        return makeAjaxRequest({
            url: `/users/save/${eventId}`,
            method: 'POST',
            includeAuth: true
        });
    },

    /**
     * Remove saved event
     * @param {string} eventId - Event ID
     * @returns {Promise} Remove response
     */
    removeSavedEvent: (eventId) => {
        return makeAjaxRequest({
            url: `/users/save/${eventId}`,
            method: 'DELETE',
            includeAuth: true
        });
    }
};

/**
 * Organizer API methods
 */
export const organizerAPI = {
    /**
     * Get organizer dashboard
     * @returns {Promise} Dashboard response
     */
    getDashboard: () => {
        return makeAjaxRequest({
            url: '/organizer/dashboard',
            method: 'GET',
            includeAuth: true
        });
    },

    /**
     * Get organizer events
     * @param {Object} params - Query parameters
     * @returns {Promise} Events response
     */
    getEvents: (params = {}) => {
        const queryString = buildQueryString(params);
        return makeAjaxRequest({
            url: `/organizer/events${queryString}`,
            method: 'GET',
            includeAuth: true
        });
    },

    /**
     * Get event analytics
     * @param {string} eventId - Event ID
     * @returns {Promise} Analytics response
     */
    getEventAnalytics: (eventId) => {
        return makeAjaxRequest({
            url: `/organizer/events/${eventId}/analytics`,
            method: 'GET',
            includeAuth: true
        });
    }
};

/**
 * Admin API methods
 */
export const adminAPI = {
    /**
     * Get admin dashboard
     * @returns {Promise} Dashboard response
     */
    getDashboard: () => {
        return makeAjaxRequest({
            url: '/admin/dashboard',
            method: 'GET',
            includeAuth: true
        });
    },

    /**
     * Get all users
     * @param {Object} params - Query parameters
     * @returns {Promise} Users response
     */
    getUsers: (params = {}) => {
        const queryString = buildQueryString(params);
        return makeAjaxRequest({
            url: `/admin/users${queryString}`,
            method: 'GET',
            includeAuth: true
        });
    },

    /**
     * Get all organizers
     * @param {Object} params - Query parameters
     * @returns {Promise} Organizers response
     */
    getOrganizers: (params = {}) => {
        const queryString = buildQueryString(params);
        return makeAjaxRequest({
            url: `/admin/organizers${queryString}`,
            method: 'GET',
            includeAuth: true
        });
    },

    /**
     * Approve organizer
     * @param {string} organizerId - Organizer ID
     * @returns {Promise} Approval response
     */
    approveOrganizer: (organizerId) => {
        return makeAjaxRequest({
            url: `/admin/organizers/${organizerId}/approve`,
            method: 'POST',
            includeAuth: true
        });
    },

    /**
     * Reject organizer
     * @param {string} organizerId - Organizer ID
     * @param {string} reason - Rejection reason
     * @returns {Promise} Rejection response
     */
    rejectOrganizer: (organizerId, reason) => {
        return makeAjaxRequest({
            url: `/admin/organizers/${organizerId}/reject`,
            method: 'POST',
            data: { reason },
            includeAuth: true
        });
    },

    /**
     * Delete user
     * @param {string} userId - User ID
     * @returns {Promise} Deletion response
     */
    deleteUser: (userId) => {
        return makeAjaxRequest({
            url: `/admin/users/${userId}`,
            method: 'DELETE',
            includeAuth: true
        });
    }
};

/**
 * Payment API methods
 */
export const paymentAPI = {
    /**
     * Get payment page data
     * @param {string} eventId - Event ID
     * @returns {Promise} Payment data response
     */
    getPaymentData: (eventId) => {
        return makeAjaxRequest({
            url: `/payment/${eventId}`,
            method: 'GET',
            includeAuth: true
        });
    },

    /**
     * Process payment
     * @param {string} eventId - Event ID
     * @param {Object} paymentData - Payment details
     * @returns {Promise} Payment response
     */
    processPayment: (eventId, paymentData) => {
        return makeAjaxRequest({
            url: `/payment/${eventId}`,
            method: 'POST',
            data: paymentData,
            includeAuth: true
        });
    }
};

// Utility exports
export {
    makeAjaxRequest,
    setAuthToken,
    getAuthToken,
    buildQueryString,
    parseXMLResponse
};

// Default export with all APIs
export default {
    auth: authAPI,
    events: eventAPI,
    users: userAPI,
    organizers: organizerAPI,
    admin: adminAPI,
    payment: paymentAPI,
    utils: {
        makeAjaxRequest,
        setAuthToken,
        getAuthToken,
        buildQueryString,
        parseXMLResponse
    }
};