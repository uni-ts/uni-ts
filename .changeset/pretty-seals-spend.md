---
'@uni-ts/model': patch
---

Export generic types of models. Now you can create your own functions that takes models as parameters using: `Model<S>, SafeModel<S>, SafeFirstModel<S>, UnsafeFirstModel<S>`.

```typescript
import { createModel, type Model, type StandardSchemaV1 } from '@uni-ts/model';
import z, { ZodError } from 'zod';

function getValidatedSearchParams<S extends StandardSchemaV1>(model: Model<S>) {
  const searchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(searchParams.entries());

  try {
    return model.cast(params);
  } catch {
    return null;
  }
}
```
