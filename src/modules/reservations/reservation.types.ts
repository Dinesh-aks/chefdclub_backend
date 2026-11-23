export interface CreateReservationInput {
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  time?: string;
  format: string;
  guestCount: number;
  menu: string;
  winePairing: string;
  occasion?: string;
}

export interface ReservationCreated {
  id: number;
}

/** Matches the distinct values actually present in the legacy `reservation.status`
 * column — "Declined" and "Rejection" both occur in real data (a legacy
 * inconsistency), so both are kept as valid rather than picked between. */
export type ReservationStatus = "Reviewing" | "Accept" | "Declined" | "Rejection" | "Completed";

export interface ReservationRecord {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  guest: number | null;
  request: string | null;
  restrictions: string | null;
  adminComments: string | null;
  date: Date | null;
  time: Date | null;
  status: string;
  addDate: Date;
}
