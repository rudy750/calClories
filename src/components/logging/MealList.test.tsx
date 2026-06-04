import { fireEvent, render, screen } from '@testing-library/react';
import MealList from './MealList';
import type { MealEntry } from '../../types';

const meals: MealEntry[] = [
  {
    id: 1,
    date: '2026-06-04',
    mealSlot: 'breakfast',
    foodName: 'Oats',
    amountG: 80,
    calories: 300,
    proteinG: 10,
    carbG: 50,
    fatG: 5,
    loggedAt: '2026-06-04T08:00:00.000Z',
    isQuickAdd: false,
  },
  {
    id: 2,
    date: '2026-06-04',
    mealSlot: 'lunch',
    foodName: 'Chicken bowl',
    amountG: 250,
    calories: 650,
    proteinG: 45,
    carbG: 70,
    fatG: 20,
    loggedAt: '2026-06-04T13:00:00.000Z',
    isQuickAdd: false,
  },
  {
    id: 3,
    date: '2026-06-04',
    mealSlot: 'lunch',
    foodName: 'Fruit',
    amountG: 120,
    calories: 90,
    proteinG: 1,
    carbG: 22,
    fatG: 0,
    loggedAt: '2026-06-04T13:30:00.000Z',
    isQuickAdd: false,
  },
];

describe('MealList', () => {
  it('groups meals by slot and shows slot totals', () => {
    render(<MealList meals={meals} onDelete={vi.fn()} onAddToSlot={vi.fn()} />);

    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('Dinner')).toBeInTheDocument();
    expect(screen.getByText('Snacks')).toBeInTheDocument();

    expect(screen.getAllByText('300 kcal').length).toBeGreaterThan(0);
    expect(screen.getByText('740 kcal')).toBeInTheDocument();
  });

  it('calls onAddToSlot with selected slot', () => {
    const onAddToSlot = vi.fn();
    render(<MealList meals={meals} onDelete={vi.fn()} onAddToSlot={onAddToSlot} />);

    const addButtons = screen.getAllByRole('button', { name: '+ Add food' });
    fireEvent.click(addButtons[0]);
    fireEvent.click(addButtons[3]);

    expect(onAddToSlot).toHaveBeenNthCalledWith(1, 'breakfast');
    expect(onAddToSlot).toHaveBeenNthCalledWith(2, 'snack');
  });

  it('calls onDelete with item id when delete is clicked', () => {
    const onDelete = vi.fn();
    render(<MealList meals={meals} onDelete={onDelete} onAddToSlot={vi.fn()} />);

    const deleteButtons = screen.getAllByRole('button').filter(b => b.querySelector('svg'));
    fireEvent.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
