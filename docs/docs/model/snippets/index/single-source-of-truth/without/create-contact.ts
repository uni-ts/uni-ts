import type { Contact } from './contact';

export function createContact(data: Contact) {
  // Validation rules are separated from the Contact type
  if (!data.email.includes('@')) {
    throw new Error('Invalid email');
  }

  if (data.name.length < 3) {
    throw new Error('Name too short');
  }
  // ...
}
