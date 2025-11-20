import { Item } from '@/types/types';

// SM-2 Algorithm Constants
const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

export type Grade = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Calculates the new SRS stats for an item based on the user's grade.
 * Based on the SuperMemo-2 (SM-2) algorithm.
 * 
 * Grades:
 * 5 - Perfect response
 * 4 - Correct response after a hesitation
 * 3 - Correct response recalled with serious difficulty
 * 2 - Incorrect response; where the correct one seemed easy to recall
 * 1 - Incorrect response; the correct one remembered
 * 0 - Complete blackout
 */
export function calculateSRS(item: Item, grade: Grade): Item {
  let {
    interval = 0,
    repetition = 0,
    easeFactor = DEFAULT_EASE_FACTOR,
  } = item;

  if (grade >= 3) {
    // Correct response
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition += 1;
  } else {
    // Incorrect response
    repetition = 0;
    interval = 1;
  }

  // Update Ease Factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (easeFactor < MIN_EASE_FACTOR) easeFactor = MIN_EASE_FACTOR;

  // Calculate next review date
  const now = Date.now();
  const nextReviewDate = now + interval * 24 * 60 * 60 * 1000;

  return {
    ...item,
    interval,
    repetition,
    easeFactor,
    nextReviewDate,
  };
}

/**
 * Returns a human-readable string for when the next review will be.
 */
export function getNextReviewText(interval: number): string {
  if (interval <= 1) return 'Tomorrow';
  return `in ${interval} days`;
}
