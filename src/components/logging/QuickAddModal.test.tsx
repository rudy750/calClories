import { fireEvent, render, screen } from '@testing-library/react';
import QuickAddModal from './QuickAddModal';

describe('QuickAddModal', () => {
  it('requires calories before enabling save', () => {
    render(<QuickAddModal slot="lunch" onSave={vi.fn()} onClose={vi.fn()} />);

    const saveButton = screen.getByRole('button', { name: /^add$/i });
    expect(saveButton).toBeDisabled();
  });

  it('saves payload with provided fields', () => {
    const onSave = vi.fn();
    render(<QuickAddModal slot="breakfast" onSave={onSave} onClose={vi.fn()} />);

    fireEvent.change(screen.getByDisplayValue('Quick add'), { target: { value: 'Protein Shake' } });
    fireEvent.change(screen.getByPlaceholderText('500'), { target: { value: '420' } });

    const macroInputs = screen.getAllByPlaceholderText('0');
    fireEvent.change(macroInputs[0], { target: { value: '30' } });
    fireEvent.change(macroInputs[1], { target: { value: '40' } });
    fireEvent.change(macroInputs[2], { target: { value: '10' } });

    fireEvent.click(screen.getByRole('button', { name: /add 420 kcal/i }));

    expect(onSave).toHaveBeenCalledWith({
      mealSlot: 'breakfast',
      foodName: 'Protein Shake',
      amountG: 0,
      calories: 420,
      proteinG: 30,
      carbG: 40,
      fatG: 10,
      isQuickAdd: true,
    });
  });

  it('falls back to default name and handles close', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(<QuickAddModal slot="snack" onSave={onSave} onClose={onClose} />);

    fireEvent.change(screen.getByDisplayValue('Quick add'), { target: { value: '' } });
    fireEvent.change(screen.getByPlaceholderText('500'), { target: { value: '250' } });
    fireEvent.click(screen.getByRole('button', { name: /add 250 kcal/i }));

    expect(onSave).toHaveBeenCalledWith({
      mealSlot: 'snack',
      foodName: 'Quick add',
      amountG: 0,
      calories: 250,
      proteinG: 0,
      carbG: 0,
      fatG: 0,
      isQuickAdd: true,
    });

    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
