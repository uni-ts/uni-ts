import { createModel, type InferModelOutput } from '@uni-ts/model';
import { type } from 'arktype';

export type Product = InferModelOutput<typeof Product>;
export const Product = createModel(
  type({
    name: 'string>0',
    price: 'number>0',
    category: "'electronics'|'clothing'|'books'",
  }),
);
