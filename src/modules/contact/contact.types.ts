export interface CreateContactMessageInput {
  name: string;
  email: string;
  mobile: string;
  subject?: string;
  message: string;
}

export interface ContactMessageCreated {
  id: number;
}

export interface ContactMessageRecord {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  subject: string | null;
  message: string;
  addDate: Date;
}

/** A row in the admin inbox table: the subject and message load only via the by-id endpoint. */
export type ContactMessageListItem = Pick<ContactMessageRecord, "id" | "name" | "email" | "mobile">;

export interface ContactMessagePageResult {
  items: ContactMessageRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
