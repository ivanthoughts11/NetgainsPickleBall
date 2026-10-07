import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CLOSE_HOUR,
  OPEN_HOUR,
  HOURLY_RATE,
  reference,
} from "@/lib/booking";

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

/*
 * GET
 * Returns all hourly slots and marks a slot as booked
 * if it overlaps an existing booking.
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
      where: {
        courtId: court.id,
        date: new Date(`${date}T00:00:00`),
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    /*
     * A slot is booked when it overlaps
     * an existing booking.
     *
     * Example:
     * Booking = 06:00 - 09:00
     *
     * 06:00 -> booked
     * 07:00 -> booked
     * 08:00 -> booked
     * 09:00 -> available
     */
    const result = slots().map((slot) => {
      const slotStart = timeToMinutes(slot.startTime);
      const slotEnd = timeToMinutes(slot.endTime);

      const booked = bookings.some((booking) => {
        const bookingStart = timeToMinutes(
          booking.startTime
        );

        const bookingEnd = timeToMinutes(
          booking.endTime
        );

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
  } catch (e) {
    console.error(e);

    return NextResponse.json(
      {
        error: "Could not load available slots.",
      },
      { status: 500 }
    );
  }
}

/*
 * POST
 * Creates a booking for one or more consecutive hours.
 *
 * IMPORTANT:
 * The booking is NOT confirmed yet.
 *
 * It starts as:
 *
 * status        = PENDING
 * paymentStatus = UNPAID
 *
 * PayMongo will confirm the booking after
 * successful payment.
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

    /*
     * Validate required fields.
     */
    if (
      !date ||
      !startTime ||
      !endTime ||
      !customerName ||
      !email ||
      !phone
    ) {
      return NextResponse.json(
        {
          error: "Please complete all required fields.",
        },
        { status: 400 }
      );
    }

    /*
     * Find active court.
     */
    const court = await prisma.court.findFirst({
      where: {
        active: true,
      },
    });

    if (!court) {
      return NextResponse.json(
        {
          error: "No active court.",
        },
        { status: 404 }
      );
    }

    /*
     * Validate start and end times.
     */
    const availableSlots = slots();

    const startSlot = availableSlots.find(
      (slot) => slot.startTime === startTime
    );

    const endSlot = availableSlots.find(
      (slot) => slot.endTime === endTime
    );

    if (!startSlot || !endSlot) {
      return NextResponse.json(
        {
          error: "Invalid booking time.",
        },
        { status: 400 }
      );
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    /*
     * End time must be after start time.
     */
    if (endMinutes <= startMinutes) {
      return NextResponse.json(
        {
          error: "Invalid booking duration.",
        },
        { status: 400 }
      );
    }

    /*
     * Calculate number of hours.
     */
    const hours = (endMinutes - startMinutes) / 60;

    /*
     * Make sure the booking is a whole number
     * of hours.
     */
    if (!Number.isInteger(hours)) {
      return NextResponse.json(
        {
          error: "Booking duration must be in whole hours.",
        },
        { status: 400 }
      );
    }

    /*
     * Make sure the booking is within
     * operating hours.
     */
    if (
      startMinutes < OPEN_HOUR * 60 ||
      endMinutes > CLOSE_HOUR * 60
    ) {
      return NextResponse.json(
        {
          error: "Booking is outside operating hours.",
        },
        { status: 400 }
      );
    }

    /*
     * Calculate total price.
     *
     * Example:
     *
     * 3 hours × ₱500 = ₱1,500
     */
    const total = hours * HOURLY_RATE;

    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json(
        {
          error: "Invalid booking amount.",
        },
        { status: 400 }
      );
    }

    /*
     * PayMongo uses the smallest currency unit.
     *
     * ₱500   = 50000 centavos
     * ₱1000  = 100000 centavos
     * ₱1500  = 150000 centavos
     */
    const amountInCentavos = Math.round(
      total * 100
    );

    /*
     * Check for overlapping bookings.
     */
    const existingBookings =
      await prisma.booking.findMany({
        where: {
          courtId: court.id,
          date: new Date(`${date}T00:00:00`),
          status: {
            not: "CANCELLED",
          },
        },
        select: {
          startTime: true,
          endTime: true,
        },
      });

    const hasOverlap = existingBookings.some(
      (booking) => {
        const bookingStart = timeToMinutes(
          booking.startTime
        );

        const bookingEnd = timeToMinutes(
          booking.endTime
        );

        return (
          startMinutes < bookingEnd &&
          endMinutes > bookingStart
        );
      }
    );

    if (hasOverlap) {
      return NextResponse.json(
        {
          error:
            "One or more of the selected time slots have already been booked. Please choose another time.",
        },
        { status: 409 }
      );
    }

    /*
     * Create the booking.
     *
     * IMPORTANT:
     *
     * We do NOT set CONFIRMED here.
     *
     * Payment has not happened yet.
     */
    const booking = await prisma.booking.create({
      data: {
        reference: reference(),

        courtId: court.id,

        date: new Date(
          `${date}T00:00:00`
        ),

        startTime,
        endTime,

        customerName,
        email,
        phone,

        players: Number(players),

        notes: notes || null,

        /*
         * Payment flow
         */
        status: "PENDING",
        paymentStatus: "UNPAID",

        /*
         * Store amount in centavos.
         */
        amount: amountInCentavos,

        /*
         * These will be filled by the
         * PayMongo webhook later.
         */
        paymentMethod: null,
        paymentId: null,
        paidAt: null,
      },
    });

    /*
     * Return booking information.
     *
     * We will use booking.id/reference
     * in the next PayMongo API step.
     */
    return NextResponse.json(
      {
        booking,
        hours,
        hourlyRate: HOURLY_RATE,

        // Human-readable amount
        total,

        // PayMongo-ready amount
        amountInCentavos,
      },
      {
        status: 201,
      }
    );
  } catch (e: any) {
    console.error(
      "POST /api/bookings error:",
      e
    );

    /*
     * Prisma unique constraint.
     */
    if (e?.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "That time was just booked. Please choose another.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Could not create booking.",
      },
      {
        status: 500,
      }
    );
  }
}