/**
 * Test Suite: Auth Service (in-memory session store)
 * Tests the setUser/getUser session management functions.
 */
import { describe, it, expect } from 'vitest';
import { setUser, getUser } from '../services/auth.js';

describe('Auth Service — Session Store', () => {
  it('should store and retrieve a user by session ID', () => {
    const mockUser = { _id: '123', name: 'Test User', email: 'test@example.com' };
    setUser('session-1', mockUser);
    expect(getUser('session-1')).toEqual(mockUser);
  });

  it('should return undefined for an unknown session ID', () => {
    expect(getUser('non-existent-id')).toBeUndefined();
  });

  it('should delete a user when setUser is called with null', () => {
    const mockUser = { _id: '456', name: 'Delete Me' };
    setUser('session-2', mockUser);
    expect(getUser('session-2')).toEqual(mockUser);

    // Delete
    setUser('session-2', null);
    expect(getUser('session-2')).toBeUndefined();
  });

  it('should overwrite an existing session with a new user', () => {
    const user1 = { _id: '1', name: 'User 1' };
    const user2 = { _id: '2', name: 'User 2' };

    setUser('session-3', user1);
    expect(getUser('session-3')).toEqual(user1);

    setUser('session-3', user2);
    expect(getUser('session-3')).toEqual(user2);
  });
});
