const swaggerDocument = {
    openapi: '3.0.3',
    info: {
        title: 'Event Management API - Frontend Consumed Endpoints',
        version: '1.0.0',
        description:
            'Comprehensive API documentation for backend endpoints consumed by Homepage, Category pages, Payment page, User Dashboard, and Contact Us page.',
        contact: {
            name: 'Event Management API Support',
            email: 'shriansh.j23@iiits.in'
        }
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Local development server'
        }
    ],
    tags: [
        {
            name: 'Homepage',
            description: 'Endpoints consumed by Home page and Hero section.'
        },
        {
            name: 'Category Pages',
            description: 'Endpoints consumed by category listing pages.'
        },
        {
            name: 'Payment Pages',
            description: 'Endpoints consumed by checkout/payment flow.'
        },
        {
            name: 'User Dashboard',
            description: 'Endpoints consumed by user dashboard tabs and settings.'
        },
        {
            name: 'Contact Us',
            description: 'Endpoints consumed by contact information and contact form.'
        },
        {
            name: 'Authentication',
            description: 'Sign in, sign up, session, and logout endpoints.'
        },
        {
            name: 'Event Detail Page',
            description: 'Endpoints consumed by event detail pages.'
        },
        {
            name: 'Organizer Dashboard',
            description: 'Endpoints consumed by organizer dashboard and event management screens.'
        },
        {
            name: 'Manager Dashboard',
            description: 'Endpoints consumed by manager verification dashboard.'
        },
        {
            name: 'Admin Dashboard',
            description: 'Endpoints consumed by admin dashboard, moderation, and analytics screens.'
        },
        {
            name: 'System',
            description: 'General API metadata endpoints.'
        }
    ],
    components: {
        securitySchemes: {
            sessionCookie: {
                type: 'apiKey',
                in: 'cookie',
                name: 'connect.sid',
                description:
                    'Session cookie set after successful authentication. Required for protected user/payment endpoints.'
            }
        },
        schemas: {
            ErrorEnvelope: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    error: {
                        type: 'object',
                        properties: {
                            code: { type: 'integer', example: 400 },
                            message: { type: 'string', example: 'Invalid event ID format' }
                        },
                        required: ['code', 'message']
                    }
                },
                required: ['success', 'error']
            },
            EventListItem: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '67fa7a1f0c551c9170b9bfe1' },
                    category: { type: 'string', example: 'TEDx' },
                    title: { type: 'string', example: 'TEDx Future of AI' },
                    description: { type: 'string', example: 'Ideas worth spreading on AI and ethics.' },
                    startDateTime: { type: 'string', format: 'date-time', example: '2026-04-10T09:00:00.000Z' },
                    endDateTime: { type: 'string', format: 'date-time', example: '2026-04-10T16:00:00.000Z' },
                    venue: { type: 'string', example: 'Convention Center Hall A' },
                    capacity: { type: 'integer', example: 500 },
                    ticketPrice: { type: 'number', example: 49.99 },
                    status: { type: 'string', enum: ['start_selling', 'upcoming', 'over'], example: 'start_selling' },
                    organizerId: { type: 'string', example: '67fa7a1f0c551c9170b9bf11' },
                    image: { type: 'string', nullable: true, example: 'uploads/events/tedx-banner.jpg' }
                },
                required: ['_id', 'category', 'title', 'startDateTime', 'venue', 'ticketPrice', 'status']
            },
            PaginationMeta: {
                type: 'object',
                properties: {
                    currentPage: { type: 'integer', example: 1 },
                    totalPages: { type: 'integer', example: 4 },
                    totalEvents: { type: 'integer', example: 12 },
                    hasNextPage: { type: 'boolean', example: true },
                    hasPrevPage: { type: 'boolean', example: false }
                },
                required: ['currentPage', 'totalPages', 'totalEvents', 'hasNextPage', 'hasPrevPage']
            },
            UserDashboardBooking: {
                type: 'object',
                properties: {
                    eventId: { type: 'string', example: '67fa7a1f0c551c9170b9bfe1' },
                    title: { type: 'string', example: 'TEDx Future of AI' },
                    startDateTime: { type: 'string', format: 'date-time' },
                    endDateTime: { type: 'string', format: 'date-time' },
                    venue: { type: 'string', example: 'Convention Center Hall A' },
                    ticketType: { type: 'string', example: 'Standard' },
                    price: { type: 'number', example: 49.99 },
                    status: { type: 'string', example: 'upcoming' },
                    registrationStatus: { type: 'string', enum: ['active', 'cancelled'], example: 'active' },
                    ticketCount: { type: 'integer', example: 2 },
                    activeTicketCount: { type: 'integer', example: 2 },
                    cancelledTicketCount: { type: 'integer', example: 0 },
                    registrationIds: {
                        type: 'array',
                        items: { type: 'string' },
                        example: ['67fa7b271688151a7cd61d2a', '67fa7b271688151a7cd61d2b']
                    },
                    activeRegistrationIds: {
                        type: 'array',
                        items: { type: 'string' },
                        example: ['67fa7b271688151a7cd61d2a', '67fa7b271688151a7cd61d2b']
                    },
                    registrationDate: { type: 'string', format: 'date-time' },
                    canCancel: { type: 'boolean', example: true },
                    refundPercentage: { type: 'number', example: 50 },
                    refundAmountPerTicket: { type: 'number', example: 24.995 },
                    totalRefundedAmount: { type: 'number', example: 0 }
                }
            },
            NotificationPreferences: {
                type: 'object',
                properties: {
                    emailUpdates: { type: 'boolean', example: true },
                    eventReminders: { type: 'boolean', example: true },
                    promotionalEmails: { type: 'boolean', example: false }
                },
                required: ['emailUpdates', 'eventReminders', 'promotionalEmails']
            },
            UserProfile: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '67fa7a1f0c551c9170b9bf01' },
                    name: { type: 'string', example: 'Aarav Sharma' },
                    email: { type: 'string', format: 'email', example: 'aarav@example.com' },
                    phone: { type: 'string', nullable: true, example: '+91-9876543210' },
                    username: { type: 'string', example: 'aaravsharma' },
                    createdAt: { type: 'string', format: 'date-time' },
                    role: { type: 'string', enum: ['user', 'organizer', 'manager', 'admin'], example: 'user' }
                }
            },
            EventDetail: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '67fa7a1f0c551c9170b9bfe1' },
                    title: { type: 'string', example: 'TEDx Future of AI' },
                    category: { type: 'string', example: 'TEDx' },
                    description: { type: 'string', example: 'Ideas worth spreading on AI and ethics.' },
                    startDateTime: { type: 'string', format: 'date-time' },
                    endDateTime: { type: 'string', format: 'date-time' },
                    venue: { type: 'string', example: 'Convention Center Hall A' },
                    capacity: { type: 'integer', example: 500 },
                    ticketPrice: { type: 'number', example: 49.99 },
                    status: { type: 'string', enum: ['start_selling', 'upcoming', 'over'], example: 'start_selling' },
                    organizerId: { type: 'string' },
                    organizerName: { type: 'string', example: 'TED Organizers' },
                    image: { type: 'string', nullable: true },
                    registrationCount: { type: 'integer', example: 42 },
                    ticketsLeft: { type: 'integer', example: 458 }
                }
            },
            UserSessionData: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string', enum: ['user', 'organizer', 'manager', 'admin'] },
                    name: { type: 'string' },
                    isAuthenticated: { type: 'boolean', example: true }
                }
            },
            OrganizerProfile: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    userId: { type: 'string' },
                    organizationName: { type: 'string', example: 'TED Organizers' },
                    description: { type: 'string' },
                    contactNo: { type: 'string', example: '+91-9999988888' },
                    verified: { type: 'boolean', example: false },
                    verificationStatus: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
                    orgType: { type: 'string', example: 'Company' }
                }
            },
            AttendeeList: {
                type: 'object',
                properties: {
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                    phone: { type: 'string', nullable: true },
                    registrationDate: { type: 'string', format: 'date-time' },
                    ticketsCount: { type: 'integer', example: 2 },
                    status: { type: 'string', enum: ['active', 'cancelled'], example: 'active' }
                }
            },
            AdminDashboardStats: {
                type: 'object',
                properties: {
                    totalUsers: { type: 'integer', example: 1250 },
                    totalEvents: { type: 'integer', example: 94 },
                    totalOrganizers: { type: 'integer', example: 42 },
                    verifiedOrganizers: { type: 'integer', example: 35 },
                    pendingVerifications: { type: 'integer', example: 7 },
                    totalRevenue: { type: 'number', example: 125430.50 },
                    commissionEarned: { type: 'number', example: 6271.53 }
                }
            },
            ManagerDashboardStats: {
                type: 'object',
                properties: {
                    totalOrganizers: { type: 'integer', example: 42 },
                    approvedCount: { type: 'integer', example: 35 },
                    rejectedCount: { type: 'integer', example: 5 },
                    pendingCount: { type: 'integer', example: 2 }
                }
            },
            ChartData: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        month: { type: 'string', example: '2026-03' },
                        value: { type: 'number', example: 42 }
                    }
                }
            }
        }
    },
    paths: {
        '/events': {
            get: {
                tags: ['Homepage'],
                summary: 'Fetch events for Home page sections',
                description:
                    'Returns events grouped into two streams consumed by Home page: `selling` (`start_selling`) and `upcoming` (`upcoming`) with independent pagination.',
                parameters: [
                    {
                        in: 'query',
                        name: 'sellingPage',
                        schema: { type: 'integer', minimum: 1, default: 1 },
                        description: 'Page number for `selling` section.'
                    },
                    {
                        in: 'query',
                        name: 'upcomingPage',
                        schema: { type: 'integer', minimum: 1, default: 1 },
                        description: 'Page number for `upcoming` section.'
                    },
                    {
                        in: 'query',
                        name: 'limit',
                        schema: { type: 'integer', minimum: 1, maximum: 100, default: 12 },
                        description: 'Items per section per page.'
                    },
                    {
                        in: 'query',
                        name: 'title',
                        schema: { type: 'string' },
                        description: 'Case-insensitive title filter.'
                    },
                    {
                        in: 'query',
                        name: 'venue',
                        schema: { type: 'string' },
                        description: 'Case-insensitive venue filter.'
                    },
                    {
                        in: 'query',
                        name: 'category',
                        schema: { type: 'string' },
                        description: 'Case-insensitive category filter.'
                    }
                ],
                responses: {
                    200: {
                        description: 'Home page event data retrieved successfully.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                selling: {
                                                    type: 'object',
                                                    properties: {
                                                        events: {
                                                            type: 'array',
                                                            items: { $ref: '#/components/schemas/EventListItem' }
                                                        },
                                                        pagination: { $ref: '#/components/schemas/PaginationMeta' }
                                                    }
                                                },
                                                upcoming: {
                                                    type: 'object',
                                                    properties: {
                                                        events: {
                                                            type: 'array',
                                                            items: { $ref: '#/components/schemas/EventListItem' }
                                                        },
                                                        pagination: { $ref: '#/components/schemas/PaginationMeta' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    500: {
                        description: 'Server error while fetching events.',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorEnvelope' }
                            }
                        }
                    }
                }
            }
        },
        '/events/search/smart': {
            get: {
                tags: ['Homepage'],
                summary: 'Semantic smart search across upcoming events',
                description:
                    'Performs vector search on embedded event content and returns matching events with an AI-generated recommendation message.',
                parameters: [
                    {
                        in: 'query',
                        name: 'query',
                        required: true,
                        schema: { type: 'string', minLength: 1 },
                        description: 'Natural language search query.'
                    }
                ],
                responses: {
                    200: {
                        description: 'Smart search results returned.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                query: { type: 'string', example: 'AI events in Delhi this month' },
                                                aiMessage: {
                                                    type: 'string',
                                                    example: 'You might like TEDx Future of AI this weekend. It best matches your query and still has tickets available.'
                                                },
                                                events: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        properties: {
                                                            _id: { type: 'string' },
                                                            title: { type: 'string' },
                                                            description: { type: 'string' },
                                                            startDateTime: { type: 'string', format: 'date-time' },
                                                            venue: { type: 'string' },
                                                            category: { type: 'string' },
                                                            image: { type: 'string', nullable: true },
                                                            ticketPrice: { type: 'number' },
                                                            score: { type: 'number', example: 0.87 }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: 'Missing search query.' },
                    500: { description: 'Smart search failed (for example missing Gemini key or vector search failure).' }
                }
            }
        },
        '/stats': {
            get: {
                tags: ['Homepage'],
                summary: 'Get hero statistics',
                description: 'Returns aggregate counts displayed in homepage hero (events and organizers).',
                responses: {
                    200: {
                        description: 'Stats fetched successfully.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                totalEvents: { type: 'integer', example: 124 },
                                                totalOrganizers: { type: 'integer', example: 42 }
                                            },
                                            required: ['totalEvents', 'totalOrganizers']
                                        }
                                    }
                                }
                            }
                        }
                    },
                    500: {
                        description: 'Failed to fetch stats.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: false },
                                        message: { type: 'string', example: 'An error occurred while fetching statistics.' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/events/category/{category}': {
            get: {
                tags: ['Category Pages'],
                summary: 'Fetch events by category',
                description:
                    'Returns category-matched events with server-side pagination. Category matching is case-insensitive regex. Includes statuses: `start_selling`, `upcoming`, `over`.',
                parameters: [
                    {
                        in: 'path',
                        name: 'category',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Category name path segment (frontend sends URL-decoded values like `Health Camp`).'
                    },
                    {
                        in: 'query',
                        name: 'page',
                        schema: { type: 'integer', minimum: 1, default: 1 }
                    },
                    {
                        in: 'query',
                        name: 'limit',
                        schema: { type: 'integer', minimum: 1, maximum: 1000, default: 12 }
                    }
                ],
                responses: {
                    200: {
                        description: 'Category events retrieved successfully.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                category: { type: 'string', example: 'Health Camp' },
                                                events: {
                                                    type: 'array',
                                                    items: { $ref: '#/components/schemas/EventListItem' }
                                                },
                                                pagination: { $ref: '#/components/schemas/PaginationMeta' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    500: {
                        description: 'Server error while fetching category events.',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorEnvelope' }
                            }
                        }
                    }
                }
            }
        },
        '/payments/{id}': {
            get: {
                tags: ['Payment Pages'],
                summary: 'Get payment-page event and user data',
                description:
                    'Returns event checkout metadata, logged-in user basics, and current tickets left for checkout screen bootstrap.',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Event ObjectId.'
                    }
                ],
                responses: {
                    200: {
                        description: 'Payment page data loaded.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Payment data retrieved successfully' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                event: { $ref: '#/components/schemas/EventListItem' },
                                                user: {
                                                    type: 'object',
                                                    properties: {
                                                        _id: { type: 'string' },
                                                        name: { type: 'string' },
                                                        email: { type: 'string' },
                                                        phone: { type: 'string', nullable: true }
                                                    }
                                                },
                                                ticketsLeft: { type: 'integer', example: 43 },
                                                totalRegistrations: { type: 'integer', example: 57 }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Invalid event ID.',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorEnvelope' }
                            }
                        }
                    },
                    401: {
                        description: 'Not logged in.',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorEnvelope' }
                            }
                        }
                    },
                    404: {
                        description: 'Event or user not found.',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorEnvelope' }
                            }
                        }
                    }
                }
            }
        },
        '/payments/events/{id}/tickets-left': {
            get: {
                tags: ['Payment Pages'],
                summary: 'Get remaining tickets for event',
                description: 'Polled by payment page to keep ticket availability up-to-date.',
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Event ObjectId.'
                    }
                ],
                responses: {
                    200: {
                        description: 'Remaining ticket count returned.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        ticketsLeft: { type: 'integer', example: 41 }
                                    },
                                    required: ['ticketsLeft']
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Invalid event ID.',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorEnvelope' }
                            }
                        }
                    },
                    404: {
                        description: 'Event not found.',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorEnvelope' }
                            }
                        }
                    }
                }
            }
        },
        '/payments/create-order': {
            post: {
                tags: ['Payment Pages'],
                summary: 'Create Razorpay order and pending payment record',
                description:
                    'Validates ticket availability, creates Razorpay order, and stores a pending payment before checkout completion.',
                security: [{ sessionCookie: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['eventId', 'tickets'],
                                properties: {
                                    eventId: { type: 'string', example: '67fa7a1f0c551c9170b9bfe1' },
                                    tickets: { type: 'integer', minimum: 1, example: 2 },
                                    paymentMethod: { type: 'string', enum: ['card', 'upi'], example: 'upi' },
                                    leadName: { type: 'string', example: 'Aarav Sharma' },
                                    leadEmail: { type: 'string', format: 'email', example: 'aarav@example.com' },
                                    additionalEmails: {
                                        type: 'array',
                                        items: { type: 'string', format: 'email' },
                                        example: ['friend1@example.com']
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Razorpay order created successfully.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        order: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string', example: 'order_PfG2a0abc12345' },
                                                amount: { type: 'integer', example: 9998 },
                                                currency: { type: 'string', example: 'INR' }
                                            }
                                        },
                                        key: { type: 'string', example: 'rzp_test_xxxxxxxxx' },
                                        paymentId: { type: 'string', example: '67fa7d4b73ad15ec184eb71a' },
                                        event: {
                                            type: 'object',
                                            properties: {
                                                title: { type: 'string', example: 'TEDx Future of AI' },
                                                ticketPrice: { type: 'number', example: 49.99 }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: 'Invalid payload, invalid event id, or insufficient tickets.' },
                    401: { description: 'Unauthorized.' },
                    404: { description: 'Event not found.' },
                    500: { description: 'Payment gateway configuration error.' }
                }
            }
        },
        '/payments/verify-payment': {
            post: {
                tags: ['Payment Pages'],
                summary: 'Verify Razorpay payment and create registrations',
                description:
                    'Verifies payment signature, marks payment completed, creates registrations atomically, and returns generated registration ids.',
                security: [{ sessionCookie: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['eventId', 'razorpayOrderId', 'razorpayPaymentId', 'razorpaySignature'],
                                properties: {
                                    eventId: { type: 'string', example: '67fa7a1f0c551c9170b9bfe1' },
                                    tickets: { type: 'integer', minimum: 1, example: 2 },
                                    razorpayOrderId: { type: 'string', example: 'order_PfG2a0abc12345' },
                                    razorpayPaymentId: { type: 'string', example: 'pay_PfG2wxyz123456' },
                                    razorpaySignature: { type: 'string', example: '4a7f5ed68b83f....' },
                                    paymentMethod: { type: 'string', enum: ['card', 'upi'], example: 'card' },
                                    leadName: { type: 'string', example: 'Aarav Sharma' },
                                    leadEmail: { type: 'string', format: 'email', example: 'aarav@example.com' },
                                    additionalEmails: {
                                        type: 'array',
                                        items: { type: 'string', format: 'email' },
                                        example: ['friend1@example.com']
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Payment verified and registrations finalized.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        ticketsLeft: { type: 'integer', example: 39 },
                                        paymentId: { type: 'string', example: '67fa7d4b73ad15ec184eb71a' },
                                        transactionId: { type: 'string', example: 'pay_PfG2wxyz123456' },
                                        totalPrice: { type: 'number', example: 99.98 },
                                        registrationIds: {
                                            type: 'array',
                                            items: { type: 'string' },
                                            example: ['67fa7d4b73ad15ec184eb72a', '67fa7d4b73ad15ec184eb72b']
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: 'Invalid payload, failed signature verification, or ticket mismatch.' },
                    401: { description: 'Unauthorized.' },
                    404: { description: 'Event or payment order not found.' },
                    409: { description: 'Payment conflict or tickets sold out during confirmation.' },
                    500: { description: 'Server-side verification failure.' }
                }
            }
        },
        '/payments/process-payment': {
            post: {
                tags: ['Payment Pages'],
                summary: 'Deprecated legacy payment endpoint',
                description:
                    'Backward compatibility route. Always returns deprecation error. Use `/payments/create-order` and `/payments/verify-payment`.',
                security: [{ sessionCookie: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    eventId: { type: 'string', example: '67fa7a1f0c551c9170b9bfe1' },
                                    tickets: { type: 'integer', minimum: 1, example: 2 },
                                    paymentMethod: { type: 'string', enum: ['card', 'upi'], example: 'card' },
                                    leadName: { type: 'string', example: 'Aarav Sharma' },
                                    leadEmail: { type: 'string', format: 'email', example: 'aarav@example.com' },
                                    additionalEmails: {
                                        type: 'array',
                                        items: { type: 'string', format: 'email' },
                                        example: ['friend1@example.com']
                                    },
                                    cardNumber: { type: 'string', example: '4111111111111111' },
                                    cardName: { type: 'string', example: 'AARAV SHARMA' },
                                    cardExpiry: { type: 'string', example: '0528' },
                                    cardCvv: { type: 'string', example: '123' },
                                    upiId: { type: 'string', example: 'aarav@okbank' }
                                },
                                required: ['eventId', 'tickets']
                            }
                        }
                    }
                },
                responses: {
                    410: {
                        description: 'Deprecated endpoint.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: false },
                                        message: {
                                            type: 'string',
                                            example: 'Deprecated endpoint. Use /payments/create-order and /payments/verify-payment.'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/user/dashboard': {
            get: {
                tags: ['User Dashboard'],
                summary: 'Get consolidated dashboard payload',
                description: 'Returns user profile basics, grouped bookings, and dashboard stats for overview and booking tabs.',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'Dashboard data returned.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                user: {
                                                    type: 'object',
                                                    properties: {
                                                        name: { type: 'string', example: 'Aarav Sharma' },
                                                        email: { type: 'string', format: 'email', example: 'aarav@example.com' },
                                                        username: { type: 'string', example: 'aaravsharma' }
                                                    }
                                                },
                                                bookings: {
                                                    type: 'array',
                                                    items: { $ref: '#/components/schemas/UserDashboardBooking' }
                                                },
                                                stats: {
                                                    type: 'object',
                                                    properties: {
                                                        totalBookings: { type: 'integer', example: 5 },
                                                        upcomingEvents: { type: 'integer', example: 3 },
                                                        completedEvents: { type: 'integer', example: 1 },
                                                        cancelledEvents: { type: 'integer', example: 1 }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: {
                        description: 'User not authenticated.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: false },
                                        message: { type: 'string', example: 'User not authenticated' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/user/saved-events': {
            get: {
                tags: ['User Dashboard'],
                summary: 'Get user saved events',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'Saved events fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        events: {
                                            type: 'array',
                                            items: {
                                                allOf: [
                                                    { $ref: '#/components/schemas/EventListItem' },
                                                    {
                                                        type: 'object',
                                                        properties: {
                                                            savedDate: { type: 'string', format: 'date-time' },
                                                            savedEventId: { type: 'string' }
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: {
                        description: 'User not authenticated.'
                    }
                }
            }
        },
        '/user/unsave-event': {
            post: {
                tags: ['User Dashboard'],
                summary: 'Remove event from saved list',
                security: [{ sessionCookie: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['eventId'],
                                properties: {
                                    eventId: { type: 'string', example: '67fa7a1f0c551c9170b9bfe1' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Event unsaved successfully.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Event unsaved successfully!' }
                                    }
                                }
                            }
                        }
                    },
                    404: {
                        description: 'Event not found in saved list.'
                    }
                }
            }
        },
        '/user/payment-history': {
            get: {
                tags: ['User Dashboard'],
                summary: 'Get paginated payment history',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'query',
                        name: 'page',
                        schema: { type: 'integer', minimum: 1, default: 1 }
                    },
                    {
                        in: 'query',
                        name: 'limit',
                        schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
                    },
                    {
                        in: 'query',
                        name: 'status',
                        schema: {
                            type: 'string',
                            enum: ['completed', 'refunded', 'partial_refund']
                        }
                    },
                    {
                        in: 'query',
                        name: 'startDate',
                        schema: { type: 'string', format: 'date' }
                    },
                    {
                        in: 'query',
                        name: 'endDate',
                        schema: { type: 'string', format: 'date' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Payment history fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                payments: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        properties: {
                                                            _id: { type: 'string' },
                                                            transactionId: { type: 'string' },
                                                            eventTitle: { type: 'string' },
                                                            eventDate: { type: 'string', format: 'date-time' },
                                                            eventVenue: { type: 'string' },
                                                            eventImage: { type: 'string', nullable: true },
                                                            tickets: { type: 'integer' },
                                                            totalPrice: { type: 'number' },
                                                            paymentDate: { type: 'string', format: 'date-time' },
                                                            status: { type: 'string', enum: ['completed', 'partial_refund', 'refunded'] },
                                                            refundAmount: { type: 'number' },
                                                            refundDate: { type: 'string', format: 'date-time', nullable: true },
                                                            refundedTickets: { type: 'integer' },
                                                            netAmount: { type: 'number' }
                                                        }
                                                    }
                                                },
                                                pagination: {
                                                    type: 'object',
                                                    properties: {
                                                        currentPage: { type: 'integer' },
                                                        totalPages: { type: 'integer' },
                                                        totalCount: { type: 'integer' },
                                                        hasMore: { type: 'boolean' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/user/activity-stats': {
            get: {
                tags: ['User Dashboard'],
                summary: 'Get activity chart and spending analytics',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'Activity stats fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                monthlyAttendance: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        properties: {
                                                            month: { type: 'string', example: '2026-03' },
                                                            events: { type: 'integer', example: 2 }
                                                        }
                                                    }
                                                },
                                                monthlySpending: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        properties: {
                                                            month: { type: 'string', example: '2026-03' },
                                                            amount: { type: 'number', example: 98.75 }
                                                        }
                                                    }
                                                },
                                                spendingByCategory: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        properties: {
                                                            category: { type: 'string', example: 'TEDx' },
                                                            amount: { type: 'number', example: 199.5 },
                                                            count: { type: 'integer', example: 3 }
                                                        }
                                                    }
                                                },
                                                summary: {
                                                    type: 'object',
                                                    properties: {
                                                        totalSpent: { type: 'number', example: 354.75 },
                                                        totalEvents: { type: 'integer', example: 8 },
                                                        avgSpentPerEvent: { type: 'number', example: 44.34 },
                                                        categoriesExplored: { type: 'integer', example: 4 }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/user/notification-preferences': {
            get: {
                tags: ['User Dashboard'],
                summary: 'Get notification preferences',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'Preferences fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: { $ref: '#/components/schemas/NotificationPreferences' }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'User not authenticated.' },
                    404: { description: 'User not found.' }
                }
            },
            put: {
                tags: ['User Dashboard'],
                summary: 'Update notification preferences',
                security: [{ sessionCookie: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/NotificationPreferences' }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Preferences updated.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: {
                                            type: 'string',
                                            example: 'Notification preferences updated successfully'
                                        },
                                        data: { $ref: '#/components/schemas/NotificationPreferences' }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'User not authenticated.' }
                }
            }
        },
        '/user/profile': {
            get: {
                tags: ['User Dashboard'],
                summary: 'Get current user profile',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'User profile fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        user: { $ref: '#/components/schemas/UserProfile' }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'User not authenticated.' },
                    404: { description: 'User not found.' }
                }
            },
            put: {
                tags: ['User Dashboard'],
                summary: 'Update user profile basics',
                description: 'Current implementation updates only `name` from submitted payload.',
                security: [{ sessionCookie: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', example: 'Aarav Sharma' },
                                    phone: { type: 'string', example: '+91-9999988888' },
                                    username: { type: 'string', example: 'aaravsharma' }
                                },
                                required: ['name']
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Profile updated.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Profile updated successfully' },
                                        user: {
                                            type: 'object',
                                            properties: {
                                                _id: { type: 'string' },
                                                name: { type: 'string' },
                                                email: { type: 'string' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Validation failure.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: false },
                                        message: { type: 'string', example: 'Name is required' }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'User not authenticated.' }
                }
            }
        },
        '/user/change-password': {
            post: {
                tags: ['User Dashboard'],
                summary: 'Change account password',
                security: [{ sessionCookie: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['currentPassword', 'newPassword'],
                                properties: {
                                    currentPassword: { type: 'string', example: 'OldPass@123' },
                                    newPassword: { type: 'string', example: 'NewPass@123' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Password changed successfully.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Password changed successfully' }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Missing fields or invalid current password.'
                    },
                    401: { description: 'User not authenticated.' }
                }
            }
        },
        '/user/update-email': {
            post: {
                tags: ['User Dashboard'],
                summary: 'Update account email',
                security: [{ sessionCookie: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['newEmail', 'password'],
                                properties: {
                                    newEmail: { type: 'string', format: 'email', example: 'newmail@example.com' },
                                    password: { type: 'string', example: 'CurrentPass@123' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Email updated.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Email updated successfully' }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Invalid email/password or duplicate email.'
                    },
                    401: { description: 'User not authenticated.' }
                }
            }
        },
        '/user/cancel-booking': {
            post: {
                tags: ['User Dashboard'],
                summary: 'Cancel booked tickets with time-based refund',
                description:
                    'Cancels specified active registrations for one event and computes refund as per policy: >7 days 100%, 3-7 days 50%, <3 days 0%.',
                security: [{ sessionCookie: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['registrationIds'],
                                properties: {
                                    registrationIds: {
                                        type: 'array',
                                        minItems: 1,
                                        items: { type: 'string' },
                                        example: ['67fa7b271688151a7cd61d2a', '67fa7b271688151a7cd61d2b']
                                    },
                                    ticketCount: {
                                        type: 'integer',
                                        minimum: 1,
                                        description: 'Optional number of tickets to cancel from registrationIds order.',
                                        example: 1
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Cancellation completed.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: '1 ticket(s) cancelled successfully' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                cancelledCount: { type: 'integer', example: 1 },
                                                totalRefundAmount: { type: 'number', example: 49.99 },
                                                refundAmountPerTicket: { type: 'number', example: 49.99 },
                                                refundPercentage: { type: 'number', example: 100 },
                                                refundMessage: { type: 'string', example: 'Full refund (more than 7 days before event)' },
                                                cancelledAt: { type: 'string', format: 'date-time' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Validation or policy violation.'
                    },
                    401: { description: 'User not authenticated.' },
                    404: { description: 'No matching active registrations found.' }
                }
            }
        },
        '/user/events': {
            get: {
                tags: ['User Dashboard'],
                summary: 'Get events from user registrations',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'User events fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        events: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/EventListItem' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'User not authenticated.' }
                }
            }
        },
        '/user/save-event': {
            post: {
                tags: ['User Dashboard'],
                summary: 'Save an event for user',
                security: [{ sessionCookie: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['eventId'],
                                properties: {
                                    eventId: { type: 'string', example: '67fa7a1f0c551c9170b9bfe1' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Event saved or already saved.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        alreadySaved: { type: 'boolean', example: false },
                                        message: { type: 'string', example: 'Event saved successfully!' }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: 'Already saved or invalid payload.' },
                    401: { description: 'User not authenticated.' }
                }
            }
        },
        '/user/check-saved-status': {
            get: {
                tags: ['User Dashboard'],
                summary: 'Check whether an event is saved by user',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'query',
                        name: 'eventId',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Saved status fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        isSaved: { type: 'boolean', example: false }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: 'eventId is required.' },
                    500: { description: 'Server error while checking saved status.' }
                }
            }
        },
        '/user/refund-preview/{registrationId}': {
            get: {
                tags: ['User Dashboard'],
                summary: 'Get refund preview for a registration',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'registrationId',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: { description: 'Refund preview fetched.' },
                    400: { description: 'Invalid registration id.' },
                    401: { description: 'User not authenticated.' },
                    403: { description: 'Booking does not belong to current user.' },
                    404: { description: 'Registration not found.' }
                }
            }
        },
        '/events/{id}': {
            get: {
                tags: ['Event Detail Page'],
                summary: 'Get event detail payload by ID',
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Event detail fetched with related events.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                event: { $ref: '#/components/schemas/EventDetail' },
                                                relatedEvents: {
                                                    type: 'array',
                                                    items: { $ref: '#/components/schemas/EventListItem' },
                                                    description: 'Similar events from same category'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Event not found.' }
                }
            },
            delete: {
                tags: ['Event Detail Page'],
                summary: 'Delete event by ID (authenticated)',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Event deleted.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Event deleted successfully.' }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Unauthorized.' },
                    404: { description: 'Event not found.' }
                }
            }
        },
        '/sign-up': {
            post: {
                tags: ['Authentication'],
                summary: 'Sign up a user account',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'password1', 'password2'],
                                properties: {
                                    name: { type: 'string', example: 'Aarav Sharma' },
                                    email: { type: 'string', format: 'email', example: 'aarav@example.com' },
                                    password1: { type: 'string', example: 'StrongPass@123' },
                                    password2: { type: 'string', example: 'StrongPass@123' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'User created.' },
                    400: { description: 'Validation failure or duplicate email.' }
                }
            }
        },
        '/login': {
            post: {
                tags: ['Authentication'],
                summary: 'Sign in user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Login success and session created.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Login successful.' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                userId: { type: 'string' },
                                                name: { type: 'string' },
                                                email: { type: 'string', format: 'email' },
                                                role: { type: 'string', enum: ['user', 'organizer', 'manager', 'admin'] },
                                                adminId: { type: 'string', nullable: true },
                                                managerId: { type: 'string', nullable: true },
                                                organizerId: { type: 'string', nullable: true },
                                                organizationName: { type: 'string', nullable: true },
                                                verified: { type: 'boolean', nullable: true },
                                                verificationStatus: { type: 'string', nullable: true }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Invalid credentials.' }
                }
            }
        },
        '/check-session': {
            get: {
                tags: ['Authentication'],
                summary: 'Check active session and role info',
                responses: {
                    200: {
                        description: 'Session status returned.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        isAuthenticated: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'No active session.' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                userId: { type: 'string' },
                                                name: { type: 'string' },
                                                email: { type: 'string', format: 'email' },
                                                role: { type: 'string', enum: ['user', 'organizer', 'manager', 'admin'] },
                                                adminId: { type: 'string', nullable: true },
                                                managerId: { type: 'string', nullable: true },
                                                organizerId: { type: 'string', nullable: true },
                                                organizationName: { type: 'string', nullable: true },
                                                verified: { type: 'boolean', nullable: true },
                                                verificationStatus: { type: 'string', nullable: true }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/organizer-login': {
            get: {
                tags: ['Authentication'],
                summary: 'Check organizer login status',
                responses: {
                    200: {
                        description: 'Organizer login endpoint response.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string' },
                                        isOrganizer: { type: 'boolean', example: false },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                organizerId: { type: 'string', nullable: true },
                                                organizationName: { type: 'string', nullable: true },
                                                verified: { type: 'boolean', nullable: true },
                                                userId: { type: 'string', nullable: true },
                                                name: { type: 'string', nullable: true },
                                                email: { type: 'string', format: 'email', nullable: true }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Please log in to continue.' }
                }
            }
        },
        '/host_with_us': {
            post: {
                tags: ['Authentication'],
                summary: 'Register organizer profile',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    orgName: { type: 'string', example: 'TEDx Delhi Organizers' },
                                    mobile: { type: 'string', example: '+91-9999988888' },
                                    description: { type: 'string' }
                                },
                                required: ['orgName', 'mobile']
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Organizer registration submitted.' },
                    400: { description: 'Invalid payload.' },
                    401: { description: 'Unauthorized.' }
                }
            }
        },
        '/logout': {
            get: {
                tags: ['Authentication'],
                summary: 'Logout current user session',
                responses: {
                    200: {
                        description: 'Logged out successfully.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Logged out successfully' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/organizer/dashboard': {
            get: {
                tags: ['Organizer Dashboard'],
                summary: 'Get organizer dashboard overview',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'Organizer dashboard fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                organizer: { $ref: '#/components/schemas/OrganizerProfile' },
                                                user: {
                                                    type: 'object',
                                                    properties: {
                                                        name: { type: 'string', example: 'Aarav Sharma' },
                                                        email: { type: 'string', format: 'email', example: 'aarav@example.com' }
                                                    }
                                                },
                                                events: {
                                                    type: 'array',
                                                    items: { $ref: '#/components/schemas/EventDetail' }
                                                },
                                                stats: {
                                                    type: 'object',
                                                    properties: {
                                                        totalEvents: { type: 'integer', example: 12 },
                                                        totalActiveEvents: { type: 'integer', example: 5 },
                                                        totalAttendees: { type: 'integer', example: 342 },
                                                        totalRevenue: { type: 'number', example: 15234.50 },
                                                        revenueChange: { type: 'number', example: 12 },
                                                        attendeeChange: { type: 'number', example: 8 },
                                                        totalTicketsSold: { type: 'integer', example: 420 },
                                                        ticketsSoldChange: { type: 'number', example: 8 },
                                                        avgTicketPrice: { type: 'number', example: 299 },
                                                        topSellingEvent: { type: 'object', nullable: true }
                                                    }
                                                },
                                                upcomingEvents: {
                                                    type: 'array',
                                                    items: { $ref: '#/components/schemas/EventListItem' },
                                                    maxItems: 5
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Unauthorized.' }
                }
            }
        },
        '/organizer/events': {
            get: {
                tags: ['Organizer Dashboard'],
                summary: 'Get organizer dashboard payload (alias route)',
                description: 'This route is currently mapped to the same controller as `/organizer/dashboard`.',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'Organizer dashboard fetched via alias route.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                organizer: { $ref: '#/components/schemas/OrganizerProfile' },
                                                user: {
                                                    type: 'object',
                                                    properties: {
                                                        name: { type: 'string', example: 'Aarav Sharma' },
                                                        email: { type: 'string', format: 'email', example: 'aarav@example.com' }
                                                    }
                                                },
                                                events: {
                                                    type: 'array',
                                                    items: { $ref: '#/components/schemas/EventDetail' }
                                                },
                                                stats: {
                                                    type: 'object',
                                                    properties: {
                                                        totalEvents: { type: 'integer', example: 12 },
                                                        totalActiveEvents: { type: 'integer', example: 5 },
                                                        totalAttendees: { type: 'integer', example: 342 },
                                                        totalRevenue: { type: 'number', example: 15234.50 },
                                                        revenueChange: { type: 'number', example: 12 },
                                                        attendeeChange: { type: 'number', example: 8 },
                                                        totalTicketsSold: { type: 'integer', example: 420 },
                                                        ticketsSoldChange: { type: 'number', example: 8 },
                                                        avgTicketPrice: { type: 'number', example: 299 },
                                                        topSellingEvent: { type: 'object', nullable: true }
                                                    }
                                                },
                                                upcomingEvents: {
                                                    type: 'array',
                                                    items: { $ref: '#/components/schemas/EventListItem' },
                                                    maxItems: 5
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Unauthorized.' }
                }
            },
            post: {
                tags: ['Organizer Dashboard'],
                summary: 'Create organizer event (multipart)',
                security: [{ sessionCookie: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                required: ['category', 'title', 'description', 'startDateTime', 'endDateTime', 'venue', 'capacity', 'price'],
                                properties: {
                                    category: { type: 'string', example: 'TEDx' },
                                    title: { type: 'string', example: 'TEDx Future of AI' },
                                    description: { type: 'string', example: 'Ideas worth spreading on AI and ethics.' },
                                    startDateTime: { type: 'string', format: 'date-time', example: '2026-04-10T09:00:00.000Z' },
                                    endDateTime: { type: 'string', format: 'date-time', example: '2026-04-10T16:00:00.000Z' },
                                    venue: { type: 'string', example: 'Convention Center Hall A' },
                                    capacity: { type: 'integer', minimum: 1, example: 500 },
                                    price: { type: 'number', minimum: 0, example: 49.99 },
                                    status: { type: 'string', enum: ['start_selling', 'upcoming', 'over'], example: 'start_selling' },
                                    image: { type: 'string', format: 'binary' },
                                    orgType: {
                                        type: 'string',
                                        enum: ['Individual', 'Company', 'NGO', 'College/University', 'Government', 'Hospital', 'Clinic', 'Event Company', 'Artist Management']
                                    },
                                    registeredAddressLine1: { type: 'string' },
                                    registeredAddressLine2: { type: 'string' },
                                    registeredCity: { type: 'string' },
                                    registeredState: { type: 'string' },
                                    registeredPostalCode: { type: 'string' },
                                    registeredCountry: { type: 'string' },
                                    website: { type: 'string' },
                                    registrationNumber: { type: 'string' },
                                    yearEstablished: { type: 'integer' },
                                    facebook: { type: 'string' },
                                    instagram: { type: 'string' },
                                    twitter: { type: 'string' },
                                    linkedin: { type: 'string' },
                                    youtube: { type: 'string' },
                                    tedxLicenseId: { type: 'string' },
                                    tedxLicenseOwnerName: { type: 'string' },
                                    tedxLicenseOwnerEmail: { type: 'string', format: 'email' },
                                    tedxLicenseScope: { type: 'string' },
                                    tedxLicenseExpiryDate: { type: 'string', format: 'date' },
                                    tedxDocumentLinks: { type: 'string' },
                                    healthOrganizerType: { type: 'string', enum: ['Hospital', 'Clinic', 'NGO', 'Individual Doctor Group'] },
                                    healthDirectorName: { type: 'string' },
                                    healthRegistrationNumber: { type: 'string' },
                                    healthPartnerHospitalName: { type: 'string' },
                                    healthEmergencyContact: { type: 'string' },
                                    healthDocumentLinks: { type: 'string' },
                                    concertOrganizerType: { type: 'string', enum: ['Event Company', 'Artist Management', 'Individual'] },
                                    concertPrimaryArtists: { type: 'string' },
                                    concertVenueNameConfirm: { type: 'string' },
                                    concertVenueCapacityConfirm: { type: 'string' },
                                    concertAgeRestrictions: { type: 'string' },
                                    concertDocumentLinks: { type: 'string' },
                                    exhibitionVenueDetails: { type: 'string' },
                                    exhibitionHallDetails: { type: 'string' },
                                    exhibitionKeyExhibitors: { type: 'string' },
                                    exhibitionDocumentLinks: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Event created.' },
                    400: { description: 'Validation failed.' }
                }
            }
        },
        '/organizer/events/{id}': {
            put: {
                tags: ['Organizer Dashboard'],
                summary: 'Update organizer event (multipart)',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    category: { type: 'string' },
                                    title: { type: 'string' },
                                    description: { type: 'string' },
                                    startDateTime: { type: 'string', format: 'date-time' },
                                    endDateTime: { type: 'string', format: 'date-time' },
                                    venue: { type: 'string' },
                                    capacity: { type: 'integer', minimum: 1 },
                                    price: { type: 'number', minimum: 0 },
                                    status: { type: 'string', enum: ['start_selling', 'upcoming', 'over'] },
                                    orgType: {
                                        type: 'string',
                                        enum: ['Individual', 'Company', 'NGO', 'College/University', 'Government', 'Hospital', 'Clinic', 'Event Company', 'Artist Management']
                                    },
                                    registeredAddressLine1: { type: 'string' },
                                    registeredAddressLine2: { type: 'string' },
                                    registeredCity: { type: 'string' },
                                    registeredState: { type: 'string' },
                                    registeredPostalCode: { type: 'string' },
                                    registeredCountry: { type: 'string' },
                                    website: { type: 'string' },
                                    registrationNumber: { type: 'string' },
                                    yearEstablished: { type: 'integer' },
                                    facebook: { type: 'string' },
                                    instagram: { type: 'string' },
                                    twitter: { type: 'string' },
                                    linkedin: { type: 'string' },
                                    youtube: { type: 'string' },
                                    tedxLicenseId: { type: 'string' },
                                    tedxLicenseOwnerName: { type: 'string' },
                                    tedxLicenseOwnerEmail: { type: 'string', format: 'email' },
                                    tedxLicenseScope: { type: 'string' },
                                    tedxLicenseExpiryDate: { type: 'string', format: 'date' },
                                    tedxDocumentLinks: { type: 'string' },
                                    healthOrganizerType: { type: 'string', enum: ['Hospital', 'Clinic', 'NGO', 'Individual Doctor Group'] },
                                    healthDirectorName: { type: 'string' },
                                    healthRegistrationNumber: { type: 'string' },
                                    healthPartnerHospitalName: { type: 'string' },
                                    healthEmergencyContact: { type: 'string' },
                                    healthDocumentLinks: { type: 'string' },
                                    concertOrganizerType: { type: 'string', enum: ['Event Company', 'Artist Management', 'Individual'] },
                                    concertPrimaryArtists: { type: 'string' },
                                    concertVenueNameConfirm: { type: 'string' },
                                    concertVenueCapacityConfirm: { type: 'string' },
                                    concertAgeRestrictions: { type: 'string' },
                                    concertDocumentLinks: { type: 'string' },
                                    exhibitionVenueDetails: { type: 'string' },
                                    exhibitionHallDetails: { type: 'string' },
                                    exhibitionKeyExhibitors: { type: 'string' },
                                    exhibitionDocumentLinks: { type: 'string' },
                                    image: { type: 'string', format: 'binary' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Event updated.' },
                    404: { description: 'Event not found.' }
                }
            },
            delete: {
                tags: ['Organizer Dashboard'],
                summary: 'Delete organizer event',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: { description: 'Event deleted.' },
                    404: { description: 'Event not found.' }
                }
            }
        },
        '/organizer/profile': {
            put: {
                tags: ['Organizer Dashboard'],
                summary: 'Update organizer profile',
                security: [{ sessionCookie: [] }],
                requestBody: {
                    required: false,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    organizationName: { type: 'string', example: 'TED Organizers' },
                                    description: { type: 'string', example: 'We organize TEDx events globally' },
                                    contactNo: { type: 'string', example: '+91-9999988888' },
                                    orgType: { type: 'string', enum: ['Individual', 'Company', 'NGO', 'College/University', 'Government', 'Hospital'], example: 'Company' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Organizer profile updated.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Profile updated successfully' },
                                        data: { $ref: '#/components/schemas/OrganizerProfile' }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: 'Invalid payload or validation error.' },
                    401: { description: 'Unauthorized.' }
                }
            }
        },
        '/organizer/change-password': {
            put: {
                tags: ['Organizer Dashboard'],
                summary: 'Change organizer account password',
                security: [{ sessionCookie: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['currentPassword', 'newPassword'],
                                properties: {
                                    currentPassword: { type: 'string', example: 'OldPass@123' },
                                    newPassword: { type: 'string', example: 'NewPass@123' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Password updated.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Password changed successfully' }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: 'Invalid payload or old password mismatch.' },
                    401: { description: 'Unauthorized.' }
                }
            }
        },
        '/organizer/events/{eventId}/attendees': {
            get: {
                tags: ['Organizer Dashboard'],
                summary: 'Get attendees for organizer event',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'eventId',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Attendees fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                event: {
                                                    type: 'object',
                                                    properties: {
                                                        _id: { type: 'string' },
                                                        title: { type: 'string' },
                                                        startDateTime: { type: 'string', format: 'date-time' }
                                                    }
                                                },
                                                attendees: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        properties: {
                                                            userId: { type: 'string' },
                                                            name: { type: 'string' },
                                                            email: { type: 'string', format: 'email' },
                                                            ticketCount: { type: 'integer' },
                                                            firstRegistrationDate: { type: 'string', format: 'date-time' },
                                                            lastRegistrationDate: { type: 'string', format: 'date-time' }
                                                        }
                                                    }
                                                },
                                                totalAttendees: { type: 'integer', example: 42 },
                                                totalTickets: { type: 'integer', example: 57 }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Event not found.' }
                }
            }
        },
        '/organizer/events/{eventId}/attendees/export': {
            get: {
                tags: ['Organizer Dashboard'],
                summary: 'Export organizer attendees list',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'eventId',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'format',
                        schema: { type: 'string', enum: ['csv', 'xlsx'], default: 'csv' }
                    }
                ],
                responses: {
                    200: {
                        description: 'CSV file generated, or JSON data returned for non-csv format.',
                        content: {
                            'text/csv': {
                                schema: { type: 'string', format: 'binary' }
                            },
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    name: { type: 'string' },
                                                    email: { type: 'string', format: 'email' },
                                                    ticketCount: { type: 'integer' },
                                                    registrationDate: { type: 'string', format: 'date-time' }
                                                }
                                            }
                                        },
                                        eventTitle: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Event not found.' }
                }
            }
        },
        '/organizer/events/{eventId}/send-email': {
            post: {
                tags: ['Organizer Dashboard'],
                summary: 'Send bulk email to attendees of organizer event',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'eventId',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['subject', 'message', 'recipientEmails'],
                                properties: {
                                    subject: { type: 'string', minLength: 3, maxLength: 200, example: 'Event Reminder: TEDx Future of AI' },
                                    message: { type: 'string', minLength: 10, maxLength: 5000, example: 'Dear attendee, we are glad to have you at our event!' },
                                    recipientEmails: {
                                        type: 'array',
                                        minItems: 1,
                                        items: { type: 'string', format: 'email' },
                                        example: ['john@example.com', 'riya@example.com']
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Bulk email sent successfully.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Email sent to 42 attendees' },
                                        emailsSent: { type: 'integer', example: 42 }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: 'Invalid payload.' },
                    404: { description: 'Event not found.' }
                }
            }
        },
        '/organizer/submit-verification': {
            post: {
                tags: ['Organizer Dashboard'],
                summary: 'Submit organizer verification document (multipart)',
                security: [{ sessionCookie: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                required: ['verificationDocument'],
                                properties: {
                                    verificationDocument: { type: 'string', format: 'binary' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Verification request submitted.' },
                    400: { description: 'Invalid submission.' },
                    401: { description: 'Unauthorized.' }
                }
            }
        },
        '/organizer/verification-status': {
            get: {
                tags: ['Organizer Dashboard'],
                summary: 'Get organizer verification status',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'Verification status fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                verificationStatus: { type: 'string', enum: ['not_submitted', 'pending', 'approved', 'rejected'], example: 'pending' },
                                                verified: { type: 'boolean', example: false },
                                                verificationRequestDate: { type: 'string', format: 'date-time', nullable: true },
                                                verificationReviewDate: { type: 'string', format: 'date-time', nullable: true },
                                                rejectionReason: { type: 'string', nullable: true, example: 'Document not clear' },
                                                hasDocument: { type: 'boolean', example: true }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Unauthorized.' }
                }
            }
        },
        '/manager/dashboard': {
            get: {
                tags: ['Manager Dashboard'],
                summary: 'Get manager dashboard overview',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'Manager dashboard fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                stats: {
                                                    type: 'object',
                                                    properties: {
                                                        totalOrganizers: { type: 'integer', example: 42 },
                                                        pendingVerifications: { type: 'integer', example: 2 },
                                                        approvedOrganizers: { type: 'integer', example: 35 },
                                                        rejectedOrganizers: { type: 'integer', example: 5 },
                                                        notSubmitted: { type: 'integer', example: 3 }
                                                    }
                                                },
                                                recentRequests: {
                                                    type: 'array',
                                                    items: { $ref: '#/components/schemas/OrganizerProfile' },
                                                    maxItems: 10
                                                },
                                                recentReviews: {
                                                    type: 'array',
                                                    items: { $ref: '#/components/schemas/OrganizerProfile' }
                                                },
                                                manager: {
                                                    type: 'object',
                                                    properties: {
                                                        name: { type: 'string', example: 'Manager Name' },
                                                        email: { type: 'string', format: 'email', example: 'manager@example.com' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Unauthorized.' }
                }
            }
        },
        '/manager/organizers': {
            get: {
                tags: ['Manager Dashboard'],
                summary: 'Get organizer list for manager',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'query',
                        name: 'page',
                        schema: { type: 'integer', minimum: 1, default: 1 }
                    },
                    {
                        in: 'query',
                        name: 'limit',
                        schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
                    },
                    {
                        in: 'query',
                        name: 'status',
                        schema: { type: 'string', enum: ['all', 'pending', 'approved', 'rejected', 'not_submitted'] }
                    },
                    {
                        in: 'query',
                        name: 'search',
                        schema: { type: 'string' },
                        description: 'Case-insensitive search by organization name.'
                    }
                ],
                responses: {
                    200: {
                        description: 'Organizers fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                organizers: {
                                                    type: 'array',
                                                    items: { $ref: '#/components/schemas/OrganizerProfile' }
                                                },
                                                pagination: {
                                                    type: 'object',
                                                    properties: {
                                                        total: { type: 'integer', example: 42 },
                                                        page: { type: 'integer', example: 1 },
                                                        limit: { type: 'integer', example: 10 },
                                                        totalPages: { type: 'integer', example: 5 }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/manager/organizers/{id}': {
            get: {
                tags: ['Manager Dashboard'],
                summary: 'Get organizer detail for manager review',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Organizer detail fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                organizer: { $ref: '#/components/schemas/OrganizerProfile' },
                                                eventCount: { type: 'integer', example: 12 }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Organizer not found.' }
                }
            }
        },
        '/manager/organizers/{id}/approve': {
            put: {
                tags: ['Manager Dashboard'],
                summary: 'Approve organizer verification request',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Organizer approved.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Organizer approved and notified via email.' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                organizer: { $ref: '#/components/schemas/OrganizerProfile' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: 'Invalid state transition.' },
                    404: { description: 'Organizer not found.' }
                }
            }
        },
        '/manager/organizers/{id}/reject': {
            put: {
                tags: ['Manager Dashboard'],
                summary: 'Reject organizer verification request',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    required: false,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    reason: { type: 'string', example: 'Document unreadable' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Organizer rejected.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Organizer rejected and notified via email.' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                organizer: { $ref: '#/components/schemas/OrganizerProfile' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: 'Invalid state transition.' },
                    404: { description: 'Organizer not found.' }
                }
            }
        },
        '/manager/chart/verification-stats': {
            get: {
                tags: ['Manager Dashboard'],
                summary: 'Get manager verification statistics chart data',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'Verification stats fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    _id: {
                                                        type: 'object',
                                                        properties: {
                                                            month: { type: 'integer', example: 3 },
                                                            year: { type: 'integer', example: 2026 },
                                                            status: { type: 'string', example: 'approved' }
                                                        }
                                                    },
                                                    count: { type: 'integer', example: 5 }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/admin/dashboard': {
            get: {
                tags: ['Admin Dashboard'],
                summary: 'Get admin dashboard overview',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'Admin dashboard fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Admin dashboard data retrieved successfully' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                statistics: {
                                                    type: 'object',
                                                    properties: {
                                                        userCount: { type: 'integer', example: 1250 },
                                                        eventCount: { type: 'integer', example: 94 },
                                                        organizerCount: { type: 'integer', example: 42 },
                                                        verifiedOrganizerCount: { type: 'integer', example: 35 },
                                                        adminCount: { type: 'integer', example: 2 },
                                                        totalRevenue: { type: 'number', example: 125430.50 }
                                                    }
                                                },
                                                recentEvents: {
                                                    type: 'array',
                                                    items: { $ref: '#/components/schemas/EventListItem' },
                                                    maxItems: 5
                                                },
                                                recentRegistrations: {
                                                    type: 'array',
                                                    items: { type: 'object' }
                                                },
                                                admin: {
                                                    type: 'object',
                                                    properties: {
                                                        _id: { type: 'string' },
                                                        user: { type: 'object' },
                                                        createdAt: { type: 'string', format: 'date-time' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Unauthorized.' }
                }
            }
        },
        '/admin/users': {
            get: {
                tags: ['Admin Dashboard'],
                summary: 'Get all users (admin)',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'Users fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/UserProfile' }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ['Admin Dashboard'],
                summary: 'Create user (admin)',
                security: [{ sessionCookie: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'passwordHash'],
                                properties: {
                                    name: { type: 'string', example: 'New User' },
                                    email: { type: 'string', format: 'email', example: 'newuser@example.com' },
                                    passwordHash: {
                                        type: 'string',
                                        example: '$2b$10$S2n8qDk9Nwz4gQ0t5v8r6eF3QjP3YlT5lW6jAqHqz4n0lC7g1f9i2',
                                        description: 'Controller currently expects hashed password in `passwordHash`.'
                                    },
                                    phone: { type: 'string', nullable: true, example: '+91-9876543210' },
                                    role: { type: 'string', enum: ['user', 'organizer', 'manager', 'admin'], default: 'user' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'User created.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string', example: 'User created successfully' },
                                        user: { $ref: '#/components/schemas/UserProfile' }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: 'Invalid payload.' }
                }
            }
        },
        '/admin/users/revenue': {
            get: {
                tags: ['Admin Dashboard'],
                summary: 'Get users revenue data',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'User revenues fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            _id: { type: 'string', description: 'User id' },
                                            totalRevenue: { type: 'number', example: 1240.50 }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/admin/users/{id}': {
            put: {
                tags: ['Admin Dashboard'],
                summary: 'Update user (admin)',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', example: 'Updated Name' },
                                    email: { type: 'string', format: 'email', example: 'updated@example.com' },
                                    phone: { type: 'string', nullable: true, example: '+91-9876543210' },
                                    role: { type: 'string', enum: ['user', 'organizer', 'manager', 'admin'] }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'User updated.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string', example: 'User updated successfully' },
                                        user: { $ref: '#/components/schemas/UserProfile' }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'User not found.' }
                }
            },
            delete: {
                tags: ['Admin Dashboard'],
                summary: 'Delete user (admin)',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'User deleted.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string', example: 'User deleted successfully' }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'User not found.' }
                }
            }
        },
        '/admin/users/{id}/details': {
            get: {
                tags: ['Admin Dashboard'],
                summary: 'Get user detail with profile and stats (admin)',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'User details fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                user: { $ref: '#/components/schemas/UserProfile' },
                                                events: { type: 'array', items: { type: 'object' } },
                                                totalRevenue: { type: 'number', example: 1240.50 }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'User not found.' }
                }
            }
        },
        '/admin/events': {
            get: {
                tags: ['Admin Dashboard'],
                summary: 'Get all events (admin moderation list)',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'Events fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/EventDetail' }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/admin/events/{eventId}/attendees': {
            get: {
                tags: ['Admin Dashboard'],
                summary: 'Get attendees for specific event (admin)',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'eventId',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Attendees fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                event: { type: 'object' },
                                                attendees: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        properties: {
                                                            odUserId: { type: 'string' },
                                                            name: { type: 'string' },
                                                            email: { type: 'string', format: 'email' },
                                                            ticketCount: { type: 'integer' },
                                                            registrationDate: { type: 'string', format: 'date-time' }
                                                        }
                                                    }
                                                },
                                                totalAttendees: { type: 'integer', example: 42 },
                                                totalRegistrations: { type: 'integer', example: 57 },
                                                totalTickets: { type: 'integer', example: 57 },
                                                totalRevenue: { type: 'number', example: 2849.43 }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Event not found.' }
                }
            }
        },
        '/admin/organizers': {
            get: {
                tags: ['Admin Dashboard'],
                summary: 'Get all organizers (admin)',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'Organizers fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/OrganizerProfile' }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/admin/organizers/revenue': {
            get: {
                tags: ['Admin Dashboard'],
                summary: 'Get organizers revenue data (admin)',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'Organizer revenues fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            _id: { type: 'string', description: 'Organizer id' },
                                            organizationName: { type: 'string', example: 'TED Organizers' },
                                            totalRevenue: { type: 'number', example: 15234.50 }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/admin/organizers/{id}': {
            get: {
                tags: ['Admin Dashboard'],
                summary: 'Get organizer basic detail by id (admin)',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Organizer fetched.',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/OrganizerProfile' }
                            }
                        }
                    },
                    404: { description: 'Organizer not found.' }
                }
            }
        },
        '/admin/organizers/{id}/details': {
            get: {
                tags: ['Admin Dashboard'],
                summary: 'Get organizer full detail (admin)',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Organizer details fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                organizer: { $ref: '#/components/schemas/OrganizerProfile' },
                                                events: { type: 'array', items: { type: 'object' } },
                                                totalRevenue: { type: 'number', example: 15234.50 }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Organizer not found.' }
                }
            }
        },
        '/admin/organizers/{id}/verify': {
            put: {
                tags: ['Admin Dashboard'],
                summary: 'Verify organizer (admin)',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Organizer verified.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string', example: 'Organizer verified successfully' },
                                        organizer: { $ref: '#/components/schemas/OrganizerProfile' }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Organizer not found.' }
                }
            }
        },
        '/admin/organizers/{id}/reject': {
            put: {
                tags: ['Admin Dashboard'],
                summary: 'Reject organizer (admin)',
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Organizer rejected.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string', example: 'Organizer rejected' },
                                        organizer: { $ref: '#/components/schemas/OrganizerProfile' }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Organizer not found.' }
                }
            }
        },
        '/admin/chart/monthly-events': {
            get: {
                tags: ['Admin Dashboard'],
                summary: 'Get monthly event stats (admin chart)',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'Monthly event stats fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            month: { type: 'string', example: 'Mar' },
                                            year: { type: 'integer', example: 2026 },
                                            count: { type: 'integer', example: 12 }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/admin/chart/event-categories': {
            get: {
                tags: ['Admin Dashboard'],
                summary: 'Get event category distribution (admin chart)',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'Event category stats fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            category: { type: 'string', example: 'TEDx' },
                                            count: { type: 'integer', example: 12 }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/admin/chart/revenue-analysis': {
            get: {
                tags: ['Admin Dashboard'],
                summary: 'Get revenue analysis chart data (admin)',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'Revenue analysis fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            month: { type: 'string', example: 'Mar' },
                                            year: { type: 'integer', example: 2026 },
                                            revenue: { type: 'number', example: 12543.05 }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/admin/chart/organizer-verification': {
            get: {
                tags: ['Admin Dashboard'],
                summary: 'Get organizer verification stats (admin chart)',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'Organizer verification stats fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'Verified' },
                                            count: { type: 'integer', example: 35 }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/admin/revenue': {
            get: {
                tags: ['Admin Dashboard'],
                summary: 'Get platform commission revenue (admin)',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: {
                        description: 'Commission revenue fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        totalAdminCommission: { type: 'number', example: 6271.53 },
                                        netAdminCommission: { type: 'number', example: 6150.12 },
                                        refundedCommission: { type: 'number', example: 121.41 }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/': {
            get: {
                tags: ['System'],
                summary: 'Get API root metadata',
                responses: {
                    200: {
                        description: 'API metadata fetched.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Event Management API' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                version: { type: 'string', example: '1.0.0' },
                                                description: { type: 'string', example: 'Backend API for Event Management System' },
                                                endpoints: {
                                                    type: 'object',
                                                    properties: {
                                                        events: { type: 'string', example: '/events' },
                                                        auth: { type: 'string', example: '/login, /sign-up, /logout' },
                                                        user: { type: 'string', example: '/user/dashboard' },
                                                        organizer: { type: 'string', example: '/organizer/dashboard' },
                                                        admin: { type: 'string', example: '/admin/dashboard' },
                                                        payments: { type: 'string', example: '/payments' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api-docs.json': {
            get: {
                tags: ['System'],
                summary: 'Get OpenAPI document JSON',
                responses: {
                    200: {
                        description: 'OpenAPI JSON returned.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    description: 'OpenAPI 3.0 specification document'
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api-docs': {
            get: {
                tags: ['System'],
                summary: 'Open Swagger UI page',
                responses: {
                    200: {
                        description: 'Swagger UI HTML page is served.'
                    }
                }
            }
        },
        '/contact': {
            get: {
                tags: ['Contact Us'],
                summary: 'Get static contact information',
                description: 'Returns contact metadata that can be used by Contact Us UI.',
                responses: {
                    200: {
                        description: 'Contact information returned.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                contactInfo: {
                                                    type: 'object',
                                                    properties: {
                                                        email: { type: 'string', example: 'contact@eventmanagement.com' },
                                                        phone: { type: 'string', example: '+1-234-567-8900' },
                                                        address: { type: 'string', example: '123 Event Street, City, Country' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/contact': {
            post: {
                tags: ['Contact Us'],
                summary: 'Submit contact form',
                description:
                    'Accepts contact form payload from frontend Contact Us page and attempts to notify support email (simulated when email config is absent).',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'subject', 'message'],
                                properties: {
                                    name: { type: 'string', minLength: 2, maxLength: 100, example: 'Riya Verma' },
                                    email: { type: 'string', format: 'email', example: 'riya@example.com' },
                                    subject: { type: 'string', minLength: 3, maxLength: 150, example: 'Question about event refunds' },
                                    message: {
                                        type: 'string',
                                        minLength: 10,
                                        maxLength: 3000,
                                        example: 'I wanted to understand refund eligibility if I cancel two days before the event.'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Contact message accepted.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: {
                                            type: 'string',
                                            example: 'Your message has been received. Our team will contact you shortly.'
                                        },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                submittedAt: { type: 'string', format: 'date-time' },
                                                ticketId: { type: 'string', example: 'CT-1711801000000-ABCD12' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Invalid payload.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: false },
                                        message: {
                                            type: 'string',
                                            example: 'name, email, subject and message are required'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    500: {
                        description: 'Unexpected server error.',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorEnvelope' }
                            }
                        }
                    }
                }
            }
        }
    }
};

export default swaggerDocument;
