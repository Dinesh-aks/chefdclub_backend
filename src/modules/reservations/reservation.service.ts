import { AppError } from "../../utils/AppError.js";
import * as reservationRepository from "./reservation.repository.js";
import type { ReservationListQuery } from "./reservation.validator.js";
import type {
  CreateReservationInput,
  ReservationCreated,
  ReservationRecord,
  ReservationStatus,
} from "./reservation.types.js";

export interface ReservationPageResult {
  items: ReservationRecord[];
  page: number;
  limit: number;
  offset: number;
  total: number;
  totalPages: number;
}

export async function createReservation(input: CreateReservationInput): Promise<ReservationCreated> {
  return reservationRepository.insertReservation(input);
}

export async function listReservations(query: ReservationListQuery): Promise<ReservationPageResult> {
  const { items, total } = await reservationRepository.listPage(query);
  // totalPages is at least 1 so the UI always has a page to show.
  return {
    items,
    page: query.page,
    limit: query.limit,
    offset: query.offset,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

export async function getReservation(id: number): Promise<ReservationRecord> {
  const reservation = await reservationRepository.findById(id);
  if (!reservation) {
    throw new AppError("Reservation not found", 404);
  }
  return reservation;
}

export async function updateReservationStatus(
  id: number,
  status: ReservationStatus
): Promise<ReservationRecord> {
  // Ensure it exists first so a missing id returns 404 instead of a Prisma error.
  await getReservation(id);
  return reservationRepository.updateStatus(id, status);
}

export async function updateReservationAdminComments(
  id: number,
  adminComments: string | null,
): Promise<ReservationRecord> {
  await getReservation(id);
  return reservationRepository.updateAdminComments(id, adminComments);
}
