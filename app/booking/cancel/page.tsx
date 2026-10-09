
import Link from "next/link";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";

export default async function BookingCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50 px-4 py-12">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />

      <section className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl shadow-orange-900/10">
        <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500" />

        <div className="px-6 py-10 text-center sm:px-10 sm:py-12">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-50 ring-8 ring-amber-50/60">
            <XCircle
              className="h-14 w-14 text-amber-500"
              strokeWidth={1.7}
            />
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-amber-600">
            NET GAINS PICKLEBALL CLUB
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Payment Cancelled
          </h1>

          <p className="mx-auto mt-4 max-w-sm leading-7 text-gray-500">
            Your checkout was cancelled or interrupted. No need to worry—you
            can return to your booking and try again.
          </p>

          {reference && (
            <div className="mt-8 rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                Booking Reference
              </p>
              <p className="mt-2 break-all font-mono text-sm font-bold text-gray-800">
                {reference}
              </p>
            </div>
          )}

          <div className="mt-8 rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">
            If you were charged, please check your payment status before
            attempting another payment.
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-4 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-gray-800"
            >
              <RefreshCw className="h-5 w-5" />
              Return to Homepage
            </Link>

            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to NET GAINS
            </Link>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            Need help? Contact NET GAINS Pickleball Club.
          </p>
        </div>
      </section>
    </main>
  );
}

