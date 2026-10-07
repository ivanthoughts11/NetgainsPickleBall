import Link from "next/link";

type SuccessPageProps = {
  searchParams: Promise<{
    reference?: string;
  }>;
};

export default async function BookingSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams;
  const reference = params.reference;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center shadow-2xl backdrop-blur md:p-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
            <svg
              className="h-10 w-10 text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
            NET GAINS
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            Payment Successful!
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-slate-300">
            Thank you for your booking. We received your payment and your
            reservation is being processed.
          </p>

          {reference && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm text-slate-400">Booking Reference</p>
              <p className="mt-2 break-all font-mono text-lg font-semibold text-white">
                {reference}
              </p>
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-left">
            <p className="text-sm text-amber-200">
              <strong>Important:</strong> Your booking confirmation is based on
              the payment confirmation received by NET GAINS. Please keep your
              booking reference for your records.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Back to Home
            </Link>

            <Link
              href="/"
              className="rounded-xl border border-white/15 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Make Another Booking
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}