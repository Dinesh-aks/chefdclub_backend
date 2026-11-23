// Where a card shows on the homepage: beside the headline, or in the dining story section.
export type SpotlightPlacement = "hero" | "story";

// Admin shape: everything the edit form needs.
export interface SpotlightRecord {
  id: number;
  title: string;
  tag: string | null;
  badge: string | null;
  placement: SpotlightPlacement;
  image: string | null;
  imageUrl: string | null;
  alt: string | null;
  status: boolean;
  sort: number;
}

// Public shape: only what the homepage renders.
export interface PublicSpotlight {
  id: number;
  title: string;
  tag: string | null;
  badge: string | null;
  imageUrl: string | null;
  alt: string | null;
}

export interface SpotlightInput {
  title: string;
  tag: string | null;
  badge: string | null;
  placement: SpotlightPlacement;
  alt: string | null;
  status: boolean;
  sort: number;
  imageFilename?: string;
}

export type SpotlightUpdateInput = Partial<SpotlightInput>;
