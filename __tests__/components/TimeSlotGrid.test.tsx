import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TimeSlotGrid from '../../src/components/TimeSlotGrid';

describe('TimeSlotGrid', () => {
  const slots = ['09:00', '10:00', '11:00'];

  it('renders slots correctly', () => {
    const onSelectSlot = jest.fn();
    const { getByText } = render(
      <TimeSlotGrid
        slots={slots}
        selectedSlot={null}
        onSelectSlot={onSelectSlot}
      />
    );

    expect(getByText('09:00')).toBeTruthy();
    expect(getByText('10:00')).toBeTruthy();
    expect(getByText('11:00')).toBeTruthy();
  });

  it('calls onSelectSlot when a slot is pressed', () => {
    const onSelectSlot = jest.fn();
    const { getByText } = render(
      <TimeSlotGrid
        slots={slots}
        selectedSlot={null}
        onSelectSlot={onSelectSlot}
      />
    );

    fireEvent.press(getByText('10:00'));
    expect(onSelectSlot).toHaveBeenCalledWith('10:00');
  });

  it('renders empty state when no slots provided', () => {
    const onSelectSlot = jest.fn();
    const { getByText } = render(
      <TimeSlotGrid
        slots={[]}
        selectedSlot={null}
        onSelectSlot={onSelectSlot}
      />
    );

    expect(getByText('No available slots for this day.')).toBeTruthy();
  });
});
