import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import CreateDatabaseForm, { CreateDatabaseFormProps } from "./CreateDatabaseForm";
import { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { DatabaseClient, DatabaseValidation } from "../../api/databaseClient";
import { EngineType } from "../../types/engine";

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

describe("CreateDatabaseForm", () => {
  const onSubmitMock = vi.fn();

  const defaultProps: CreateDatabaseFormProps = {
    processing: false,
    onSubmit: onSubmitMock,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form and input fields", () => {
    render(<CreateDatabaseForm {...defaultProps} />);

    expect(screen.getByText("Create a database", { selector: "div" })).toBeInTheDocument();
    expect(screen.getByLabelText("Database Name")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Create a database" })).toBeInTheDocument();
  });

  it("validates the name field and shows error messages", async () => {
    render(<CreateDatabaseForm {...defaultProps} />);

    const nameInput = screen.getByPlaceholderText("abcd_1234");
    const submitButton = screen.getByRole("button", { name: "Create a database" });

    expect(submitButton).toBeDisabled();

    fireEvent.change(nameInput, { target: { value: "ab" } });
    fireEvent.blur(nameInput);
    await waitFor(() =>
      expect(screen.getByText("Name should be of minimum 4 characters length")).toBeInTheDocument(),
    );

    fireEvent.change(nameInput, { target: { value: "valid_name" } });
    fireEvent.blur(nameInput);
    await waitFor(() =>
      expect(
        screen.queryByText(/Name should be of minimum 4 characters length/),
      ).not.toBeInTheDocument(),
    );
  });

  it("disables submit button when processing", () => {
    render(<CreateDatabaseForm {...defaultProps} processing={true} />);
    const submitButton = screen.getByRole("button", { name: "Create a database" });

    expect(submitButton).toBeDisabled();
  });

  it("validateDatabaseValues returns true when availability is true", async () => {
    const mockResponse: AxiosResponse = {
      data: { availability: false },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {
        headers: {},
      } as InternalAxiosRequestConfig,
    };

    const spyApi = vi.spyOn(DatabaseClient, "availabilityDatabase").mockResolvedValue(mockResponse);

    const spyValidation = vi
      .spyOn(DatabaseValidation.availabilityDatabaseSchema, "validateSync")
      .mockImplementation(() => ({ availability: true }));

    render(<CreateDatabaseForm {...defaultProps} />);

    const nameInput = screen.getByPlaceholderText("abcd_1234");

    fireEvent.change(nameInput, { target: { value: "valid_name" } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(spyApi).toHaveBeenCalledWith({
        name: "valid_name",
        engine: EngineType.PostgreSQL,
      });

      expect(spyValidation).toHaveBeenCalledWith(mockResponse.data);
    });

    spyApi.mockRestore();
    spyValidation.mockRestore();
  });
});
