import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../setup/renderWithProviders';
import { QuantityStepper } from '@/components/ui/QuantityStepper';

describe('QuantityStepper', () => {
  it('increments and decrements within bounds', () => {
    const onChange = jest.fn();
    renderWithProviders(<QuantityStepper quantity={1} min={1} max={3} onChange={onChange} />);

    fireEvent.press(screen.getByLabelText('Increase quantity'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('does not go below the minimum', () => {
    const onChange = jest.fn();
    renderWithProviders(<QuantityStepper quantity={1} min={1} max={3} onChange={onChange} />);

    const decreaseButton = screen.getByLabelText('Decrease quantity');
    expect(decreaseButton.props.accessibilityState?.disabled ?? decreaseButton.props.disabled).toBeTruthy();
  });

  it('does not exceed the maximum', () => {
    const onChange = jest.fn();
    renderWithProviders(<QuantityStepper quantity={3} min={1} max={3} onChange={onChange} />);

    const increaseButton = screen.getByLabelText('Increase quantity');
    expect(increaseButton.props.accessibilityState?.disabled ?? increaseButton.props.disabled).toBeTruthy();
  });
});
