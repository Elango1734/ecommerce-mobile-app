import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { EviraHeader, EviraScreen } from '@/components/evira';
import { EmptyState } from '@/components/ui/states';

const mockGoBack = jest.fn();
const mockCanGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack, canGoBack: mockCanGoBack, navigate: jest.fn() })
}));

function renderInTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('EviraHeader back control', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the back control on a pushed screen and pops on press', () => {
    mockCanGoBack.mockReturnValue(true);
    renderInTheme(<EviraHeader title="My Wishlist" />);

    fireEvent.press(screen.getByLabelText('Go back'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('hides it where there is nothing to pop, instead of dispatching an unhandled GO_BACK', () => {
    mockCanGoBack.mockReturnValue(false);
    renderInTheme(<EviraHeader title="My Cart" />);

    expect(screen.queryByLabelText('Go back')).toBeNull();
  });

  it('keeps an explicit onBack even with nothing to pop', () => {
    mockCanGoBack.mockReturnValue(false);
    const onBack = jest.fn();
    renderInTheme(<EviraHeader title="Filtered" onBack={onBack} />);

    fireEvent.press(screen.getByLabelText('Go back'));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(mockGoBack).not.toHaveBeenCalled();
  });
});

describe('EviraScreen', () => {
  it('keeps the title and back control around an empty state', () => {
    mockCanGoBack.mockReturnValue(true);
    renderInTheme(
      <EviraScreen title="My Wishlist">
        <EmptyState title="Your wishlist is empty" />
      </EviraScreen>
    );

    expect(screen.getByText('My Wishlist')).toBeTruthy();
    expect(screen.getByText('Your wishlist is empty')).toBeTruthy();
    expect(screen.getByLabelText('Go back')).toBeTruthy();
  });
});
