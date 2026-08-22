import { beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/contact/contact-form";

// Mock the data layer so the form is tested in isolation - no store/network.
const { sendTrigger } = vi.hoisted(() => ({ sendTrigger: vi.fn() }));

vi.mock("@/redux/contact/contact-api", () => ({
  useSendContactMessageMutation: () => [sendTrigger, { isLoading: false }],
}));

beforeEach(() => {
  sendTrigger.mockReset();
  sendTrigger.mockReturnValue({ unwrap: () => Promise.resolve({ message: "ok" }) });
});

describe("ContactForm", () => {
  it("shows per-field validation errors when submitted empty", async () => {
    render(<ContactForm />);
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    // Every empty required field surfaces its own inline error.
    expect(await screen.findAllByText(/Please add your name/i)).toHaveLength(3);
    // The label element also contains the inline error, so match loosely.
    expect(screen.getByLabelText(/Your name/)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(sendTrigger).not.toHaveBeenCalled();
  });

  it("shows the sent confirmation after a valid submit", async () => {
    render(<ContactForm />);
    await userEvent.type(screen.getByLabelText("Your name"), "Kofi Owusu");
    await userEvent.type(screen.getByLabelText("Phone or email"), "024 555 1234");
    await userEvent.type(screen.getByLabelText("Message"), "I'd like a birthday cake for 20.");
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByText("Message sent")).toBeInTheDocument();
    expect(screen.getByText(/Thank you, Kofi/)).toBeInTheDocument();
    expect(sendTrigger).toHaveBeenCalledTimes(1);
  });
});
