
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CLOSE_HOUR,
  OPEN_HOUR,
  HOURLY_RATE,
  reference,
} from "@/lib/booking";

const PENDING_HOLD_MINUTES = 15;

function slots() {
  return Array.from(
    { length: CLOSE_HOUR - OPEN_HOUR },
    (_, i) => {
      const h = OPEN_HOUR + i;

      return {
        startTime: `${String(h).padStart(2, "0")}:00`,
        endTime: `${String(h + 1).padStart(2, "0")}:00`,
      };
    }
  );
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Returns bookings that should currently block a court slot.
 *
 * CANCELLED bookings never block availability.
 * CONFIRMED, COMPLETED, and PAID bookings block availability.
 * PENDING_VERIFICATION bookings remain blocked until resolved.
 * PENDING + UNPAID bookings hold a slot for 15 minutes.
 */
function activeBookingFilter(courtId: string, date: Date) {
  const holdCutoff = new Date(
    Date.now() - PENDING_HOLD_MINUTES * 60 * 1000
  );

  return {
    courtId,
    date,
    status: {
      not: "CANCELLED" as const,
    },
    OR: [
      {
        status: "CONFIRMED" as const,
      },
      {
        status: "COMPLETED" as const,
      },
      {
        paymentStatus: "PAID" as const,
      },
      {
        paymentStatus: "PENDING_VERIFICATION" as const,
      },
      {
        status: "PENDING" as const,
        paymentStatus: "UNPAID" as const,
        createdAt: {
          gte: holdCutoff,
        },
      },
    ],
  };
}

/**
 * GET /api/bookings?date=YYYY-MM-DD
 *
 * Returns hourly slots and whether each slot is booked.
 */
export async function GET(req: Request) {
  try {
    const date = new URL(req.url).searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "date required" },
        { status: 400 }
      );
    }

    // Validate date format and calendar date.
    if (!isValidDateString(date)) {
      return NextResponse.json(
        { error: "Invalid date." },
        { status: 400 }
      );
    }

    const court = await prisma.court.findFirst({
      where: {
        active: true,
      },
    });

    if (!court) {
      return NextResponse.json(
        { error: "No active court." },
        { status: 404 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: activeBookingFilter(
        court.id,
        new Date(`${date}T00:00:00`)
      ),
      select: {
        startTime: true,
        endTime: true,
      },
    });

    const result = slots().map((slot) => {
      const slotStart = timeToMinutes(slot.startTime);
      const slotEnd = timeToMinutes(slot.endTime);

      const booked = bookings.some((booking) => {
        const bookingStart = timeToMinutes(booking.startTime);
        const bookingEnd = timeToMinutes(booking.endTime);

        return (
          slotStart < bookingEnd &&
          slotEnd > bookingStart
        );
      });

      return {
        ...slot,
        booked,
      };
    });

    return NextResponse.json({
      slots: result,
      court,
      rate: HOURLY_RATE,
    });
  } catch (error) {
    console.error("GET /api/bookings error:", error);

    return NextResponse.json(
      { error: "Could not load available slots." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookings
 *
 * Creates a booking with PENDING + UNPAID status.
 * PayMongo webhook handles payment confirmation.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      date,
      startTime,
      endTime,
      customerName,
      email,
      phone,
      players = 2,
      notes,
    } = body;

    // Validate required fields.
    if (
      !date ||
      !startTime ||
      !endTime ||
      !customerName ||
      !email ||
      !phone
    ) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (!isValidDateString(date)) {
      return NextResponse.json(
        { error: "Invalid date." },
        { status: 400 }
      );
    }

    if (
      typeof customerName !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      !customerName.trim() ||
      !email.trim() ||
      !phone.trim()
    ) {
      return NextResponse.json(
        { error: "Please provide valid customer details." },
        { status: 400 }
      );
    }

    const numberOfPlayers = Number(players);

    if (
      !Number.isInteger(numberOfPlayers) ||
      numberOfPlayers < 1
    ) {
      return NextResponse.json(
        { error: "Invalid number of players." },
        { status: 400 }
      );
    }

    // Find active court.
    const court = await prisma.court.findFirst({
      where: {
        active: true,
      },
    });

    if (!court) {
      return NextResponse.json(
        { error: "No active court." },
        { status: 404 }
      );
    }

    // Validate booking times against available hourly slots.
    const availableSlots = slots();

    const startSlot = availableSlots.find(
      (slot) => slot.startTime === startTime
    );

    const endSlot = availableSlots.find(
      (slot) => slot.endTime === endTime
    );

    if (!startSlot || !endSlot) {
      return NextResponse.json(
        { error: "Invalid booking time." },
        { status: 400 }
      );
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (endMinutes <= startMinutes) {
      return NextResponse.json(
        { error: "Invalid booking duration." },
        { status: 400 }
      );
    }

    if (
      startMinutes < OPEN_HOUR * 60 ||
      endMinutes > CLOSE_HOUR * 60
    ) {
      return NextResponse.json(
        { error: "Booking is outside operating hours." },
        { status: 400 }
      );
    }

    const hours = (endMinutes - startMinutes) / 60;

    if (!Number.isInteger(hours) || hours <= 0) {
      return NextResponse.json(
        { error: "Booking duration must be in whole hours." },
        { status: 400 }
      );
    }

    // Calculate booking amount.
    const total = hours * HOURLY_RATE;

    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json(
        { error: "Invalid booking amount." },
        { status: 400 }
      );
    }

    // PayMongo expects the amount in centavos.
    const amountInCentavos = Math.round(total * 100);

    const bookingDate = new Date(`${date}T00:00:00`);

    // Check for overlaps with bookings that still hold their slots.
    const existingBookings = await prisma.booking.findMany({
      where: activeBookingFilter(court.id, bookingDate),
      select: {
        startTime: true,
        endTime: true,
      },
    });

    const hasOverlap = existingBookings.some((booking) => {
      const bookingStart = timeToMinutes(booking.startTime);
      const bookingEnd = timeToMinutes(booking.endTime);

      return (
        startMinutes < bookingEnd &&
        endMinutes > bookingStart
      );
    });

    if (hasOverlap) {
      return NextResponse.json(
        {
          error:
            "One or more selected time slots are unavailable. Please choose another time.",
        },
        { status: 409 }
      );
    }

    // Create a pending booking. It is not confirmed until payment succeeds.
    const booking = await prisma.booking.create({
      data: {
        reference: reference(),
        courtId: court.id,
        date: bookingDate,
        startTime,
        endTime,
        customerName: customerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        players: numberOfPlayers,
        notes:
          typeof notes === "string" && notes.trim()
            ? notes.trim()
            : null,
        status: "PENDING",
        paymentStatus: "UNPAID",
        amount: amountInCentavos,
        paymentMethod: null,
        paymentId: null,
        paidAt: null,
      },
    });

    return NextResponse.json(
      {
        booking,
        hours,
        hourlyRate: HOURLY_RATE,
        total,
        amountInCentavos,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/bookings error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "That booking reference already exists. Please try again.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Could not create booking." },
      { status: 500 }
    );
  }
}

/**
 * Validate YYYY-MM-DD and reject invalid calendar dates.
 */
function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}