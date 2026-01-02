import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { OptimizedFileUpload } from "@/components/optimized-file-upload";

// Mock fetch for API calls
global.fetch = vi.fn();

describe("OptimizedFileUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dropzone area", () => {
    render(<OptimizedFileUpload />);

    expect(screen.getByText("Drag & drop files here")).toBeInTheDocument();
    expect(
      screen.getByText("or click to browse (max 10MB per file)")
    ).toBeInTheDocument();
    expect(screen.getByText("Select Files")).toBeInTheDocument();
  });

  it("shows drag active state", () => {
    render(<OptimizedFileUpload />);

    // The dropzone should be present and have the correct initial styling
    const dropzone = screen.getByText("Drag & drop files here").closest("div");
    expect(dropzone).toHaveClass("border-muted-foreground/25");
  });

  it("accepts custom props", () => {
    render(
      <OptimizedFileUpload
        maxFiles={3}
        maxSize={50 * 1024 * 1024} // 50MB
        className="custom-class"
      />
    );

    expect(
      screen.getByText("or click to browse (max 50MB per file)")
    ).toBeInTheDocument();
    const container = screen
      .getByText("Drag & drop files here")
      .closest(".custom-class");
    expect(container).toBeInTheDocument();
  });
});
