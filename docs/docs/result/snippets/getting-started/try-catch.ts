import fs from 'node:fs';

// ---cut---
import { tryCatch } from '@uni-ts/result';

const result = tryCatch(() => {
  const contents = fs.readFileSync('contacts.json', 'utf-8');
  return JSON.parse(contents) as unknown;
}, 'failed_to_read_contacts');
