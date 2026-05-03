import { describe, it, expect, afterEach, vi } from 'vitest';
import { DatabaseClient } from './databaseClient';
import { axiosInstance } from './client';
import { UpstreamDatabaseProperties } from '../types/database';
import {EngineType} from "../types/engine";

// Mock axiosInstance to prevent real API calls and control responses
vi.mock('./client', () => ({
    axiosInstance: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
    },
}));

// Tests for DatabaseClient methods that interact with the API
describe('DatabaseClient', () => {
    // Mock data
    const mockDatabases = [
        { id: 1, name: 'Database 1', engine: 'P', createdAt: new Date(), userId: 100 },
        { id: 2, name: 'Database 2', engine: 'M', createdAt: new Date(), userId: 101 },
    ];

    afterEach(() => {
        vi.clearAllMocks();
    });

    // Test case 1: Fetch all databases
    it('fetches all databases', async () => {
        (axiosInstance.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockDatabases });

        const result = await DatabaseClient.getAllDatabases();

        expect(axiosInstance.get).toHaveBeenCalledWith('/databases/_all_');
        expect(result).toEqual(mockDatabases);
    });

    // Test case 2: Fetch user databases
    it('fetches user databases', async () => {
        (axiosInstance.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockDatabases });

        const result = await DatabaseClient.getUserDatabases();

        expect(axiosInstance.get).toHaveBeenCalledWith('/databases');
        expect(result).toEqual(mockDatabases);
    });

    // Test case 3: Fetch a single database by ID
    it('fetches a database by ID', async () => {
        const mockDatabase = mockDatabases[0];
        (axiosInstance.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockDatabase });

        const result = await DatabaseClient.getDatabase(1);

        expect(axiosInstance.get).toHaveBeenCalledWith('/databases/1');
        expect(result).toEqual(mockDatabase);
    });

    // Test case 4: Create a database
    it('creates a database', async () => {
        const newDatabase: UpstreamDatabaseProperties = {
            name: 'Database 3',
            engine: EngineType.PostgreSQL, // Use enum value
        };
        const createdDatabase = {
            ...newDatabase,
            id: 3,
            createdAt: new Date(),
            userId: 100,
        };

        (axiosInstance.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: createdDatabase });

        const result = await DatabaseClient.createDatabase(newDatabase);

        expect(axiosInstance.post).toHaveBeenCalledWith('/databases', newDatabase);
        expect(result).toEqual(createdDatabase);
    });

    // Test case 5: Check database availability
    it('checks database availability', async () => {
        const databaseCheck = {
            name: 'Database 3',
            engine: EngineType.PostgreSQL, // Use EngineType instead of raw string
        };

        (axiosInstance.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { available: true } });

        const result = await DatabaseClient.availabilityDatabase(databaseCheck);

        expect(axiosInstance.post).toHaveBeenCalledWith('/databases/_availability_', databaseCheck);
        expect(result).toEqual({ data: { available: true } });
    });

    // Test case 6: Delete a database
    it('deletes a database by ID', async () => {
        (axiosInstance.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { success: true } });

        const result = await DatabaseClient.deleteDatabase(1);

        expect(axiosInstance.delete).toHaveBeenCalledWith('/databases/1');
        expect(result).toEqual({ success: true });
    });

    // Test case 7: Delete a database with permission
    it('deletes a database with additional permissions', async () => {
        (axiosInstance.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { success: true } });

        const result = await DatabaseClient.deleteDatabaseWithPermission(1);

        expect(axiosInstance.delete).toHaveBeenCalledWith('/databases/1/_permission_');
        expect(result).toEqual({ success: true });
    });
});
