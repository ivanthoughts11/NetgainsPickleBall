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
     * A slot is booked when it falls inside
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
  } catch (e) {
    console.error(e);

    return NextResponse.json(
      { error: "Could not load available slots." },
      { status: 500 }
    );
  }
}

/*
 * POST
 * Creates a booking for one or more consecutive hours.
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
     * Must be at least 1 hour.
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
     * Make sure the booking is within operating hours.
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
     * Check for overlapping bookings.
     *
     * Example existing:
     * 06:00 - 09:00
     *
     * New:
     * 08:00 - 10:00
     *
     * This is rejected.
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
     */
    const booking = await prisma.booking.create({
      data: {
        reference: reference(),
        courtId: court.id,
        date: new Date(`${date}T00:00:00`),

        startTime,
        endTime,

        customerName,
        email,
        phone,

        players: Number(players),
        notes,

        status: "CONFIRMED",
      },
    });

    return NextResponse.json(
      {
        booking,
        hours,
        total: hours * HOURLY_RATE,
      },
      {
        status: 201,
      }
    );
  } catch (e: any) {
    console.error(e);

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
      { status: 500 }
    );
  }
}

