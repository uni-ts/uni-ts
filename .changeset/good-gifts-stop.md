---
'@uni-ts/action': minor
---

`createAction` is now unsafe by default (throws exceptions instead of returning `Result`). In order to use the previous behavior, you need to import `createSafeAction` from `@uni-ts/action/safe`.

```typescript
// Before
import { createAction } from '@uni-ts/action';

// After
import { createSafeAction } from '@uni-ts/action/safe';
```
