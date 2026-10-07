import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

function verifySignature(
  rawBody: string,
  signatureHeader: string,
  webhookSecret: string
) {
  const parts = signatureHeader.split(",");

  const timestamp = parts
    .find((part) => part.startsWith("t="))
    ?.slice(2);

  const testSignature = parts
    .find((part) => part.startsWith("te="))
    ?.slice(3);

  if (!timestamp || !testSignature) {
    return false;
  }

  const signedPayload = `${timestamp}.${rawBody}`;

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(signedPayload)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(testSignature, "utf8");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function POST(request: Request) {
  try {
    // IMPORTANT:
    // Read the raw body before JSON.parse().
    const rawBody = await request.text();

    const signatureHeader = request.headers.get("Paymongo-Signature");

    if (!signatureHeader) {
      return NextResponse.json(
        { error: "Missing Paymongo-Signature header." },
        { status: 401 }
      );
    }

    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("PAYMONGO_WEBHOOK_SECRET is not configured.");

      return NextResponse.json(
        { error: "Webhook secret is not configured." },
        { status: 500 }
      );
    }

    const isValid = verifySignature(
      rawBody,
      signatureHeader,
      webhookSecret
    );

    if (!isValid) {
      console.error("Invalid PayMongo webhook signature.");

      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);

    const event = payload?.data?.attributes;

    if (!event) {
      return NextResponse.json(
        { received: true },
        { status: 200 }
      );
    }

    const eventType = event.type;

    console.log("PayMongo webhook:", eventType);

    if (eventType !== "checkout_session.payment.paid") {
      return NextResponse.json({
        received: true,
        ignored: true,
        eventType,
      });
    }

    const session = event.data;

    const sessionId = session?.id;
    const attributes = session?.attributes;

    const reference = attributes?.reference_number;

    if (!reference) {
      console.error(
        "PayMongo webhook missing reference_number:",
        payload
      );

      return NextResponse.json(
        { error: "Missing booking reference." },
        { status: 400 }
      );
    }

    const payment = attributes?.payments?.[0];

    const paymentId = payment?.id;

    if (!paymentId) {
      console.error(
        "PayMongo webhook missing payment ID:",
        payload
      );

      return NextResponse.json(
        { error: "Missing payment ID." },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: {
        reference,
      },
    });

    if (!booking) {
      console.error(
        `Booking not found for reference: ${reference}`
      );

      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    // Idempotency:
    // PayMongo may retry webhook deliveries.
    if (
      booking.paymentStatus === "PAID" &&
      booking.paymentId === paymentId
    ) {
      return NextResponse.json({
        received: true,
        alreadyProcessed: true,
      });
    }

    await prisma.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
        paymentMethod:
          payment?.attributes?.source?.type || null,
        paymentId,
        paidAt: new Date(),
      },
    });

    console.log(
      `Booking ${reference} marked as PAID and CONFIRMED.`,
      {
        sessionId,
        paymentId,
      }
    );

    return NextResponse.json({
      received: true,
      success: true,
      bookingReference: reference,
    });
  } catch (error) {
    console.error(
      "POST /api/payments/webhook error:",
      error
    );

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}