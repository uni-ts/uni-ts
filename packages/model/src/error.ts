import type { StandardSchemaV1 } from './standard-schema.js';

/**
 * Error thrown when data validation fails against a model's schema.
 *
 * Contains detailed information about all validation issues that occurred during validation.
 * The error message is set to the first issue's message for convenience.
 *
 * @example
 * ```typescript
 * import { createModel, ModelValidationError } from '@uni-ts/model';
 * import { z } from 'zod';
 *
 * const User = createModel(z.object({
 *   name: z.string().min(1),
 *   email: z.string().email(),
 * }));
 *
 * try {
 *   User.from({ name: '', email: 'invalid-email' });
 * } catch (ex) {
 *   if (ex instanceof ModelValidationError) {
 *     console.error('Issues:', ex.issues);
 *   }
 * }
 * ```
 */
export class ModelValidationError extends Error {
  /**
   * Used to distinguish this error from others with the same shape.
   */
  readonly type = 'ModelValidationError';

  /**
   * Array of all validation issues that caused the error.
   * Each issue contains details about what validation rule failed and where.
   */
  readonly issues: StandardSchemaV1.FailureResult['issues'];

  /**
   * Creates a new ModelValidationError with the provided validation issues.
   *
   * @param issues - Array of validation issues from the schema validation
   */
  constructor(issues: StandardSchemaV1.FailureResult['issues']) {
    super(
      JSON.stringify(
        expandIssues(issues).map(({ message, dotPath }) => ({ message, path: dotPath })),
        null,
        2,
      ),
    );
    this.name = ModelValidationError.name;
    this.issues = issues;
  }
}

export function prettifyError(error: ModelValidationError): string {
  const issues = expandIssues(error.issues);

  const lines: string[] = [];

  for (const { issue, dotPath } of issues) {
    lines.push(`✖ ${issue.message}`);
    if (dotPath) lines.push(`  → at ${dotPath}`);
  }

  return lines.join('\n');
}

function expandIssues(issues: StandardSchemaV1.FailureResult['issues']) {
  return [...issues].map((issue) => {
    const path = issue.path || [];
    const message = issue.message;
    const pathSegments = path.map(toPropertyKey);
    const dotPath = toDotPath(pathSegments);
    return { message, issue, path, pathSegments, dotPath };
  });
}

function toDotPath(path: PropertyKey[]) {
  const segments: string[] = [];

  for (const seg of path) {
    if (typeof seg === 'number') segments.push(`[${seg}]`);
    else if (typeof seg === 'symbol') segments.push(`[${JSON.stringify(String(seg))}]`);
    else if (/[^\w$]/.test(seg)) segments.push(`[${JSON.stringify(seg)}]`);
    else {
      if (segments.length) segments.push('.');
      segments.push(seg);
    }
  }

  return segments.join('');
}

function toPropertyKey(segment: StandardSchemaV1.PathSegment | PropertyKey): PropertyKey {
  return typeof segment === 'object' ? segment.key : segment;
}
