import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import { assertReservationTurnstile } from "../../utils/turnstile.js";
import {
  parseReservationId,
  parseReservationListQuery,
  validateAdminComments,
  validateCreateReservation,
  validateReservationStatus,
} from "./reservation.validator.js";
import * as reservationService from "./reservation.service.js";

export const createReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { input, turnstileToken } = validateCreateReservation(req.body);
    // Bot check runs after validation so bad payloads fail fast.
    await assertReservationTurnstile(turnstileToken, req);
    const result = await reservationService.createReservation(input);
    sendSuccess(res, result, "Reservation request received. We will confirm by email.", 201);
  } catch (error) {
    next(error);
  }
};

export const listReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = parseReservationListQuery(req.query as Record<string, unknown>);
    const result = await reservationService.listReservations(query);
    sendSuccess(res, result, "Reservations fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const getReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseReservationId(req.params.id);
    const reservation = await reservationService.getReservation(id);
    sendSuccess(res, reservation, "Reservation fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const updateReservationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseReservationId(req.params.id);
    const status = validateReservationStatus(req.body);
    const reservation = await reservationService.updateReservationStatus(id, status);
    sendSuccess(res, reservation, "Reservation status updated successfully.");
  } catch (error) {
    next(error);
  }
};

export const updateReservationAdminComments = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseReservationId(req.params.id);
    const adminComments = validateAdminComments(req.body);
    const reservation = await reservationService.updateReservationAdminComments(id, adminComments);
    sendSuccess(res, reservation, "Admin comments saved.");
  } catch (error) {
    next(error);
  }
};
