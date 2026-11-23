export interface SocialLinkRecord {
  id: number;
  link: string;
  icon: string;
}

export interface SocialLinkInput {
  link: string;
  icon: string;
}

export type SocialLinkUpdateInput = Partial<SocialLinkInput>;
