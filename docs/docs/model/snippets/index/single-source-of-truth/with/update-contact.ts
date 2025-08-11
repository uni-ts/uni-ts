import { Contact } from './contact';

export function updateContact(data: Contact) {
  const contact = Contact.from(data); // Same validation rules
  // ...
}
