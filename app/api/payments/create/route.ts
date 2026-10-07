import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAYMONGO_API_URL =
  "https://api.paymongo.com/v2/checkout_sessions";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        {
          error: "bookingId is required.",
        },
        { status: 400 }
      );
    }

    /*
     * Find the booking.
     */
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          error: "Booking not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Do not create another payment session
     * for an already-paid booking.
     */
    if (booking.paymentStatus === "PAID") {
      return NextResponse.json(
        {
          error: "This booking has already been paid.",
        },
        { status: 400 }
      );
    }

    /*
     * Make sure the booking has an amount.
     */
    if (!booking.amount || booking.amount <= 0) {
      return NextResponse.json(
        {
          error: "Invalid booking amount.",
        },
        { status: 400 }
      );
    }

    /*
     * Make sure the secret key exists.
     */
    const secretKey = process.env.PAYMONGO_SECRET_KEY;

    if (!secretKey) {
      console.error(
        "PAYMONGO_SECRET_KEY is not configured."
      );

      return NextResponse.json(
        {
          error: "Payment system is not configured.",
        },
        { status: 500 }
      );
    }

    /*
     * Your website URL.
     *
     * For local development this will be:
     * http://localhost:3000
     *
     * Later, set NEXT_PUBLIC_APP_URL to your
     * production domain.
     */
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    /*
     * Create PayMongo Checkout Session.
     */
    const response = await fetch(
      PAYMONGO_API_URL,
      {
        method: "POST",

        headers: {
          Authorization: `Basic ${Buffer.from(
            `${secretKey}:`
          ).toString("base64")}`,

          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          data: {
            attributes: {
              /*
               * Booking price.
               *
               * Example:
               * ₱1,500 = 150000
               */
              line_items: [
                {
                  amount: booking.amount,
                  currency: "PHP",
                  name: "Pickleball Court Booking",
                  description: `${booking.startTime} - ${booking.endTime}`,
                  quantity: 1,
                },
              ],

              /*
               * Payment methods we want to show.
               *
               * We can add/remove these later.
               */
              payment_method_types: [
                "card",
                "gcash",
                "qrph",
              ],

              /*
               * Customer gets redirected here
               * after successful checkout.
               */
              success_url:
                `${appUrl}/booking/success` +
                `?reference=${encodeURIComponent(
                  booking.reference
                )}`,

              /*
               * Customer gets redirected here
               * if they cancel/go back.
               */
              cancel_url:
                `${appUrl}/booking/cancel` +
                `?reference=${encodeURIComponent(
                  booking.reference
                )}`,

              /*
               * Our own booking reference.
               */
              reference_number:
                booking.reference,

              /*
               * Useful information that PayMongo
               * sends back with the checkout session.
               */
              metadata: {
                booking_id: booking.id,
                booking_reference:
                  booking.reference,
              },

              /*
               * Let PayMongo send a payment receipt
               * to the customer's email.
               */
              send_email_receipt: true,

              /*
               * Show booking information on
               * the checkout page.
               */
              show_description: true,
              show_line_items: true,
            },
          },
        }),
      }
    );

    const data = await response.json();

    /*
     * PayMongo returned an error.
     */
    if (!response.ok) {
      console.error(
        "PayMongo API error:",
        data
      );

      return NextResponse.json(
        {
          error:
            data?.errors?.[0]?.detail ||
            "Unable to create payment checkout.",
        },
        {
          status: response.status,
        }
      );
    }

    /*
     * Extract Checkout Session.
     */
    const checkoutSession =
      data?.data;

    const checkoutUrl =
      checkoutSession?.attributes
        ?.checkout_url;

    if (!checkoutUrl) {
      console.error(
        "PayMongo response missing checkout_url:",
        data
      );

      return NextResponse.json(
        {
          error:
            "PayMongo did not return a checkout URL.",
        },
        { status: 500 }
      );
    }

    /*
     * Return checkout information
     * to the frontend.
     */
    return NextResponse.json({
      success: true,

      checkoutUrl,

      checkoutSessionId:
        checkoutSession.id,

      bookingId: booking.id,

      reference:
        booking.reference,
    });
  } catch (error) {
    console.error(
      "POST /api/payments/create error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not create payment checkout.",
      },
      { status: 500 }
    );
  }
}