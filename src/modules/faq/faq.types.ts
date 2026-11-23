export type FaqCategory = "veg" | "non-veg" | "wine-pairing";

export interface FaqRecord {
  id: number;
  question: string;
  answer: string;
  sort: number;
  status: boolean;
  category: FaqCategory;
}

/** A row in the admin list: everything except the (potentially long) answer HTML. */
export type FaqListItem = Omit<FaqRecord, "answer">;

export interface FaqInput {
  question: string;
  answer: string;
  sort: number;
  status: boolean;
  category: FaqCategory;
}

export type FaqUpdateInput = Partial<FaqInput>;
