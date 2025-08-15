::: code-group

```typescript twoslash [✅ Product]
<!--@include: ./product.ts-->
```

```typescript twoslash [✅ OrderItem]
// @filename: product.ts
<!--@include: ./product.ts-->
// @filename: order-item.ts
// ---cut---
<!--@include: ./order-item.ts-->
```

```typescript twoslash [✅ Order]
// @filename: product.ts
<!--@include: ./product.ts-->
// @filename: order-item.ts
<!--@include: ./order-item.ts-->
// @filename: order.ts
// ---cut---
<!--@include: ./order.ts-->
```

```typescript twoslash [❌ API response]
// @filename: product.ts
<!--@include: ./product.ts-->
// @filename: products-api-response.ts
// ---cut---
<!--@include: ./products-api-response.ts-->
```

```typescript twoslash [❌ DB entity]
// @filename: order-item-entity.ts
// ---cut---
<!--@include: ./order-item-entity.ts-->
```

:::
