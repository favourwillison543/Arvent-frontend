// lib/utils/seats.ts

export function getGuestSeats(
    additionalGuestCount: number,
  ): number {
    return 1 + additionalGuestCount;
  }
  
  export function getConfirmedSeats(
    guests: Array<{
      rsvpStatus: string;
      additionalGuestCount: number;
    }>,
  ): number {
    return guests.reduce((total, guest) => {
      if (guest.rsvpStatus !== "going") {
        return total;
      }
  
      return total + getGuestSeats(guest.additionalGuestCount);
    }, 0);
  }
  
  export function getRemainingSeats(
    capacity: number | null,
    confirmedSeats: number,
  ): number | null {
    if (capacity === null) {
      return null;
    }
  
    return Math.max(capacity - confirmedSeats, 0);
  }
  
  export function canAddSeats(
    capacity: number | null,
    confirmedSeats: number,
    seatsToAdd: number,
  ): boolean {
    if (capacity === null) {
      return true;
    }
  
    return confirmedSeats + seatsToAdd <= capacity;
  }
  
  export function getMaxAdditionalGuests(
    seatLimit: number,
  ): number {
    return Math.max(seatLimit - 1, 0);
}

export type RsvpBreakdown = {
    rsvp: "going" | "maybe" | "declined" | "pending";
    plusOnes: number;
    checkedIn: number;
    reconfirm: "none" | "asked" | "confirmed" | "cannot";
  };

  /** `Event.draft.capacity` is a free-text field; normalise it to a number. */
  export function toCapacity(
    capacity: string | number | null | undefined,
  ): number | null {
    if (capacity === null || capacity === undefined || capacity === "") {
      return null;
    }

    const value = Number(capacity);

    return Number.isFinite(value) && value > 0 ? value : null;
  }

  /**
   * The head count and RSVP breakdown shown on the dashboard header, the guest
   * panel and the door screen.
   */
  export function computeStats(
    guests: RsvpBreakdown[],
    capacity?: string | number | null,
  ) {
    const going = guests.filter((guest) => guest.rsvp === "going");

    return {
      invited: guests.length,
      going: going.length,
      maybe: guests.filter((guest) => guest.rsvp === "maybe").length,
      declined: guests.filter((guest) => guest.rsvp === "declined").length,
      pending: guests.filter((guest) => guest.rsvp === "pending").length,
      headcount: going.reduce(
        (total, guest) => total + 1 + guest.plusOnes,
        0,
      ),
      arrivedGuests: guests.filter((guest) => guest.checkedIn > 0).length,
      arrivedPeople: guests.reduce(
        (total, guest) => total + guest.checkedIn,
        0,
      ),
      capacity: toCapacity(capacity),
      confirmed: going.filter((guest) => guest.reconfirm === "confirmed")
        .length,
      cannot: going.filter((guest) => guest.reconfirm === "cannot").length,
      awaiting: going.filter(
        (guest) => guest.reconfirm === "asked" || guest.reconfirm === "none",
      ).length,
    };
}
