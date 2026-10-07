import Link from "next/link";

type CancelPageProps = {
  searchParams: Promise<{
    reference?: string;
  }>;
};

export default async function BookingCancelPage({
  searchParams,
}: CancelPageProps) {
  const params = await searchParams;
  const reference = params.reference;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center shadow-2xl backdrop-blur md:p-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/15">
            <svg
              className="h-10 w-10 text-amber-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 17h.01"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.3 3.8L2.9 16.6A2 2 0 004.6 19.6h14.8a2 2 0 001.7-3L13.7 3.8a2 2 0 00-3.4 0z"
              />
            </svg>
          </div>

          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-400">
            NET GAINS
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            Payment Cancelled
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-slate-300">
            Your payment was not completed. Your booking has not been confirmed
            yet.
          </p>

          {reference && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm text-slate-400">Booking Reference</p>
              <p className="mt-2 break-all font-mono text-lg font-semibold text-white">
                {reference}
              </p>
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left">
            <p className="text-sm leading-6 text-slate-300">
              You can return to the booking page and choose another time or
              try the payment again.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Return to Booking
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}