import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../setup/renderWithProviders';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders its label and fires onPress', () => {
    const onPress = jest.fn();
    renderWithProviders(<Button label="Add to cart" onPress={onPress} />);
    fireEvent.press(screen.getByText('Add to cart'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress while loading (duplicate-tap protection)', () => {
    const onPress = jest.fn();
    renderWithProviders(<Button label="Place order" loading onPress={onPress} />);
    fireEvent.press(screen.getByText('Place order'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not fire onPress when explicitly disabled', () => {
    const onPress = jest.fn();
    renderWithProviders(<Button label="Submit" disabled onPress={onPress} />);
    fireEvent.press(screen.getByText('Submit'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
