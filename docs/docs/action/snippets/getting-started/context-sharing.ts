declare function fetchUser(id: string): Promise<{ id: string; name: string }>;
declare function fetchPermissions(userId: string): Promise<string[]>;

// ---cut---
import { createAction, next } from '@uni-ts/action';

const userAction = createAction<{ userId: string }>()
  .with(async ({ input }) => {
    const user = await fetchUser(input.userId);
    return next({ user }); // Add user to context
  })
  .with(async ({ ctx }) => {
    const permissions = await fetchPermissions(ctx.user.id);
    return next({ permissions }); // Add permissions to context
  })
  .with(({ ctx }) => {
    const canEdit = ctx.permissions.includes('edit');
    return next({ canEdit }); // Add computed value to context
  })
  .do(({ ctx }) => {
    // All context is available and properly typed
    return {
      user: ctx.user,
      permissions: ctx.permissions,
      canEdit: ctx.canEdit,
    };
  });
