/**
 * Tests for the ListRow component embedded in ListsPage.
 * ListRow is not exported, so we render ListsPage with mocked dependencies
 * and interact with the resulting list rows.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// --- Mock modules before importing ListsPage ---

// Mock the api client so no real network calls happen
vi.mock('../api/client', () => ({
  api: {
    words: {
      list: vi.fn().mockResolvedValue([]),
    },
    lists: {
      list: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      rename: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock the useLists hook so we control the list data
vi.mock('../hooks/useLists', () => ({
  useLists: vi.fn(),
}));

import ListsPage from '../pages/ListsPage';
import { useLists } from '../hooks/useLists';

// Typed alias for the mock
const mockUseLists = useLists as unknown as ReturnType<typeof vi.fn>;

function makeUseLists(overrides: Partial<ReturnType<typeof import('../hooks/useLists').useLists>> = {}) {
  return {
    lists: [],
    loading: false,
    error: null,
    fetchLists: vi.fn(),
    createList: vi.fn(),
    renameList: vi.fn().mockResolvedValue(null),
    deleteList: vi.fn(),
    ...overrides,
  };
}

function renderPage(hook = makeUseLists()) {
  mockUseLists.mockReturnValue(hook);
  return render(
    <MemoryRouter>
      <ListsPage />
    </MemoryRouter>,
  );
}

// A sample editable list to use across tests
const sampleList = { id: 1, name: 'French vocab', wordCount: 5 };

describe('ListRow — editable flag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "..." button for an editable list row', () => {
    renderPage(makeUseLists({ lists: [sampleList] }));
    // There should be one "..." button (the editable user list row)
    expect(screen.getByLabelText('List options')).toBeInTheDocument();
  });

  it('does NOT render "..." button for the non-editable "Alle Wörter" row', () => {
    renderPage(makeUseLists({ lists: [] }));
    // No user lists, so the only row is the non-editable "Alle Wörter"
    expect(screen.queryByLabelText('List options')).not.toBeInTheDocument();
  });
});

describe('ListRow — dropdown open/close', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clicking "..." opens the dropdown showing Rename and Delete', async () => {
    const user = userEvent.setup();
    renderPage(makeUseLists({ lists: [sampleList] }));

    const btn = screen.getByLabelText('List options');
    await user.click(btn);

    expect(screen.getByText('Rename')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('clicking "..." twice closes the dropdown (toggle)', async () => {
    const user = userEvent.setup();
    renderPage(makeUseLists({ lists: [sampleList] }));

    const btn = screen.getByLabelText('List options');
    await user.click(btn);
    expect(screen.getByText('Rename')).toBeInTheDocument();

    await user.click(btn);
    expect(screen.queryByText('Rename')).not.toBeInTheDocument();
  });

  it('pressing Escape closes the dropdown', async () => {
    const user = userEvent.setup();
    renderPage(makeUseLists({ lists: [sampleList] }));

    const btn = screen.getByLabelText('List options');
    await user.click(btn);
    expect(screen.getByText('Rename')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByText('Rename')).not.toBeInTheDocument();
    });
  });

  it('clicking outside the menu closes the dropdown', async () => {
    const user = userEvent.setup();
    renderPage(makeUseLists({ lists: [sampleList] }));

    const btn = screen.getByLabelText('List options');
    await user.click(btn);
    expect(screen.getByText('Rename')).toBeInTheDocument();

    // Click somewhere outside the menu
    await user.click(document.body);

    await waitFor(() => {
      expect(screen.queryByText('Rename')).not.toBeInTheDocument();
    });
  });
});

describe('ListRow — menu actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clicking Rename calls onRenameClick and closes the menu', async () => {
    const user = userEvent.setup();
    const hook = makeUseLists({ lists: [sampleList] });
    renderPage(hook);

    await user.click(screen.getByLabelText('List options'));
    expect(screen.getByText('Rename')).toBeInTheDocument();

    await user.click(screen.getByText('Rename'));

    // Menu should be closed after clicking Rename
    expect(screen.queryByText('Rename')).not.toBeInTheDocument();
    // The page should now show the RenameListModal (triggered by onRenameClick setting state)
    expect(screen.getByRole('heading', { name: /rename list/i })).toBeInTheDocument();
  });

  it('clicking Delete calls onDelete and closes the menu', async () => {
    const user = userEvent.setup();
    // Stub window.confirm to return true automatically
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const hook = makeUseLists({ lists: [sampleList] });
    renderPage(hook);

    await user.click(screen.getByLabelText('List options'));
    expect(screen.getByText('Delete')).toBeInTheDocument();

    await user.click(screen.getByText('Delete'));

    // Menu should be closed
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    // deleteList should have been called with the list id
    expect(hook.deleteList).toHaveBeenCalledWith(sampleList.id);
  });
});
