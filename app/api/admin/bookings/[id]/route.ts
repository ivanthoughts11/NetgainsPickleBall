
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValid, cookieName } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

// PATCH - Update booking status
export async function PATCH(
  req: Request,
  { params }: Params
) {
  const c = await cookies();

  if (!isValid(c.get(cookieName)?.value)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const { status } = await req.json();

  if (
    !["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].includes(
      status
    )
  ) {
    return NextResponse.json(
      { error: "Invalid status" },
      { status: 400 }
    );
  }

  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(booking);
  } catch {
    return NextResponse.json(
      { error: "Booking not found or update failed" },
      { status: 404 }
    );
  }
}

// DELETE - Delete pending and unpaid bookings only
export async function DELETE(
  _req: Request,
  { params }: Params
) {
  const c = await cookies();

  if (!isValid(c.get(cookieName)?.value)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    // Only delete bookings that are pending and unpaid.
    const result = await prisma.booking.deleteMany({
      where: {
        id,
        status: "PENDING",
        paymentStatus: "UNPAID",
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        {
          error:
            "Booking not found or cannot be deleted. Only pending, unpaid bookings can be deleted.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
      id,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}