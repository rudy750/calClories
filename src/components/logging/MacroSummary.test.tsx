import { render, screen } from '@testing-library/react';
import MacroSummary from './MacroSummary';

describe('MacroSummary', () => {
  it('shows remaining calories when under target', () => {
    render(
      <MacroSummary
        calories={1800}
        targetCalories={2200}
        proteinG={120}
        targetProteinG={160}
        carbG={180}
        targetCarbG={240}
        fatG={60}
        targetFatG={80}
      />,
    );

    expect(screen.getByText('400 remaining')).toBeInTheDocument();
    expect(screen.getByText('Goal: 2200 kcal')).toBeInTheDocument();
    expect(screen.getByText('120/160g')).toBeInTheDocument();
    expect(screen.getByText('180/240g')).toBeInTheDocument();
    expect(screen.getByText('60/80g')).toBeInTheDocument();
  });

  it('shows over-budget state when calories exceed target', () => {
    render(
      <MacroSummary
        calories={2300}
        targetCalories={2200}
        proteinG={170}
        targetProteinG={160}
        carbG={250}
        targetCarbG={240}
        fatG={90}
        targetFatG={80}
      />,
    );

    expect(screen.getByText('100 over')).toBeInTheDocument();
    expect(screen.getByText('2300')).toBeInTheDocument();
    expect(screen.getByText('Goal: 2200 kcal')).toBeInTheDocument();
  });

  it('handles zero targets safely', () => {
    render(
      <MacroSummary
        calories={0}
        targetCalories={0}
        proteinG={0}
        targetProteinG={0}
        carbG={0}
        targetCarbG={0}
        fatG={0}
        targetFatG={0}
      />,
    );

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Goal: 0 kcal')).toBeInTheDocument();
    expect(screen.getAllByText('0/0g')).toHaveLength(3);
  });
});
