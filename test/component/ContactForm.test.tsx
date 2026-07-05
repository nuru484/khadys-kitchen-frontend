import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/contact/contact-form";

describe("ContactForm", () => {
  it("shows a validation error when submitted empty", async () => {
    render(<ContactForm />);
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByText(/Please add your name/i)).toBeInTheDocument();
  });

  it("shows the sent confirmation after a valid submit", async () => {
    render(<ContactForm />);
    await userEvent.type(screen.getByLabelText("Your name"), "Kofi Owusu");
    await userEvent.type(screen.getByLabelText("Phone or email"), "024 555 1234");
    await userEvent.type(screen.getByLabelText("Message"), "I'd like a birthday cake for 20.");
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByText("Message sent")).toBeInTheDocument();
    expect(screen.getByText(/Thank you, Kofi/)).toBeInTheDocument();
  });
});
