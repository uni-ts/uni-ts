import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

// Create branded type
type UserId = InferModelOutput<typeof UserId>;
const UserId = createModel(z.uuid().brand('UserId'));

// Function can now require already validated data
function getUser(id: UserId) {
  // No need to validate - ID is guaranteed to be a valid UUID
  return fetch(`/api/users/${id}`);
}

// Usage requires validation
const userId = UserId.from('123e4567-e89b-12d3-a456-426614174000');

getUser(userId);
