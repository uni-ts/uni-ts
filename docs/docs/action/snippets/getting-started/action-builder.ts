import { createAction } from '@uni-ts/action';

// Action with no input
const simpleAction = createAction();

// Action with typed input
const typedAction = createAction<{ userId: string; data: unknown }>();
