import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

// Valid DateRange requires start date to be before end date
export type DateRange = InferModelOutput<typeof DateRange>;
export const DateRange = createModel(
  z
    .object({
      start: z.date(),
      end: z.date(),
    })
    .refine((data) => data.start <= data.end, {
      message: 'Start date must be before end date',
    })
    .brand('DateRange'),
).extend({ isInRange });

function isInRange(date: Date, range: DateRange) {
  return date >= range.start && date <= range.end;
}
