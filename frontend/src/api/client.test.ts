import { describe, it, expect, vi } from 'vitest';
import {axiosInstance, decodeJwt, setBearerToken} from './client';
import axios from 'axios';

// Mock localStorage methods for testing without affecting the real browser environment
Object.defineProperty(global, 'localStorage', {
    value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
    },
});

// Tests for axiosInstance and related utility functions
describe('Axios Client (Real Axios)', () => {

    // Verify axios instance default settings, including base URL and headers
    it('should have the correct default configuration', () => {
        expect(axiosInstance.defaults.baseURL).toBe(import.meta.env.VITE_API_URL || '');
        expect(axiosInstance.defaults.headers['Content-Type']).toBe('application/json');
        expect(axiosInstance.defaults.headers['Access-Control-Allow-Origin']).toBe('*');
    });

    // Test axios GET request using a public mock API to validate response handling
    it('should make a successful GET request to a mock server', async () => {
        // Mock server response using an actual endpoint (like jsonplaceholder.typicode.com or a local mock server)
        const mockBaseURL = 'https://jsonplaceholder.typicode.com';
        const testAxiosInstance = axios.create({ baseURL: mockBaseURL });

        const response = await testAxiosInstance.get('/todos/1');
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('id', 1);
    });

    // Verify JWT decoding function correctly extracts payload from a valid token
    it('should decode a valid JWT', () => {
        // A valid JWT with a simple payload
        const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywicm9sZSI6ImFkbWluIn0.sK2He6p2U24QmNCTMB1ekJgMBV6fmbvlHjsXJbn0yW4';
        const expectedPayload = { userId: 123, role: 'admin' };

        const result = decodeJwt(validToken);
        expect(result).toEqual(expectedPayload);
    });

    // Ensure decodeJwt() gracefully handles invalid tokens and logs an error
    it('should return null and log an error for an invalid JWT', () => {
        const invalidToken = 'invalid.token';
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = decodeJwt(invalidToken);
        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to decode JWT:', expect.any(Error));

        consoleErrorSpy.mockRestore();
    });

    // Ensure decodeJwt() returns null for empty input and logs an appropriate error
    it('should return null and log an error for an empty string', () => {
        const emptyToken = '';
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = decodeJwt(emptyToken);
        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to decode JWT:', expect.any(Error));

        consoleErrorSpy.mockRestore();
    });

    // Validate decodeJwt() safely handles null input without breaking
    it('should return null if token is null', () => {
        const result = decodeJwt(null as unknown as string);
        expect(result).toBeNull();
    });

    // Test that setBearerToken() correctly updates axios Authorization header
    it('should set the Authorization header when a valid token is provided', () => {
        const token = 'mockAccessToken';

        setBearerToken(token);

        // Check that the Authorization header is set correctly
        expect(axiosInstance.defaults.headers.common.Authorization).toBe(`Bearer ${token}`);
    });

    // Ensure setBearerToken() removes Authorization header when given an empty token
    it('should remove the Authorization header when an empty token is provided', () => {
        // First set a token to ensure the header exists
        axiosInstance.defaults.headers.common.Authorization = 'Bearer existingToken';

        // Call the function with an empty token
        setBearerToken('');

        // Check that the Authorization header has been removed
        expect(axiosInstance.defaults.headers.common.Authorization).toBeUndefined();
    });
});
