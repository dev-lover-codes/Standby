import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewEventPage from "@/app/events/new/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockCreateEventAction = vi.fn();
vi.mock("@/app/actions", () => ({
  createEventAction: (...args: unknown[]) => mockCreateEventAction(...args),
}));

describe("NewEventPage Slate Form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all required form controls with labels", () => {
    render(<NewEventPage />);

    expect(screen.getByLabelText(/event title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/event kind/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/event date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/estimated guests/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/target budget/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/creative brief/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /rehearse production/i })).toBeInTheDocument();
  });

  it("updates live character counter as user types into creative brief", async () => {
    const user = userEvent.setup();
    render(<NewEventPage />);

    const briefInput = screen.getByLabelText(/creative brief/i);
    expect(screen.getByText("0/1500")).toBeInTheDocument();

    await user.type(briefInput, "Autumn wedding celebration");
    expect(screen.getByText("26/1500")).toBeInTheDocument();
  });

  it("submits form and navigates to the new event rehearsal on success", async () => {
    const user = userEvent.setup();
    mockCreateEventAction.mockResolvedValueOnce({ success: true, eventId: "test-event-123" });

    render(<NewEventPage />);

    await user.type(screen.getByLabelText(/event title/i), "Annual Fall Gala");
    await user.type(screen.getByLabelText(/creative brief/i), "A gala dinner celebrating local heroes.");

    const submitBtn = screen.getByRole("button", { name: /rehearse production/i });
    await user.click(submitBtn);

    expect(mockCreateEventAction).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/events/test-event-123");
  });

  it("displays error message with aria-live when submission fails", async () => {
    const user = userEvent.setup();
    mockCreateEventAction.mockResolvedValueOnce({
      success: false,
      error: "AI quota exceeded for today.",
    });

    render(<NewEventPage />);

    await user.type(screen.getByLabelText(/event title/i), "Annual Fall Gala");
    await user.type(screen.getByLabelText(/creative brief/i), "A gala dinner celebrating local heroes.");

    const submitBtn = screen.getByRole("button", { name: /rehearse production/i });
    await user.click(submitBtn);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("AI quota exceeded for today.");
  });
});
