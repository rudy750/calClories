import { fireEvent, render, screen } from '@testing-library/react';
import FoodAmountModal from './FoodAmountModal';
import type { NutritionSearchResult } from '../../types';

const food: NutritionSearchResult = {
  id: 'f-1',
  name: 'Greek Yogurt',
  brand: 'Demo Brand',
  calories: 90,
  proteinG: 10,
  carbG: 5,
  fatG: 2,
  servingSizeG: 150,
  servingSizeLabel: '150g',
  source: 'openfoodfacts',
  sourceId: 'f-1',
};

describe('FoodAmountModal', () => {
  it('shows default amount from serving and computed nutrition preview', () => {
    render(
      <FoodAmountModal
        food={food}
        slot="lunch"
        onSave={vi.fn()}
        onBack={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue('150')).toBeInTheDocument();
    expect(screen.getByText('135', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('P', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add to lunch/i })).toBeEnabled();
  });

  it('saves computed payload for selected amount', () => {
    const onSave = vi.fn();

    render(
      <FoodAmountModal
        food={food}
        slot="dinner"
        onSave={onSave}
        onBack={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '200g' }));
    fireEvent.click(screen.getByRole('button', { name: /add to dinner/i }));

    expect(onSave).toHaveBeenCalledWith({
      mealSlot: 'dinner',
      foodName: 'Greek Yogurt (Demo Brand)',
      amountG: 200,
      calories: 180,
      proteinG: 20,
      carbG: 10,
      fatG: 4,
      isQuickAdd: false,
    });
  });

  it('disables save when amount is zero and supports back/close actions', () => {
    const onBack = vi.fn();
    const onClose = vi.fn();

    render(
      <FoodAmountModal
        food={food}
        slot="snack"
        onSave={vi.fn()}
        onBack={onBack}
        onClose={onClose}
      />,
    );

    const amountInput = screen.getByDisplayValue('150');
    fireEvent.change(amountInput, { target: { value: '0' } });

    const saveButton = screen.getByRole('button', { name: /add to snack/i });
    expect(saveButton).toBeDisabled();

    const allButtons = screen.getAllByRole('button');
    fireEvent.click(allButtons[0]);
    fireEvent.click(allButtons[1]);

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
