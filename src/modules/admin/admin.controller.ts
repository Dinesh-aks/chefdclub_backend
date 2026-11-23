import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as reservationRepository from "../reservations/reservation.repository.js";
import * as contactRepository from "../contact/contact.repository.js";
import * as faqRepository from "../faq/faq.repository.js";

// Admin home: monthly counts plus the latest reservations and messages in one call.
export const getDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [reservationsThisMonth, messagesThisMonth, faqsPublished, recentReservations, recentMessages] =
      await Promise.all([
        reservationRepository.countThisMonth(),
        contactRepository.countThisMonth(),
        faqRepository.countPublished(),
        reservationRepository.listRecent(5),
        contactRepository.listRecent(5),
      ]);

    sendSuccess(res, {
      greeting: `Welcome back, ${req.admin?.firstName ?? "Admin"}.`,
      stats: { reservationsThisMonth, messagesThisMonth, faqsPublished },
      recentReservations,
      recentMessages,
    });
  } catch (error) {
    next(error);
  }
};
