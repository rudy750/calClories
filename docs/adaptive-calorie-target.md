# Adaptive calorie target recalculation

## Overview

The adaptive calorie logic uses recent progress data to estimate a user's current maintenance calories (TDEE), then turns that estimate into an updated calorie target that still respects the user's goal. In practice, it combines:

- weight trend from recent weigh-ins
- average logged calorie intake from recent meal entries
- the user's goal type and pace
- safety and macro rules from the macro engine

## Algorithm

### 1. Estimate TDEE from progress data

The app builds a trend line from weigh-ins by sorting them by date and converting each entry into a day offset from the first logged weight. It then runs a simple ordinary least squares linear regression over those points to estimate a slope in kilograms per day.

That slope is paired with average calorie intake from meal logs. Meals are grouped by date, total calories are summed for each logged day, and the daily totals are averaged. If there are not enough data points yet, the estimator returns `null` instead of producing a guess.

The final TDEE estimate is based on the idea that sustained weight change reflects an energy surplus or deficit. The implementation uses the common approximation that **1 kg of body weight corresponds to about 7700 kcal**, so:

- losing weight implies intake has been below maintenance
- gaining weight implies intake has been above maintenance

So the estimate is effectively:

`estimated TDEE = average logged calories - (weight trend in kg/day × 7700)`

Because the weight trend comes from linear regression instead of just comparing the first and last entry, the estimate is less sensitive to day-to-day fluctuations.

### 2. Recalculate the calorie target from TDEE and the user's goal

Once TDEE is estimated, the adaptive target logic applies the user's goal adjustment:

- **maintain:** no adjustment
- **lose:** subtract calories based on the configured weekly pace
- **gain:** add calories based on the configured weekly pace

The pace-based adjustment also uses the same approximate `7700 kcal/kg` conversion, converted from kilograms per week into calories per day.

That produces a raw target, but the app does not jump there immediately. Each adaptive update is clamped to at most **±150 kcal** relative to the current target, which keeps changes moderate instead of reacting too aggressively to short-term noise.

After the clamp, a minimum safety floor is applied:

- **male:** at least 1500 kcal
- **female:** at least 1200 kcal

### 3. Recompute macros from the updated calorie target

After calories are adjusted, macros are recalculated from the new calorie target using the user's selected macro preset (balanced, high protein, low carb, or custom percentages). This keeps protein, carbs, and fat aligned with the new calorie level instead of leaving the old gram targets in place.

## Source locations

- `src/domain/adaptiveEngine.ts`  
  Core adaptive logic. Estimates TDEE from weigh-ins plus meal logs, computes the goal-based calorie target, applies the ±150 kcal clamp, and returns an adaptive target.

- `src/pages/ProgressPage.tsx`  
  Loads recent weigh-ins and the last 28 days of meals, calls the TDEE estimator, and displays the current calorie, macro, and TDEE information on the Progress page.

- `src/domain/macroEngine.ts`  
  Provides the related macro logic used by the adaptive engine, including macro recomputation from calorie targets and the minimum safety floor.

- `src/db/database.ts`  
  Contains the IndexedDB queries used to fetch weigh-ins and meal logs (`getWeighIns`, `getMealsInRange`) and the target persistence helpers.

- `src/domain/adaptiveEngine.test.ts`  
  Small, focused tests that document expected adaptive behavior such as TDEE estimation, the ±150 kcal clamp, and minimum-calorie safety handling.
