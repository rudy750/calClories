import {
  fromDisplayHeight,
  fromDisplayPace,
  fromDisplayWeight,
  toDisplayHeight,
  toDisplayPace,
  toDisplayWeight,
} from './units';

describe('units', () => {
  it('converts weight to imperial display', () => {
    expect(toDisplayWeight(80, 'imperial')).toBe(176.4);
  });

  it('converts imperial weight input back to kg', () => {
    expect(fromDisplayWeight(176.4, 'imperial')).toBe(80);
  });

  it('round-trips metric weight', () => {
    const display = toDisplayWeight(72.3, 'metric');
    expect(fromDisplayWeight(display, 'metric')).toBe(72.3);
  });

  it('converts height to imperial display', () => {
    expect(toDisplayHeight(180, 'imperial')).toBe(70.9);
  });

  it('converts imperial height input back to cm', () => {
    expect(fromDisplayHeight(70.9, 'imperial')).toBe(180.1);
  });

  it('converts pace values between systems', () => {
    expect(toDisplayPace(0.5, 'imperial')).toBe(1.1);
    expect(fromDisplayPace(1.1, 'imperial')).toBe(0.5);
  });
});
