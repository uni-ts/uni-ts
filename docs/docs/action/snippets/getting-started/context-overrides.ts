import { createAction, next } from '@uni-ts/action';

const action = createAction()
  .with(() => next({ data: 'data' }))
  .with(({ ctx }) => next({ data: ctx.data.toUpperCase() }))
  .with(({ ctx }) => next({ data: `${ctx.data} ${ctx.data}` }))
  .do(({ ctx }) => ctx.data); // returns "DATA DATA"
