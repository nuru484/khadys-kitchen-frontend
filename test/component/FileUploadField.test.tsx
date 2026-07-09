// Remove must visually clear the existing asset (not fall back to showing the
// saved image) and report `cleared` so forms send an explicit null on save.
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FileUploadField } from "@/components/admin/file-upload-field";

const CURRENT_URL = "https://res.cloudinary.com/demo/image/upload/photo.png";

describe("FileUploadField", () => {
  it("shows the existing asset with Replace/Remove controls", () => {
    render(
      <FileUploadField
        label="Photo"
        currentUrl={CURRENT_URL}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("img", { name: "Photo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Replace" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
  });

  it("clicking Remove clears the preview and reports cleared", () => {
    const onChange = vi.fn();
    render(
      <FileUploadField
        label="Photo"
        currentUrl={CURRENT_URL}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));

    expect(onChange).toHaveBeenCalledWith({ cleared: true, file: null });
    // The saved image must no longer show — the pending state is "no asset".
    expect(screen.queryByRole("img", { name: "Photo" })).not.toBeInTheDocument();
    expect(screen.getByText("None yet")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Choose file" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Remove" }),
    ).not.toBeInTheDocument();
  });

  it("renders the empty state when there is no saved asset", () => {
    render(<FileUploadField label="Photo" onChange={vi.fn()} />);
    expect(screen.getByText("None yet")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Choose file" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Remove" }),
    ).not.toBeInTheDocument();
  });
});
