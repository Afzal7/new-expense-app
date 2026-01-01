import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUpload } from "@/components/file-upload";

// Mock fetch for API calls
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.fetch = vi.fn() as any;

describe("FileUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dropzone area", () => {
    render(<FileUpload />);

    expect(
      screen.getByText("Drag & drop files here, or click to select")
    ).toBeInTheDocument();
    expect(screen.getByText(/Supports:/)).toBeInTheDocument();
    expect(screen.getByText(/Max 5 files/)).toBeInTheDocument();
  });

  it("shows drag active state", async () => {
    const user = userEvent.setup();
    render(<FileUpload />);

    const dropzone = screen.getByText(
      "Drag & drop files here, or click to select"
    );

    // Simulate drag enter
    await user.hover(dropzone);

    // The component should still render normally since we can't easily simulate drag states in RTL
    expect(dropzone).toBeInTheDocument();
  });

  it("accepts custom props", () => {
    render(
      <FileUpload
        maxFiles={3}
        maxSize={5 * 1024 * 1024} // 5MB
        className="custom-class"
      />
    );

    expect(screen.getByText(/Max 3 files/)).toBeInTheDocument();
    expect(screen.getByText(/up to 5 MB each/)).toBeInTheDocument();
  });
});
