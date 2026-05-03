import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import CreateDatabaseForm, { CreateDatabaseFormProps } from "./CreateDatabaseForm";
import {AxiosResponse, InternalAxiosRequestConfig} from "axios";
import { DatabaseClient, DatabaseValidation } from "../../api/databaseClient";
import { EngineType } from "../../types/engine";

// Mock DatabaseClient and DatabaseValidation to prevent actual API calls
vi.mock("../../api/databaseClient", () => ({
    DatabaseClient: {
        availabilityDatabase: vi.fn(() => Promise.resolve({ data: { availability: true } })),
    },
    DatabaseValidation: {
        availabilityDatabaseSchema: {
            validateSync: vi.fn(() => ({ availability: true })),
        },
    },
}));
// Tests for CreateDatabaseForm component, ensuring proper validation, UI behavior, and API interactions
describe("CreateDatabaseForm", () => {
    // Mock function for handling form submission
    const onSubmitMock = vi.fn();
    // Default props for rendering the CreateDatabaseForm component in tests
    const defaultProps: CreateDatabaseFormProps = {
        processing: false,
        onSubmit: onSubmitMock,
    };
    // Clear all mock function calls after each test to ensure test isolation
    afterEach(() => {
        vi.clearAllMocks();
    });
    // Ensure the form and its fields are rendered correctly
    it("renders the form and input fields", () => {
        render(<CreateDatabaseForm {...defaultProps} />);
        // Verify that the form title is displayed
        expect(screen.getByText("Create a database", { selector: "div" })).toBeInTheDocument();
        expect(screen.getByLabelText("Database Name")).toBeInTheDocument();
        // Confirm that the submit button is rendered
        expect(screen.getByRole("button", { name: "Create a database" })).toBeInTheDocument();
    });
    // Ensure validation works for the database name field, displaying errors when necessary
    it("validates the name field and shows error messages", async () => {
        render(<CreateDatabaseForm {...defaultProps} />);

        const nameInput = screen.getByPlaceholderText("abcd_1234");
        const submitButton = screen.getByRole("button", { name: "Create a database" });

        // Verify that the submit button is initially disabled
        expect(submitButton).toBeDisabled();

        // Simulate user entering an invalid database name
        fireEvent.change(nameInput, { target: { value: "ab" } });
        fireEvent.blur(nameInput);
        await waitFor(() =>
            // Confirm that an error message is displayed for a short database name
            expect(screen.getByText("Name should be of minimum 4 characters length")).toBeInTheDocument()
        );

        // Simulate user entering a valid database name
        fireEvent.change(nameInput, { target: { value: "valid_name" } });
        fireEvent.blur(nameInput);
        await waitFor(() =>
            // Confirm that the error message disappears when the input is corrected
            expect(screen.queryByText(/Name should be of minimum 4 characters length/)).not.toBeInTheDocument()
        );
    });
    // Ensure the submit button is disabled while the form is in a processing state
    it("disables submit button when processing", () => {
        render(<CreateDatabaseForm {...defaultProps} processing={true} />);
        const submitButton = screen.getByRole("button", { name: "Create a database" });
        // Confirm that the button is disabled when processing is set to true
        expect(submitButton).toBeDisabled();
    });
    // Verify that validateDatabaseValues() interacts correctly with the API and validation schema
    it("validateDatabaseValues returns true when availability is true", async () => {
        // Mock API response indicating database availability
        const mockResponse: AxiosResponse = {
            data: { availability: false },
            status: 200,
            statusText: "OK",
            headers: {},
            config: {
                headers: {}, // Add this line to satisfy TypeScript's requirement
            } as InternalAxiosRequestConfig, // Ensure it matches the expected type
        };
        // Spy on DatabaseClient.availabilityDatabase to ensure it's called correctly
        const spyApi = vi.spyOn(DatabaseClient, "availabilityDatabase").mockResolvedValue(mockResponse);
        // Spy on DatabaseValidation schema validation to confirm it processes data correctly
        const spyValidation = vi.spyOn(DatabaseValidation.availabilityDatabaseSchema, "validateSync").mockImplementation(
            (data) => {
                return { availability: true } as any;
            }
        );

        render(<CreateDatabaseForm {...defaultProps} />);

        const nameInput = screen.getByPlaceholderText("abcd_1234");
        // Simulate entering a valid database name to trigger validation
        fireEvent.change(nameInput, { target: { value: "valid_name" } });
        fireEvent.blur(nameInput);

        await waitFor(() => {
            // Verify that the API was called with the correct database details
            expect(spyApi).toHaveBeenCalledWith({
                name: "valid_name",
                engine: EngineType.PostgreSQL,
            });

            expect(spyValidation).toHaveBeenCalledWith(mockResponse.data);
        });
        // Restore the original API function after spying to avoid affecting other tests
        spyApi.mockRestore();
        spyValidation.mockRestore();
    });
});
