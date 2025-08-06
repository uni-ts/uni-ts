---
'@uni-ts/model': minor
---

💥 BREAKING: Safe utilities now return `ModelValidationError` as error value instead of `StandardSchemaV1.FailureResult['issues']`.

```typescript
const Email = createSafeModel(z.string().email().brand('Email'));

// Before
const result = Email.from('invalid-email'); // Result<Email, StandardSchemaV1.FailureResult['issues']>

if (isErr(result)) {
  console.error('Issues are:', result.error.join(','));
}

// After
const result = Email.from('invalid-email'); // Result<Email, ModelValidationError>

if (isErr(result)) {
  console.error('Issues are:', result.error.issues.join(','));
}
```
