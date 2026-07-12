import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";
import { toast } from "sonner";
import CreateDatabaseForm, { CreateDatabaseFormProps } from "./CreateDatabaseForm";
import { DatabaseClient } from "@/features/databases/api/databaseClient";
import { EngineType } from "@/features/databases/model/engine";

vi.mock("@/features/databases/api/databaseClient", () => ({
  DatabaseClient: {
    availabilityDatabase: vi.fn(() => Promise.resolve(true)),
  },
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
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

    expect(
      screen.getByRole("heading", { name: "Create a database", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/database name/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Create a database" })).toBeInTheDocument();
  });

  it("validates the name field and shows error messages", async () => {
    render(<CreateDatabaseForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/database name/i);
    const submitButton = screen.getByRole("button", { name: "Create a database" });

    expect(submitButton).toBeDisabled();

    fireEvent.change(nameInput, { target: { value: "1invalid" } });
    await waitFor(() =>
      expect(screen.getByText(/Name must begin with a letter/)).toBeInTheDocument(),
    );
    expect(nameInput).toHaveAttribute("aria-invalid", "true");

    fireEvent.change(nameInput, { target: { value: "valid_name" } });
    await waitFor(() =>
      expect(screen.queryByText(/Name must begin with a letter/)).not.toBeInTheDocument(),
    );
    expect(nameInput).toHaveAttribute("aria-invalid", "false");
  });

  it("disables submit button when processing", () => {
    render(<CreateDatabaseForm {...defaultProps} processing={true} />);
    const submitButton = screen.getByRole("button", { name: /creating database/i });

    expect(submitButton).toBeDisabled();
    expect(screen.getByRole("status", { name: /loading/i })).toBeInTheDocument();
  });

  it("surfaces an inline message without a toast when the availability check fails", async () => {
    const spyApi = vi
      .spyOn(DatabaseClient, "availabilityDatabase")
      .mockRejectedValue(new Error("network"));

    render(<CreateDatabaseForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/database name/i);
    fireEvent.change(nameInput, { target: { value: "valid_name" } });
    fireEvent.blur(nameInput);

    await waitFor(() =>
      expect(screen.getByText("Couldn't verify availability — try again")).toBeInTheDocument(),
    );
    expect(screen.queryByText("Name is already registered")).not.toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();

    spyApi.mockRestore();
  });

  it("does not check availability or toast for a locally invalid name", async () => {
    const user = userEvent.setup();
    const spyApi = vi
      .spyOn(DatabaseClient, "availabilityDatabase")
      .mockRejectedValue(new Error("backend rejected invalid name"));

    render(<CreateDatabaseForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/database name/i);
    await user.type(nameInput, "Bad-name");

    await waitFor(() =>
      expect(screen.getByText(/Name must begin with a letter/)).toBeInTheDocument(),
    );
    expect(spyApi).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();

    spyApi.mockRestore();
  });

  it("accepts a one-character database name", async () => {
    const spyApi = vi.spyOn(DatabaseClient, "availabilityDatabase").mockResolvedValue(true);

    render(<CreateDatabaseForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/database name/i);
    fireEvent.change(nameInput, { target: { value: "a" } });

    await waitFor(() => expect(spyApi).toHaveBeenCalledWith({ name: "a", engine: "P" }));
    expect(nameInput).toHaveAttribute("aria-invalid", "false");

    spyApi.mockRestore();
  });

  it("debounces availability checks while typing", async () => {
    const user = userEvent.setup();
    const spyApi = vi.spyOn(DatabaseClient, "availabilityDatabase").mockResolvedValue(true);

    render(<CreateDatabaseForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/database name/i), "valid_name");

    await waitFor(() => expect(spyApi).toHaveBeenCalledWith({ name: "valid_name", engine: "P" }));
    expect(spyApi).toHaveBeenCalledTimes(1);

    spyApi.mockRestore();
  });

  it("marks a valid name as available", async () => {
    const spyApi = vi.spyOn(DatabaseClient, "availabilityDatabase").mockResolvedValue(true);

    render(<CreateDatabaseForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/database name/i);

    fireEvent.change(nameInput, { target: { value: "valid_name" } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(spyApi).toHaveBeenCalledWith({
        name: "valid_name",
        engine: EngineType.PostgreSQL,
      });
    });

    spyApi.mockRestore();
  });

  it("validates the name against the selected engine", async () => {
    const user = userEvent.setup();
    const spyApi = vi.spyOn(DatabaseClient, "availabilityDatabase").mockResolvedValue(true);

    render(<CreateDatabaseForm {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "MongoDB" }));
    fireEvent.change(screen.getByLabelText(/database name/i), {
      target: { value: "mongo_database" },
    });
    fireEvent.blur(screen.getByLabelText(/database name/i));

    await waitFor(() => {
      expect(spyApi).toHaveBeenCalledWith({
        name: "mongo_database",
        engine: EngineType.MongoDB,
      });
    });

    spyApi.mockRestore();
  });
});
