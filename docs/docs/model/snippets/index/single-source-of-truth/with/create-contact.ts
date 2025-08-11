import { Contact } from './contact';

export function createContact(data: Contact) {
  const contact = Contact.from(data); // One-line validation
  // ...
}
