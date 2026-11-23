import { AppError } from "../../utils/AppError.js";
import { buildAdminListResponse } from "../../utils/adminListQuery.js";
import * as filmsRepository from "./films.repository.js";
import type { FilmListQuery, PublicFilmQuery } from "./films.validator.js";
import type {
  FilmDetail,
  FilmInput,
  FilmRecord,
  FilmUpdateInput,
} from "./films.types.js";

export async function listPublicVideos(query: PublicFilmQuery) {
  const { items, total } = await filmsRepository.listPublicPage(query);
  return buildAdminListResponse(items, total, query);
}

export async function listVideos(query: FilmListQuery) {
  const { items, total } = await filmsRepository.listPage(query);
  return buildAdminListResponse(items, total, query);
}

export async function getVideo(id: number): Promise<FilmRecord> {
  const video = await filmsRepository.findById(id);
  if (!video) {
    throw new AppError("Film not found", 404);
  }
  return video;
}

export async function getVideoDetail(id: number): Promise<FilmDetail> {
  const video = await filmsRepository.findDetailById(id);
  if (!video) {
    throw new AppError("Film not found", 404);
  }
  return video;
}

export async function updateVideo(
  id: number,
  input: FilmUpdateInput,
): Promise<FilmDetail> {
  await getVideo(id);
  return filmsRepository.update(id, input);
}

export async function createVideo(input: FilmInput): Promise<FilmRecord> {
  return filmsRepository.create(input);
}

export async function deleteVideo(id: number): Promise<void> {
  await getVideo(id);
  await filmsRepository.remove(id);
}
