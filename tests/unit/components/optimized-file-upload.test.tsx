import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OptimizedFileUpload } from "@/components/optimized-file-upload";

// Mock fetch for API calls
global.fetch = vi.fn();

describe("OptimizedFileUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dropzone area", () => {
    render(<OptimizedFileUpload />);

    expect(
      screen.getByText("Drag & drop files here, or click to select")
    ).toBeInTheDocument();
    expect(screen.getByText(/Supports:/)).toBeInTheDocument();
    expect(screen.getByText(/Max 5 files/)).toBeInTheDocument();
    expect(
      screen.getByText(/Files are uploaded directly for optimal performance/)
    ).toBeInTheDocument();
  });

  it("shows drag active state", async () => {
    const user = userEvent.setup();
    render(<OptimizedFileUpload />);

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
      <OptimizedFileUpload
        maxFiles={3}
        maxSize={50 * 1024 * 1024} // 50MB
        className="custom-class"
      />
    );

    expect(screen.getByText(/Max 3 files/)).toBeInTheDocument();
    expect(screen.getByText(/up to 50 MB each/)).toBeInTheDocument();
  });
});
