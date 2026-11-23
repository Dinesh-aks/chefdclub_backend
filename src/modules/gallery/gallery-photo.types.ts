export type GalleryPhotoCategory = "all" | "veg" | "non-veg";

export interface GalleryPhotoRecord {
  id: number;
  name: string | null;
  image: string;
  imageUrl: string;
  category: GalleryPhotoCategory;
}

export interface GalleryPhotoInput {
  name?: string;
  category: GalleryPhotoCategory;
  imageFilename: string;
}

export type GalleryPhotoUpdateInput = Partial<Omit<GalleryPhotoInput, "imageFilename">> & {
  imageFilename?: string;
};

// Public shape: only what a gallery card shows.
export interface PublicGalleryPhoto {
  id: number;
  name: string | null;
  imageUrl: string;
}
