
import Link from "next/link";
import { CheckCircle2, CalendarDays, ArrowRight } from "lucide-react";

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-4 py-12">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-lime-200/40 blur-3xl" />

      <section className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl shadow-emerald-900/10">
        <div className="h-2 bg-gradient-to-r from-emerald-500 to-lime-400" />

        <div className="px-6 py-10 text-center sm:px-10 sm:py-12">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60">
            <CheckCircle2
              className="h-14 w-14 text-emerald-500"
              strokeWidth={1.7}
            />
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-emerald-600">
            NET GAINS PICKLEBALL CLUB
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Payment Successful!
          </h1>

          <p className="mx-auto mt-4 max-w-sm leading-7 text-gray-500">
            Thank you for booking with us! Your payment return was successful.
            We look forward to seeing you on the court.
          </p>

          {reference && (
            <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Booking Reference
              </p>
              <p className="mt-2 break-all font-mono text-sm font-bold text-gray-800">
                {reference}
              </p>
            </div>
          )}

          <div className="mt-8 flex items-start gap-3 rounded-xl bg-gray-50 p-4 text-left">
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-sm leading-6 text-gray-600">
              Keep your booking reference for future inquiries. Your booking
              confirmation should reflect the payment status once verified.
            </p>
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700"
          >
            Back to Homepage
            <ArrowRight className="h-5 w-5" />
          </Link>

          <p className="mt-6 text-xs text-gray-400">
            Thank you for playing with NET GAINS.
          </p>
        </div>
      </section>
    </main>
  );
}

