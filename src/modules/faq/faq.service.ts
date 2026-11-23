import { AppError } from "../../utils/AppError.js";
import { buildAdminListResponse } from "../../utils/adminListQuery.js";
import * as faqRepository from "./faq.repository.js";
import type { FaqListQuery } from "./faq.validator.js";
import type { FaqCategory, FaqInput, FaqRecord, FaqUpdateInput } from "./faq.types.js";

export async function listFaqs(query: FaqListQuery) {
  const { items, total } = await faqRepository.listPage(query);
  return buildAdminListResponse(items, total, query);
}

export async function listHomeFaqs(): Promise<FaqRecord[]> {
  return faqRepository.listPublishedHome();
}

export async function listFaqsByCategory(category: FaqCategory): Promise<FaqRecord[]> {
  return faqRepository.listPublishedByCategory(category);
}

export async function getFaq(id: number): Promise<FaqRecord> {
  const faq = await faqRepository.findById(id);
  if (!faq) {
    throw new AppError("FAQ not found", 404);
  }
  return faq;
}

export async function createFaq(input: FaqInput): Promise<FaqRecord> {
  return faqRepository.create(input);
}

export async function updateFaq(id: number, input: FaqUpdateInput): Promise<FaqRecord> {
  await getFaq(id);
  return faqRepository.update(id, input);
}

export async function deleteFaq(id: number): Promise<void> {
  await getFaq(id);
  await faqRepository.remove(id);
}
