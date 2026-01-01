import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DateList from '../../src/components/DateList';
import { addDays, startOfDay } from 'date-fns';

describe('DateList', () => {
  const today = startOfDay(new Date());
  const dates = [
    today,
    addDays(today, 1),
    addDays(today, 2),
  ];

  it('renders correctly with dates', () => {
    const onSelectDate = jest.fn();
    const { getByText } = render(
      <DateList
        dates={dates}
        selectedDate={dates[0]}
        onSelectDate={onSelectDate}
      />
    );

    // Check if some dates are rendered
    expect(getByText(today.getDate().toString())).toBeTruthy();
    expect(getByText(dates[1].getDate().toString())).toBeTruthy();
  });

  it('calls onSelectDate when a date is pressed', () => {
    const onSelectDate = jest.fn();
    const { getByText } = render(
      <DateList
        dates={dates}
        selectedDate={dates[0]}
        onSelectDate={onSelectDate}
      />
    );

    const secondDate = getByText(dates[1].getDate().toString());
    fireEvent.press(secondDate);

    expect(onSelectDate).toHaveBeenCalledWith(dates[1]);
  });
});
