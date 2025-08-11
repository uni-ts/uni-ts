import { fromThrowable } from '@uni-ts/result';

// Make JSON.parse safe for API responses
const safeParseJSON = fromThrowable(JSON.parse, 'invalid_json');

// Example API response data
const apiResponse = '{"user": "data"}';

// Unsafe: may throw at runtime
const userData = JSON.parse(apiResponse);

// Safe: returns a Result
const userResult = safeParseJSON(apiResponse);
