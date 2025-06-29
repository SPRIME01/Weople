export function types(): string {
  return 'types';
}

// Contact type for the contacts feature
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  avatar?: string;
}
