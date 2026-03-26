/**
 * Tests for the RenameListModal component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RenameListModal from '../components/lists/RenameListModal';

function renderModal(
  currentName = 'My List',
  onRename: (name: string) => Promise<string | null> = vi.fn().mockResolvedValue(null),
  onClose: () => void = vi.fn(),
) {
  return {
    onRename,
    onClose,
    ...render(<RenameListModal currentName={currentName} onRename={onRename} onClose={onClose} />),
  };
}

describe('RenameListModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with the input pre-filled with currentName', () => {
    renderModal('French words');
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('French words');
  });

  it('clicking cancel calls onClose', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('submitting the form calls onRename with the current input value', async () => {
    const user = userEvent.setup();
    const onRename = vi.fn().mockResolvedValue(null);
    const { onClose } = renderModal('Old name', onRename);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'New name');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(onRename).toHaveBeenCalledWith('New name');
    // On success (null returned) the modal closes
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it('pressing Enter on the input submits the form', async () => {
    const user = userEvent.setup();
    const onRename = vi.fn().mockResolvedValue(null);
    const { onClose } = renderModal('Original', onRename);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Updated name{Enter}');

    expect(onRename).toHaveBeenCalledWith('Updated name');
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it('displays the error string returned by onRename', async () => {
    const user = userEvent.setup();
    const onRename = vi.fn().mockResolvedValue('Name already exists');
    renderModal('My List', onRename);

    await user.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(screen.getByText('Name already exists')).toBeInTheDocument();
    });
  });

  it('does not close when onRename returns an error', async () => {
    const user = userEvent.setup();
    const onRename = vi.fn().mockResolvedValue('Some error');
    const { onClose } = renderModal('My List', onRename);

    await user.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(screen.getByText('Some error')).toBeInTheDocument();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on successful save (onRename returns null)', async () => {
    const user = userEvent.setup();
    const onRename = vi.fn().mockResolvedValue(null);
    const { onClose } = renderModal('My List', onRename);

    await user.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it('pressing Escape calls onClose', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    // Focus the input and press Escape
    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('clicking the backdrop calls onClose', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    // The backdrop is the outermost div; clicking it directly triggers onClose
    // We use fireEvent on the backdrop element directly (targeting the fixed overlay)
    const backdrop = screen.getByRole('heading', { name: /rename list/i }).closest('[style*="blur"]') as HTMLElement;
    // Click the backdrop itself (not its children)
    fireEvent.click(backdrop!, { target: backdrop });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
