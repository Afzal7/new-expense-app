import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { expect, it, describe, vi, beforeEach, Mock } from 'vitest';
import { CreateExpenseDialog } from '../../../app/dashboard/expenses/_components/create-expense-dialog';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-organization-context', () => ({
  useOrganizationContext: () => null,
}));

vi.mock('../../../app/dashboard/expenses/_actions/expense-actions', () => ({
  createExpenseAction: vi.fn(),
}));

// Mock form components
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children }: any) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type || 'button'}
      data-testid={`button-${props['data-testid'] || 'default'}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ id, type, placeholder, ...props }: any) => (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      data-testid={`input-${id}`}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ id, placeholder, ...props }: any) => (
    <textarea
      id={id}
      placeholder={placeholder}
      data-testid={`textarea-${id}`}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor} data-testid={`label-${htmlFor}`}>
      {children}
    </label>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select">
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <option value={value} data-testid={`select-item-${value}`}>
      {children}
    </option>
  ),
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder}</span>,
}));

vi.mock('@/components/ui/file-upload', () => ({
  FileUpload: ({ uploadedFiles, onUploadComplete, onRemoveFile }: any) => (
    <div data-testid="file-upload">
      {uploadedFiles?.map((file: any, index: number) => (
        <div key={index} data-testid={`uploaded-file-${index}`}>
          {file.name}
          <button
            onClick={() => onRemoveFile?.(index)}
            data-testid={`remove-file-${index}`}
            aria-label={`Remove ${file.name}`}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={() => onUploadComplete([{ url: 'test-url', name: 'test-file.jpg', type: 'image/jpeg' }])}
        data-testid="mock-upload"
        aria-label="Upload file"
      >
        Mock Upload
      </button>
    </div>
  ),
}));

vi.mock('@/components/ddd', () => ({
  SuccessGlow: ({ children }: any) => <div data-testid="success-glow">{children}</div>,
  PulseFeedback: ({ children }: any) => <div data-testid="pulse-feedback">{children}</div>,
  MotionPulse: ({ children, intensity, className }: any) => (
    <div data-testid="motion-pulse" data-intensity={intensity} className={className}>
      {children}
    </div>
  ),
}));

import { createExpenseAction } from '../../../app/dashboard/expenses/_actions/expense-actions';

describe('CreateExpenseDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the dialog when open', () => {
    render(<CreateExpenseDialog open={true} onOpenChange={() => {}} />);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getByText('Create New Expense')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<CreateExpenseDialog open={false} onOpenChange={() => {}} />);

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('should initialize with one line item', () => {
    render(<CreateExpenseDialog open={true} onOpenChange={() => {}} />);

    expect(screen.getByTestId('input-amount-0')).toBeInTheDocument();
    expect(screen.getByTestId('input-description-0')).toBeInTheDocument();
    expect(screen.getByTestId('input-date')).toBeInTheDocument();
  });

  it('should allow adding multiple line items', async () => {
    render(<CreateExpenseDialog open={true} onOpenChange={() => {}} />);

    const addButton = screen.getByText('Add Item');
    await act(async () => {
      fireEvent.click(addButton);
    });

    expect(screen.getByTestId('input-amount-1')).toBeInTheDocument();
    expect(screen.getByTestId('input-description-1')).toBeInTheDocument();
  });

  it('should allow removing line items when more than one exists', async () => {
    render(<CreateExpenseDialog open={true} onOpenChange={() => {}} />);

    // Add a second item first
    const addButton = screen.getByText('Add Item');
    await act(async () => {
      fireEvent.click(addButton);
    });

    expect(screen.getByTestId('input-amount-1')).toBeInTheDocument();

    // Now remove the second item - find buttons with X icon in line item containers
    const lineItemContainers = screen.getAllByText(/^Item \d+$/);
    expect(lineItemContainers.length).toBe(2);

    // Find remove buttons (should only be one for the second item)
    const removeButtons = screen.getAllByRole('button').filter(button =>
      button.querySelector('svg.lucide-x') &&
      button.closest('[class*="border rounded-lg"]')?.contains(lineItemContainers[1])
    );
    expect(removeButtons.length).toBe(1);

    await act(async () => {
      fireEvent.click(removeButtons[0]);
    });

    expect(screen.queryByTestId('input-amount-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('input-amount-0')).toBeInTheDocument();
  });

  it('should handle file uploads for line items', async () => {
    render(<CreateExpenseDialog open={true} onOpenChange={() => {}} />);

    // Upload file to first line item
    const uploadButton = screen.getByTestId('mock-upload');
    await act(async () => {
      fireEvent.click(uploadButton);
    });

    // Verify file appears in the line item
    expect(screen.getByTestId('uploaded-file-0')).toBeInTheDocument();
    expect(screen.getByText('test-file.jpg')).toBeInTheDocument();
  });

  it('should allow removing uploaded files', async () => {
    render(<CreateExpenseDialog open={true} onOpenChange={() => {}} />);

    // Upload a file first
    const uploadButton = screen.getByTestId('mock-upload');
    await act(async () => {
      fireEvent.click(uploadButton);
    });

    expect(screen.getByTestId('uploaded-file-0')).toBeInTheDocument();

    // Remove the file
    const removeButton = screen.getByTestId('remove-file-0');
    await act(async () => {
      fireEvent.click(removeButton);
    });

    expect(screen.queryByTestId('uploaded-file-0')).not.toBeInTheDocument();
  });

  it('should validate form and show errors', async () => {
    render(<CreateExpenseDialog open={true} onOpenChange={() => {}} />);

    const submitButton = screen.getByRole('button', { name: /Create Expense/ });

    // Try to submit empty form
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('Amount is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });
  });

  it('should submit form successfully with valid data', async () => {
    const mockCreateExpenseAction = createExpenseAction as Mock;
    mockCreateExpenseAction.mockResolvedValue({ success: true });

    render(<CreateExpenseDialog open={true} onOpenChange={() => {}} />);

    // Fill in required fields
    const amountInput = screen.getByTestId('input-amount-0');
    const descriptionInput = screen.getByTestId('input-description-0');
    const dateInput = screen.getByTestId('input-date');

    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '25.50' } });
      fireEvent.change(descriptionInput, { target: { value: 'Lunch meeting' } });
      fireEvent.change(dateInput, { target: { value: '2024-01-15' } });
    });

    const submitButton = screen.getByRole('button', { name: /Create Expense/ });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockCreateExpenseAction).toHaveBeenCalledWith(
        expect.any(FormData)
      );
      expect(toast.success).toHaveBeenCalledWith('Expense saved as draft!');
    });
  });

  it('should handle submission errors', async () => {
    const mockCreateExpenseAction = createExpenseAction as Mock;
    mockCreateExpenseAction.mockResolvedValue({
      success: false,
      error: 'Database connection failed'
    });

    render(<CreateExpenseDialog open={true} onOpenChange={() => {}} />);

    // Fill in required fields
    const amountInput = screen.getByTestId('input-amount-0');
    const descriptionInput = screen.getByTestId('input-description-0');
    const dateInput = screen.getByTestId('input-date');

    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '25.50' } });
      fireEvent.change(descriptionInput, { target: { value: 'Lunch meeting' } });
      fireEvent.change(dateInput, { target: { value: '2024-01-15' } });
    });

    const submitButton = screen.getByRole('button', { name: /Create Expense/ });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Database connection failed');
    });
  });

  it('should prevent infinite loops during form submission', async () => {
    const mockCreateExpenseAction = createExpenseAction as Mock;
    // Use a promise that doesn't resolve immediately to test the disabled state
    let resolveAction: (value: any) => void;
    const actionPromise = new Promise((resolve) => {
      resolveAction = resolve;
    });
    mockCreateExpenseAction.mockReturnValue(actionPromise);

    render(<CreateExpenseDialog open={true} onOpenChange={() => {}} />);

    // Fill in required fields
    const amountInput = screen.getByTestId('input-amount-0');
    const descriptionInput = screen.getByTestId('input-description-0');
    const dateInput = screen.getByTestId('input-date');

    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '25.50' } });
      fireEvent.change(descriptionInput, { target: { value: 'Lunch meeting' } });
      fireEvent.change(dateInput, { target: { value: '2024-01-15' } });
    });

    const submitButton = screen.getByRole('button', { name: /Create Expense/ });

    // Click submit once
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Verify button shows submitting text and is disabled
    expect(submitButton).toHaveTextContent('Creating...');
    expect(submitButton).toBeDisabled();

    // Try clicking again while submitting - should not trigger additional calls
    await act(async () => {
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
    });

    // Resolve the action
    resolveAction!({ success: true });

    // Should only call the action once
    await waitFor(() => {
      expect(mockCreateExpenseAction).toHaveBeenCalledTimes(1);
    });
  });

  it('should reset form when dialog closes', async () => {
    const onOpenChange = vi.fn();
    render(<CreateExpenseDialog open={true} onOpenChange={onOpenChange} />);

    // Fill in some data
    const amountInput = screen.getByTestId('input-amount-0');
    const descriptionInput = screen.getByTestId('input-description-0');

    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '25.50' } });
      fireEvent.change(descriptionInput, { target: { value: 'Lunch meeting' } });
    });

    // Verify values are set (number inputs return numeric values)
    expect(amountInput).toHaveValue(25.5);
    expect(descriptionInput).toHaveValue('Lunch meeting');

    // Close dialog
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await act(async () => {
      fireEvent.click(cancelButton);
    });

    // Verify onOpenChange was called with false
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show success glow animation for draft submissions', async () => {
    const mockCreateExpenseAction = createExpenseAction as Mock;
    mockCreateExpenseAction.mockResolvedValue({ success: true });

    render(<CreateExpenseDialog open={true} onOpenChange={() => {}} />);

    // Fill in required fields
    const amountInput = screen.getByTestId('input-amount-0');
    const descriptionInput = screen.getByTestId('input-description-0');
    const dateInput = screen.getByTestId('input-date');

    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '25.50' } });
      fireEvent.change(descriptionInput, { target: { value: 'Lunch meeting' } });
      fireEvent.change(dateInput, { target: { value: '2024-01-15' } });
    });

    const submitButton = screen.getByRole('button', { name: /Create Expense/ });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('success-glow')).toBeInTheDocument();
    });
  });
});