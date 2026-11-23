import { AppError } from "../../utils/AppError.js";
import { buildAdminListResponse } from "../../utils/adminListQuery.js";
import * as contactRepository from "./contact.repository.js";
import type { ContactListQuery } from "./contact.validator.js";
import type {
  ContactMessageCreated,
  ContactMessageRecord,
  CreateContactMessageInput,
} from "./contact.types.js";

export async function createContactMessage(
  input: CreateContactMessageInput
): Promise<ContactMessageCreated> {
  return contactRepository.insertContactMessage(input);
}

export async function listContactMessages(query: ContactListQuery) {
  const { items, total } = await contactRepository.listPage(query);
  return buildAdminListResponse(items, total, query);
}

export async function getContactMessage(id: number): Promise<ContactMessageRecord> {
  const message = await contactRepository.findById(id);
  if (!message) {
    throw new AppError("Contact message not found", 404);
  }
  return message;
}
