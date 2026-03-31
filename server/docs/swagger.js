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
        '/payments/process-payment': {
            post: {
                tags: ['Payment Pages'],
                summary: 'Process payment and create registrations',
                description:
                    'Validates capacity, creates payment record, creates one registration per ticket, and returns transaction details plus updated availability.',
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
                    200: {
                        description: 'Payment processed successfully.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        ticketsLeft: { type: 'integer', example: 39 },
                                        paymentId: { type: 'string', example: '67fa7d4b73ad15ec184eb71a' },
                                        transactionId: { type: 'string', example: 'TXN-1764851214358-ab12cd34e' },
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
                    400: {
                        description: 'Validation failure (invalid event/tickets or insufficient capacity).',
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
                    200: { description: 'User profile fetched.' },
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
                    200: { description: 'User events fetched.' },
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
                    200: { description: 'Event saved.' },
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
                    200: { description: 'Saved status fetched.' },
                    400: { description: 'eventId is required.' },
                    401: { description: 'User not authenticated.' }
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
                    200: { description: 'Event detail fetched with related events.' },
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
                    200: { description: 'Event deleted.' },
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
                                required: ['name', 'email', 'password'],
                                properties: {
                                    name: { type: 'string', example: 'Aarav Sharma' },
                                    email: { type: 'string', format: 'email', example: 'aarav@example.com' },
                                    password: { type: 'string', example: 'StrongPass@123' },
                                    phone: { type: 'string', example: '+91-9876543210' }
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
                    200: { description: 'Login success and session created.' },
                    401: { description: 'Invalid credentials.' }
                }
            }
        },
        '/check-session': {
            get: {
                tags: ['Authentication'],
                summary: 'Check active session and role info',
                responses: {
                    200: { description: 'Session status returned.' }
                }
            }
        },
        '/organizer-login': {
            get: {
                tags: ['Authentication'],
                summary: 'Get organizer login status/entry endpoint',
                responses: {
                    200: { description: 'Organizer login endpoint response.' }
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
                                    organizationName: { type: 'string' },
                                    contactNo: { type: 'string' },
                                    description: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Organizer registration submitted.' },
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
                    200: { description: 'Logged out.' }
                }
            }
        },
        '/organizer/dashboard': {
            get: {
                tags: ['Organizer Dashboard'],
                summary: 'Get organizer dashboard overview',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: { description: 'Organizer dashboard fetched.' },
                    401: { description: 'Unauthorized.' }
                }
            }
        },
        '/organizer/events': {
            get: {
                tags: ['Organizer Dashboard'],
                summary: 'Get organizer events listing payload',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: { description: 'Organizer events fetched.' }
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
                                required: ['title', 'category', 'startDateTime', 'endDateTime', 'venue', 'capacity', 'ticketPrice'],
                                properties: {
                                    title: { type: 'string' },
                                    category: { type: 'string' },
                                    description: { type: 'string' },
                                    startDateTime: { type: 'string', format: 'date-time' },
                                    endDateTime: { type: 'string', format: 'date-time' },
                                    venue: { type: 'string' },
                                    capacity: { type: 'integer' },
                                    ticketPrice: { type: 'number' },
                                    image: { type: 'string', format: 'binary' }
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
                                    title: { type: 'string' },
                                    category: { type: 'string' },
                                    description: { type: 'string' },
                                    startDateTime: { type: 'string', format: 'date-time' },
                                    endDateTime: { type: 'string', format: 'date-time' },
                                    venue: { type: 'string' },
                                    capacity: { type: 'integer' },
                                    ticketPrice: { type: 'number' },
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
                responses: {
                    200: { description: 'Organizer profile updated.' },
                    401: { description: 'Unauthorized.' }
                }
            }
        },
        '/organizer/change-password': {
            put: {
                tags: ['Organizer Dashboard'],
                summary: 'Change organizer account password',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: { description: 'Password updated.' },
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
                    200: { description: 'Attendees fetched.' },
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
                    }
                ],
                responses: {
                    200: { description: 'Export file generated.' }
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
                responses: {
                    200: { description: 'Bulk email sent.' },
                    400: { description: 'Invalid payload.' }
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
                    200: { description: 'Verification status fetched.' },
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
                    200: { description: 'Manager dashboard fetched.' },
                    401: { description: 'Unauthorized.' }
                }
            }
        },
        '/manager/organizers': {
            get: {
                tags: ['Manager Dashboard'],
                summary: 'Get organizer list for manager',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: { description: 'Organizers fetched.' }
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
                    200: { description: 'Organizer detail fetched.' },
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
                    200: { description: 'Organizer approved.' },
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
                    200: { description: 'Organizer rejected.' },
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
                    200: { description: 'Verification stats fetched.' }
                }
            }
        },
        '/admin/dashboard': {
            get: {
                tags: ['Admin Dashboard'],
                summary: 'Get admin dashboard overview',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: { description: 'Admin dashboard fetched.' },
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
                    200: { description: 'Users fetched.' }
                }
            },
            post: {
                tags: ['Admin Dashboard'],
                summary: 'Create user (admin)',
                security: [{ sessionCookie: [] }],
                responses: {
                    201: { description: 'User created.' },
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
                    200: { description: 'User revenues fetched.' }
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
                responses: {
                    200: { description: 'User updated.' },
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
                    200: { description: 'User deleted.' },
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
                    200: { description: 'User details fetched.' },
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
                    200: { description: 'Events fetched.' }
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
                    200: { description: 'Attendees fetched.' },
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
                    200: { description: 'Organizers fetched.' }
                }
            }
        },
        '/admin/organizers/revenue': {
            get: {
                tags: ['Admin Dashboard'],
                summary: 'Get organizers revenue data (admin)',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: { description: 'Organizer revenues fetched.' }
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
                    200: { description: 'Organizer fetched.' },
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
                    200: { description: 'Organizer details fetched.' },
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
                    200: { description: 'Organizer verified.' },
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
                    200: { description: 'Organizer rejected.' },
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
                    200: { description: 'Monthly event stats fetched.' }
                }
            }
        },
        '/admin/chart/event-categories': {
            get: {
                tags: ['Admin Dashboard'],
                summary: 'Get event category distribution (admin chart)',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: { description: 'Event category stats fetched.' }
                }
            }
        },
        '/admin/chart/revenue-analysis': {
            get: {
                tags: ['Admin Dashboard'],
                summary: 'Get revenue analysis chart data (admin)',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: { description: 'Revenue analysis fetched.' }
                }
            }
        },
        '/admin/chart/organizer-verification': {
            get: {
                tags: ['Admin Dashboard'],
                summary: 'Get organizer verification stats (admin chart)',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: { description: 'Organizer verification stats fetched.' }
                }
            }
        },
        '/admin/revenue': {
            get: {
                tags: ['Admin Dashboard'],
                summary: 'Get platform commission revenue (admin)',
                security: [{ sessionCookie: [] }],
                responses: {
                    200: { description: 'Commission revenue fetched.' }
                }
            }
        },
        '/': {
            get: {
                tags: ['System'],
                summary: 'Get API root metadata',
                responses: {
                    200: { description: 'API metadata fetched.' }
                }
            }
        },
        '/api-docs.json': {
            get: {
                tags: ['System'],
                summary: 'Get OpenAPI document JSON',
                responses: {
                    200: { description: 'OpenAPI JSON returned.' }
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
