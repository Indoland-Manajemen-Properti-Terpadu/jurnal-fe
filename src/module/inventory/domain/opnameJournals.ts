import type { StockMovement } from '@/module/inventory/domain/stockMovement';

/**
 * The journals a posted count booked: those of its own adjustment movements. A reversal movement
 * is left out, because the service points it at the original journal, not at the reversing one.
 */
export const opnameJournalIds = (movements: readonly StockMovement[], opnameId: string): string[] => [
  ...new Set(
    movements
      .filter((move) => move.sourceId === opnameId && !move.isReversal && move.journalId)
      .map((move) => move.journalId as string)
  ),
];
