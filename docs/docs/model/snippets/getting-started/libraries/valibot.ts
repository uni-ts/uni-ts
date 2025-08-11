import { createModel, type InferModelOutput } from '@uni-ts/model';
import * as v from 'valibot';

export type Product = InferModelOutput<typeof Product>;
export const Product = createModel(
  v.object({
    name: v.pipe(v.string(), v.minLength(1)),
    price: v.pipe(v.number(), v.minValue(0)),
    category: v.picklist(['electronics', 'clothing', 'books']),
  }),
);
