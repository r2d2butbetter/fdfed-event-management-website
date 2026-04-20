import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '../Home';
import { MemoryRouter } from 'react-router-dom';

// We mock the fetch API explicitly
global.fetch = vi.fn();

describe('Home Page Event Rendering', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = () => {
    return render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
  };

  it('renders correctly and shows events after fetching', async () => {
    // Mock the backend JSON response intelligently based on URL
    global.fetch.mockImplementation(async (url) => {
      if (url.includes('/events')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: {
              selling: {
                events: [
                  {
                    _id: 'event-1',
                    title: 'Summer Music Festival',
                    category: 'Concerts',
                    description: 'A great music festival',
                    startDateTime: '2026-07-20T18:00:00Z',
                    venue: 'City Park',
                    ticketPrice: 99.99
                  }
                ],
                pagination: { totalPages: 1 }
              },
              upcoming: {
                events: [
                  {
                    _id: 'event-2',
                    title: 'Tech Conference 2026',
                    category: 'Exhibitions',
                    description: 'Learn the latest tech',
                    startDateTime: '2027-01-10T09:00:00Z',
                    venue: 'Convention Center',
                    ticketPrice: 200
                  }
                ],
                pagination: { totalPages: 1 }
              }
            }
          })
        };
      }
      
      // Default /stats fallback for HeroSection
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: { totalEvents: 100, activeUsers: 50, totalOrganizers: 20 }
        })
      };
    });

    setup();

    // The component initially renders the title 
    expect(screen.getByText('Discover Events')).toBeInTheDocument();

    // Wait for the mock events to render
    await waitFor(() => {
      // Selling Now rendering test
      expect(screen.getByText('Summer Music Festival')).toBeInTheDocument();
      expect(screen.getByText('City Park')).toBeInTheDocument();
      expect(screen.getByText('₹99.99')).toBeInTheDocument();

      // Coming Soon rendering test
      expect(screen.getByText('Tech Conference 2026')).toBeInTheDocument();
      expect(screen.getByText('Convention Center')).toBeInTheDocument();
      expect(screen.getByText('₹200')).toBeInTheDocument();
    });
  });

  it('shows error state if API fails', async () => {
    global.fetch.mockImplementation(async (url) => {
      if (url.includes('/events')) {
        return { ok: false };
      }
      return {
        ok: true,
        json: async () => ({ success: true, data: {} })
      };
    });

    setup();

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch events')).toBeInTheDocument();
    });
  });
});
