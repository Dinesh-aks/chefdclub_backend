export type FilmCategory = "all" | "veg" | "non-veg" | "private-dining";

export type FilmPlatform = "youtube" | "facebook" | "unknown";

export interface FilmRecord {
  id: number;
  category: FilmCategory;
  addDate: Date;
  platform: FilmPlatform;
  embedUrl: string | null;
  thumbnailUrl: string | null;
}

// By-id shape for the edit form: also carries the stored link or embed code.
export interface FilmDetail extends FilmRecord {
  source: string;
}

export interface FilmInput {
  category: FilmCategory;
  source: string;
}

export type FilmUpdateInput = Partial<FilmInput>;

// Public shape: only what a film card and its player need.
export interface PublicFilm {
  id: number;
  category: FilmCategory;
  platform: FilmPlatform;
  embedUrl: string | null;
  thumbnailUrl: string | null;
}
